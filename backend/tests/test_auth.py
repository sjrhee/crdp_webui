from fastapi.testclient import TestClient
from app.main import app


def test_login_and_me_and_items():
    client = TestClient(app)

    # login
    r = client.post("/api/auth/login", data={"username": "demo", "password": "demo"})
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    assert token

    # me
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["username"] == "demo"

    # items
    r = client.get("/api/items", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) >= 1
