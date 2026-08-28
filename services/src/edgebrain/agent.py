from __future__ import annotations

from typing import Any, Protocol

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


class ExecuteRequest(BaseModel):
    command_id: str = Field(min_length=1, max_length=64)
    capability: str
    parameters: dict[str, Any] = Field(default_factory=dict)


class DeviceAdapter(Protocol):
    def list_devices(self) -> list[dict[str, Any]]: ...

    async def execute(
        self, device_id: str, capability: str, parameters: dict[str, Any]
    ) -> dict[str, Any]: ...


class SimulatedBleAdapter:
    def __init__(self) -> None:
        self.state = {"on": False, "brightness": 60}

    def list_devices(self) -> list[dict[str, Any]]:
        return [
            {
                "id": "sim-ble-light-001",
                "name": "模拟蓝牙小灯",
                "transport": "ble-simulator",
                "online": True,
                "state": dict(self.state),
                "capabilities": [
                    "light.turn_on",
                    "light.turn_off",
                    "light.set_brightness",
                ],
            }
        ]

    async def execute(
        self, device_id: str, capability: str, parameters: dict[str, Any]
    ) -> dict[str, Any]:
        if device_id != "sim-ble-light-001":
            raise KeyError("device_not_found")
        if capability == "light.turn_on":
            self.state["on"] = True
        elif capability == "light.turn_off":
            self.state["on"] = False
        elif capability == "light.set_brightness":
            brightness = parameters.get("brightness")
            if not isinstance(brightness, int) or not 0 <= brightness <= 100:
                raise ValueError("brightness_out_of_range")
            self.state.update(on=brightness > 0, brightness=brightness)
        else:
            raise ValueError("capability_not_supported")
        return {"state": dict(self.state), "simulated": True}


def create_agent_app() -> FastAPI:
    app = FastAPI(title="EdgeBrain Hardware Agent", version="0.1.0")
    adapter = SimulatedBleAdapter()
    app.state.adapter = adapter

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "mode": "simulation"}

    @app.get("/devices")
    def devices() -> list[dict[str, Any]]:
        return adapter.list_devices()

    @app.post("/devices/{device_id}/execute")
    async def execute(device_id: str, request: ExecuteRequest) -> dict[str, Any]:
        try:
            result = await adapter.execute(device_id, request.capability, request.parameters)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        return {"command_id": request.command_id, "status": "succeeded", **result}

    return app


app = create_agent_app()
