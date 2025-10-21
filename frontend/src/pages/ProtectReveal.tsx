import { useState } from 'react';
import api from '../lib/api';
import type { AxiosError } from 'axios';

interface ProtectResponse {
  status_code: number;
  protected_data?: string;
  error?: string;
}

interface RevealResponse {
  status_code: number;
  data?: string;
  error?: string;
}

interface BulkProtectResponse {
  status_code: number;
  protected_data_array?: string[];
  error?: string;
}

interface BulkRevealResponse {
  status_code: number;
  data_array?: string[];
  error?: string;
}

type ProgressEntry =
  | {
      stage: 'protect';
      request: { protection_policy_name: string; data: string };
      response: ProtectResponse;
    }
  | {
      stage: 'reveal';
      request: { protection_policy_name: string; protected_data: string };
      response: RevealResponse;
    }
  | {
      stage: 'protect_bulk';
      request: { protection_policy_name: string; data_array: string[] };
      response: BulkProtectResponse;
    }
  | {
      stage: 'reveal_bulk';
      request: { protection_policy_name: string; protected_data_array: string[] };
      response: BulkRevealResponse;
    };

export function ProtectReveal() {
  const [protectInput, setProtectInput] = useState('1234567890123');
  const [host, setHost] = useState('192.168.0.231');
  const [port, setPort] = useState('32082');
  const [policy, setPolicy] = useState('P03');
  const [protectResult, setProtectResult] = useState<ProtectResponse | null>(null);
  const [protectLoading, setProtectLoading] = useState(false);

  const [revealInput, setRevealInput] = useState('');
  const [revealResult, setRevealResult] = useState<RevealResponse | null>(null);
  const [revealLoading, setRevealLoading] = useState(false);

  const [bulkProtectInput, setBulkProtectInput] = useState('1234567890123\n1234567890124\n1234567890125');
  const [bulkProtectResult, setBulkProtectResult] = useState<BulkProtectResponse | null>(null);
  const [bulkProtectLoading, setBulkProtectLoading] = useState(false);
  const [progressLog, setProgressLog] = useState<ProgressEntry[]>([]);
  const [bulkRevealInput, setBulkRevealInput] = useState('');
  const [bulkRevealResult, setBulkRevealResult] = useState<BulkRevealResponse | null>(null);
  const [bulkRevealLoading, setBulkRevealLoading] = useState(false);

  const parseError = (e: unknown): { status: number; message: string } => {
    if (typeof e === 'object' && e !== null) {
      const err = e as AxiosError<{ detail?: string }>;
      const status = err.response?.status ?? 500;
      const message = err.response?.data?.detail ?? err.message ?? 'Unknown error';
      return { status, message };
    }
    return { status: 500, message: String(e) };
  };

  const handleProtect = async () => {
    setProtectLoading(true);
    setProtectResult(null);
    setProgressLog([]);
    try {
      if (!/^[0-9]{13}$/.test(protectInput)) {
        throw new Error('입력은 정확히 13자리 숫자여야 합니다.');
      }

      const response = await api.post('/api/crdp/protect', {
        data: protectInput,
        policy,
        host,
        port: parseInt(port, 10),
      });
      setProgressLog((p) => [
        ...p,
        { stage: 'protect', request: { protection_policy_name: policy, data: protectInput }, response: response.data },
      ]);
      setProtectResult(response.data);
      if (response.data.protected_data) {
        setRevealInput(response.data.protected_data);
      }
    } catch (error: unknown) {
      const info = parseError(error);
      setProtectResult({ status_code: info.status, error: info.message });
    } finally {
      setProtectLoading(false);
    }
  };

  const handleReveal = async () => {
    setRevealLoading(true);
    setRevealResult(null);
    try {
      const response = await api.post('/api/crdp/reveal', {
        protected_data: revealInput,
        policy,
        host,
        port: parseInt(port, 10),
      });
      setProgressLog((p) => [
        ...p,
        { stage: 'reveal', request: { protection_policy_name: policy, protected_data: revealInput }, response: response.data },
      ]);
      setRevealResult(response.data);
    } catch (error: unknown) {
      const info = parseError(error);
      setRevealResult({ status_code: info.status, error: info.message });
    } finally {
      setRevealLoading(false);
    }
  };

  const handleBulkProtect = async () => {
    setBulkProtectLoading(true);
    setBulkProtectResult(null);
    setProgressLog([]);
    try {
      const dataArray = bulkProtectInput
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const response = await api.post('/api/crdp/protect-bulk', {
        data_array: dataArray,
        policy,
        host,
        port: parseInt(port, 10),
      });
      setProgressLog((p) => [
        ...p,
        { stage: 'protect_bulk', request: { protection_policy_name: policy, data_array: dataArray }, response: response.data },
      ]);
      setBulkProtectResult(response.data);
    } catch (error: unknown) {
      const info = parseError(error);
      setBulkProtectResult({ status_code: info.status, error: info.message });
    } finally {
      setBulkProtectLoading(false);
    }
  };

  const handleBulkReveal = async () => {
    setBulkRevealLoading(true);
    setBulkRevealResult(null);
    setProgressLog([]);
    try {
      const protectedArray = bulkRevealInput
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const response = await api.post('/api/crdp/reveal-bulk', {
        protected_data_array: protectedArray,
        policy,
        host,
        port: parseInt(port, 10),
      });
      setProgressLog((p) => [
        ...p,
        {
          stage: 'reveal_bulk',
          request: { protection_policy_name: policy, protected_data_array: protectedArray },
          response: response.data,
        },
      ]);
      setBulkRevealResult(response.data);
    } catch (error: unknown) {
      const info = parseError(error);
      setBulkRevealResult({ status_code: info.status, error: info.message });
    } finally {
      setBulkRevealLoading(false);
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <span className="brand-dot" />
          <div className="brand-title">CRDP Protect/Reveal</div>
          <div className="spacer" />
          <span className="tag">미니멀 테스트 도구</span>
        </div>
      </header>
      <main className="container">
        <h1 className="page-title">Protect / Reveal</h1>
        <p className="page-desc">데이터 암호화/복호화를 빠르게 검증하는 간단한 도구입니다.</p>

        <div className="grid-2">
          <div className="card grid-span-2">
            <div className="card-body">
              <div className="form-row">
                <div className="form-group" style={{ minWidth: 160 }}>
                  <label>CRDP IP</label>
                  <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="예: 192.168.0.231" />
                </div>
                <div className="form-group" style={{ minWidth: 120 }}>
                  <label>CRDP Port</label>
                  <input value={port} onChange={(e) => setPort(e.target.value)} placeholder="예: 32082" />
                </div>
                <div className="form-group" style={{ minWidth: 120 }}>
                  <label>Policy</label>
                  <input value={policy} onChange={(e) => setPolicy(e.target.value)} placeholder="예: P03" />
                </div>
                <div className="spacer" />
                <div className="actions">
                  <button
                    onClick={() => {
                      setProtectInput('1234567890123');
                      setRevealInput('');
                      setBulkProtectInput('1234567890123\n1234567890124\n1234567890125');
                      setProtectResult(null);
                      setRevealResult(null);
                      setBulkProtectResult(null);
                      setBulkRevealResult(null);
                      setBulkRevealInput('');
                      setProgressLog([]);
                    }}
                    className="btn btn-secondary"
                  >
                    리셋
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2>🔒 Protect (암호화)</h2>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>원본 데이터</label>
                <input
                  type="text"
                  value={protectInput}
                  onChange={(e) => setProtectInput(e.target.value)}
                  placeholder="암호화할 데이터 입력"
                />
              </div>
              <button onClick={handleProtect} disabled={protectLoading || !protectInput} className="btn btn-primary">
                {protectLoading ? '처리 중...' : 'Protect 실행'}
              </button>

              {protectResult && (
                <div className={`status-box ${protectResult.error ? 'status-err' : 'status-ok'}`}>
                  <div className="row" style={{ marginBottom: 6 }}>
                    <span className="tag">Status</span>
                    <div>{protectResult.status_code}</div>
                  </div>
                  {protectResult.protected_data && (
                    <div>
                      <div className="row" style={{ marginBottom: 6 }}>
                        <span className="tag">Protected Token</span>
                        <div className="spacer" />
                        <button
                          className="btn btn-secondary"
                          onClick={() => navigator.clipboard.writeText(protectResult.protected_data || '')}
                        >
                          복사
                        </button>
                      </div>
                      <div className="code-box">{protectResult.protected_data}</div>
                    </div>
                  )}
                  {protectResult.error && (
                    <div className="row" style={{ color: '#fca5a5' }}>
                      <span className="tag">Error</span>
                      <div>{protectResult.error}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2>🔓 Reveal (복호화)</h2>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Protected Token</label>
                <input
                  type="text"
                  value={revealInput}
                  onChange={(e) => setRevealInput(e.target.value)}
                  placeholder="복호화할 토큰 입력"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace' }}
                />
              </div>
              <button onClick={handleReveal} disabled={revealLoading || !revealInput} className="btn btn-success">
                {revealLoading ? '처리 중...' : 'Reveal 실행'}
              </button>

              {revealResult && (
                <div className={`status-box ${revealResult.error ? 'status-err' : 'status-ok'}`}>
                  <div className="row" style={{ marginBottom: 6 }}>
                    <span className="tag">Status</span>
                    <div>{revealResult.status_code}</div>
                  </div>
                  {revealResult.data && (
                    <div>
                      <div className="row" style={{ marginBottom: 6 }}>
                        <span className="tag">Revealed Data</span>
                        <div className="spacer" />
                        <button
                          className="btn btn-secondary"
                          onClick={() => navigator.clipboard.writeText(revealResult.data || '')}
                        >
                          복사
                        </button>
                      </div>
                      <div className="code-box">{revealResult.data}</div>
                    </div>
                  )}
                  {revealResult.error && (
                    <div className="row" style={{ color: '#fca5a5' }}>
                      <span className="tag">Error</span>
                      <div>{revealResult.error}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: 24 }}>
          <div className="card">
            <div className="card-body">
              <h2>📦 Bulk Protect (대량 암호화)</h2>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>데이터 배열 (한 줄에 하나씩)</label>
                <textarea
                  value={bulkProtectInput}
                  onChange={(e) => setBulkProtectInput(e.target.value)}
                  placeholder="암호화할 데이터를 한 줄씩 입력"
                  rows={5}
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace' }}
                />
              </div>
              <button onClick={handleBulkProtect} disabled={bulkProtectLoading || !bulkProtectInput.trim()} className="btn btn-purple">
                {bulkProtectLoading ? '처리 중...' : 'Bulk Protect 실행'}
              </button>

              {bulkProtectResult && (
                <div className={`status-box ${bulkProtectResult.error ? 'status-err' : 'status-ok'}`}>
                  <div className="row" style={{ marginBottom: 6 }}>
                    <span className="tag">Status</span>
                    <div>{bulkProtectResult.status_code}</div>
                  </div>
                  {bulkProtectResult.protected_data_array && (
                    <div>
                      <div className="row" style={{ marginBottom: 6 }}>
                        <span className="tag">Protected Tokens</span>
                        <div className="spacer" />
                        <button
                          className="btn btn-secondary"
                          onClick={() =>
                            setBulkRevealInput((bulkProtectResult.protected_data_array || []).join('\n'))
                          }
                          title="결과 토큰들을 Bulk Reveal 입력칸으로 보냅니다"
                        >
                          → Bulk Reveal로
                        </button>
                        <div style={{ width: 8 }} />
                        <span className="muted">{bulkProtectResult.protected_data_array.length}개</span>
                      </div>
                      <div className="code-box" style={{ maxHeight: 220, overflow: 'auto' }}>
                        {bulkProtectResult.protected_data_array.map((token: string, idx: number) => (
                          <div key={idx} style={{ padding: '4px 0' }}>
                            {idx + 1}. {token}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {bulkProtectResult.error && (
                    <div className="row" style={{ color: '#fca5a5' }}>
                      <span className="tag">Error</span>
                      <div>{bulkProtectResult.error}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2>📦 Bulk Reveal (대량 복호화)</h2>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Protected Token 배열 (한 줄에 하나씩)</label>
                <textarea
                  value={bulkRevealInput}
                  onChange={(e) => setBulkRevealInput(e.target.value)}
                  placeholder="복호화할 토큰을 한 줄씩 입력"
                  rows={5}
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace' }}
                />
              </div>
              <button onClick={handleBulkReveal} disabled={bulkRevealLoading || !bulkRevealInput.trim()} className="btn btn-success">
                {bulkRevealLoading ? '처리 중...' : 'Bulk Reveal 실행'}
              </button>

              {bulkRevealResult && (
                <div className={`status-box ${bulkRevealResult.error ? 'status-err' : 'status-ok'}`}>
                  <div className="row" style={{ marginBottom: 6 }}>
                    <span className="tag">Status</span>
                    <div>{bulkRevealResult.status_code}</div>
                  </div>
                  {bulkRevealResult.data_array && (
                    <div>
                      <div className="row" style={{ marginBottom: 6 }}>
                        <span className="tag">Revealed Data</span>
                        <div className="spacer" />
                        <span className="muted">{bulkRevealResult.data_array.length}개</span>
                      </div>
                      <div className="code-box" style={{ maxHeight: 220, overflow: 'auto' }}>
                        {bulkRevealResult.data_array.map((val: string, idx: number) => (
                          <div key={idx} style={{ padding: '4px 0' }}>
                            {idx + 1}. {val}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {bulkRevealResult.error && (
                    <div className="row" style={{ color: '#fca5a5' }}>
                      <span className="tag">Error</span>
                      <div>{bulkRevealResult.error}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <h3>진행 로그 (Progress)</h3>
          <pre
            className="code-box"
            style={{ overflow: 'auto', maxHeight: 260, textAlign: 'left' }}
          >
            {JSON.stringify(progressLog, null, 2)}
          </pre>
        </div>
      </main>
    </>
  );
}
