"""작업 단일 반복을 수행하는 실행기.

run_iteration은 제공된 `ProtectRevealClient`를 사용해 protect -> reveal 순서로
요청을 보내고, 소요 시간과 응답을 담은 `IterationResult`를 반환합니다.
"""

import time
from dataclasses import dataclass
from typing import Optional

from .client import APIError, APIResponse, ProtectRevealClient


@dataclass
class IterationResult:
    data: str
    protect_response: APIResponse
    reveal_response: APIResponse
    protected_token: Optional[str]
    restored: Optional[str]
    time_s: float

    @property
    def match(self) -> bool:
        return self.restored == self.data if self.restored is not None else False

    @property
    def success(self) -> bool:
        return self.protect_response.is_success and self.reveal_response.is_success


def run_iteration(client: ProtectRevealClient, data: str, username: Optional[str] = None) -> IterationResult:
    t0 = time.perf_counter()

    protect_payload = {
        "protection_policy_name": client.policy,
        "data": data,
    }
    protect_response = client.post_json(client.protect_url, protect_payload)

    protected_token = client.extract_protected_from_protect_response(protect_response)

    reveal_payload = {"protection_policy_name": client.policy, "protected_data": protected_token or ""}
    if username:
        reveal_payload["username"] = username
    reveal_response = client.post_json(client.reveal_url, reveal_payload)

    restored = client.extract_restored_from_reveal_response(reveal_response)
    t1 = time.perf_counter()

    return IterationResult(
        data=data,
        protect_response=protect_response,
        reveal_response=reveal_response,
        protected_token=protected_token,
        restored=restored,
        time_s=t1 - t0,
    )


@dataclass
class BulkIterationResult:
    inputs: list
    protect_response: APIResponse
    reveal_response: APIResponse
    protected_tokens: list
    restored_values: list
    time_s: float

    @property
    def matches(self) -> list:
        return [r == i for i, r in zip(self.inputs, self.restored_values)]


def run_bulk_iteration(
    client: ProtectRevealClient,
    inputs: list,
    batch_size: int = 25,
    username: Optional[str] = None,
) -> list:
    """Process inputs in batches (default 25) using protect_bulk and reveal_bulk.

    Returns a list of BulkIterationResult, one per batch.
    """
    results = []
    for i in range(0, len(inputs), batch_size):
        batch = inputs[i : i + batch_size]
        t0 = time.perf_counter()
        # protect bulk: catch APIError and convert to APIResponse to continue processing
        try:
            protect_resp = client.protect_bulk(batch)
        except APIError as err:
            # try to extract body from response if available
            resp = getattr(err, 'response', None)
            body = None
            status = getattr(err, 'status_code', None)
            if resp is not None:
                try:
                    body = resp.json()
                except Exception:
                    body = getattr(resp, 'text', None)
                status = getattr(resp, 'status_code', status)
            # Use Thales-compliant payload keys for traceability
            protect_resp = APIResponse(
                status,
                body,
                request_payload={
                    "protection_policy_name": client.policy,
                    "data_array": batch,
                },
                request_url=client.protect_bulk_url,
                request_headers=dict(client.session.headers),
            )

        protected_list = client.extract_protected_list_from_protect_response(protect_resp)

        # reveal bulk expects list of protected tokens — handle APIError similarly
        try:
            if username is not None:
                reveal_resp = client.reveal_bulk(protected_list, username=username)
            else:
                reveal_resp = client.reveal_bulk(protected_list)
        except APIError as err:
            resp = getattr(err, 'response', None)
            body = None
            status = getattr(err, 'status_code', None)
            if resp is not None:
                try:
                    body = resp.json()
                except Exception:
                    body = getattr(resp, 'text', None)
                status = getattr(resp, 'status_code', status)
            # Use Thales-compliant payload keys for traceability; include username if present
            pda = [p if isinstance(p, dict) else {"protected_data": p} for p in protected_list]
            req_payload = {
                "protection_policy_name": client.policy,
                "protected_data_array": pda,
            }
            if username:
                req_payload["username"] = username
            reveal_resp = APIResponse(
                status,
                body,
                request_payload=req_payload,
                request_url=client.reveal_bulk_url,
                request_headers=dict(client.session.headers),
            )

        restored_list = client.extract_restored_list_from_reveal_response(reveal_resp)
        t1 = time.perf_counter()

        results.append(
            BulkIterationResult(
                inputs=batch,
                protect_response=protect_resp,
                reveal_response=reveal_resp,
                protected_tokens=protected_list,
                restored_values=restored_list,
                time_s=t1 - t0,
            )
        )

    return results
