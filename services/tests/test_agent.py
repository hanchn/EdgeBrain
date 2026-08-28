from fastapi.testclient import TestClient

from edgebrain.agent import create_agent_app


def test_simulated_light_control() -> None:
    client = TestClient(create_agent_app())

    response = client.post(
        "/devices/sim-ble-light-001/execute",
        json={"command_id": "test-1", "capability": "light.turn_on", "parameters": {}},
    )

    assert response.status_code == 200
    assert response.json()["state"]["on"] is True


def test_rejects_invalid_brightness() -> None:
    client = TestClient(create_agent_app())

    response = client.post(
        "/devices/sim-ble-light-001/execute",
        json={
            "command_id": "test-2",
            "capability": "light.set_brightness",
            "parameters": {"brightness": 101},
        },
    )

    assert response.status_code == 422
