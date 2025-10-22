from fastapi import HTTPException, status

class CRDPConnectionError(HTTPException):
    """CRDP 서버 연결 실패"""
    def __init__(self, detail: str = "Failed to connect to CRDP server"):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=detail
        )

class CRDPAPIError(HTTPException):
    """CRDP API 호출 오류"""
    def __init__(self, detail: str, status_code: int = 500):
        super().__init__(
            status_code=status_code,
            detail=detail
        )

class CRDPTimeoutError(HTTPException):
    """CRDP API 타임아웃"""
    def __init__(self, detail: str = "CRDP API request timeout"):
        super().__init__(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=detail
        )

class ValidationError(HTTPException):
    """입력 데이터 검증 오류"""
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail
        )
