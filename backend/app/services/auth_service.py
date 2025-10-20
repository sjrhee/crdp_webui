from app.core.config import settings


def verify_credentials(username: str, password: str) -> bool:
    """
    Demo credential check. In real apps, replace with DB lookup + hashed password verification.
    Credentials can be overridden via environment variables DEMO_USERNAME / DEMO_PASSWORD.
    """
    demo_user = getattr(settings, "DEMO_USERNAME", "demo")
    demo_pass = getattr(settings, "DEMO_PASSWORD", "demo")
    return username == demo_user and password == demo_pass
