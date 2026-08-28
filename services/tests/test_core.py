from pathlib import Path

import httpx
from fastapi.testclient import TestClient
from PIL import Image

from edgebrain.agent import create_agent_app
from edgebrain.core import create_core_app


def build_client(tmp_path: Path) -> TestClient:
    agent = create_agent_app()
    transport = httpx.ASGITransport(app=agent)
    core = create_core_app(
        database_url=f"sqlite:///{tmp_path / 'test.db'}",
        media_root=tmp_path / "media",
        agent_url="http://agent.test",
        agent_transport=transport,
    )
    return TestClient(core)


def test_component_requires_uploaded_image(tmp_path: Path) -> None:
    client = build_client(tmp_path)
    response = client.post(
        "/api/components",
        json={"name": "ESP32-S3", "image_path": "https://example.com/image.jpg"},
    )
    assert response.status_code == 422


def test_component_can_use_default_placeholder(tmp_path: Path) -> None:
    client = build_client(tmp_path)
    response = client.post("/api/components", json={"name": "无图传感器"})
    assert response.status_code == 201
    assert response.json()["image_path"] == "/assets/hardware-placeholder.png"


def test_component_image_and_record_flow(tmp_path: Path) -> None:
    client = build_client(tmp_path)
    image_path = tmp_path / "sample.png"
    Image.new("RGB", (16, 16), color="blue").save(image_path)
    with image_path.open("rb") as image_file:
        upload = client.post(
            "/api/media/images",
            files={"image": ("sample.png", image_file, "image/png")},
        )
    assert upload.status_code == 201

    created = client.post(
        "/api/components",
        json={
            "name": "ESP32-S3",
            "model": "N16R8",
            "store_name": "示例店铺",
            "price_cents": 3290,
            "description": "用于控制器方案的主控板",
            "image_path": upload.json()["path"],
        },
    )
    assert created.status_code == 201
    assert client.get("/api/components").json()[0]["name"] == "ESP32-S3"
    assert client.get(f"/api/components/{created.json()['id']}").json()["model"] == "N16R8"
    assert client.get("/api/components/9999").status_code == 404


def test_control_job_uses_safe_capability(tmp_path: Path) -> None:
    client = build_client(tmp_path)
    response = client.post(
        "/api/control-jobs",
        json={
            "device_id": "sim-ble-light-001",
            "capability": "light.set_brightness",
            "parameters": {"brightness": 75},
        },
    )
    assert response.status_code == 201
    assert response.json()["status"] == "succeeded"
    assert response.json()["result"]["state"]["brightness"] == 75


def test_automation_generation_requires_confirmation(tmp_path: Path) -> None:
    client = build_client(tmp_path)
    response = client.post(
        "/api/automations/generate",
        json={"prompt": "打开小灯 3 秒后关闭"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["requires_confirmation"] is True
    assert [step["type"] for step in payload["program"]["steps"]] == [
        "device_command",
        "wait",
        "device_command",
    ]


def test_knowledge_is_staged_for_review(tmp_path: Path) -> None:
    client = build_client(tmp_path)
    response = client.post(
        "/api/knowledge",
        json={
            "title": "模拟小灯亮度范围",
            "kind": "device_profile",
            "content": "亮度只允许 0 到 100。",
            "source": "device-test",
            "confidence": 0.95,
        },
    )
    assert response.status_code == 201
    assert response.json()["status"] == "staged"

    overview = client.get("/api/learning/overview").json()
    assert overview["staged_entries"] == 1
    assert overview["physical_control_policy_mutable"] is False


def test_1688_provider_reports_unconfigured(tmp_path: Path) -> None:
    client = build_client(tmp_path)
    provider = client.get("/api/marketplace/providers").json()[0]
    assert provider["id"] == "1688"
    assert provider["status"] == "unconfigured"
    assert client.get("/api/marketplace/search", params={"q": "ESP32"}).status_code == 503
