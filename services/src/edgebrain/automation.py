from __future__ import annotations

import json
from typing import Protocol

import httpx

from .schemas import AutomationProgram, AutomationStep

SYSTEM_PROMPT = """你是 EdgeBrain 儿童积木自动化生成器。
只输出 JSON，不输出代码或解释。JSON 必须包含 schema_version、name、trigger、steps。
允许的步骤只有 device_command 和 wait。
允许的设备能力只有 light.turn_on、light.turn_off、light.set_brightness。
演示设备固定为 sim-ble-light-001。亮度范围 0 到 100，等待范围 100 到 60000 毫秒。
任何无法表达的请求都返回一个打开演示灯的安全示例。
"""


class AutomationGenerator(Protocol):
    async def generate(self, prompt: str) -> AutomationProgram: ...


class TeachingExampleGenerator:
    async def generate(self, prompt: str) -> AutomationProgram:
        compact = prompt.replace(" ", "")
        steps: list[AutomationStep] = []
        if "亮度" in compact:
            digits = "".join(char for char in compact if char.isdigit())
            brightness = min(100, max(0, int(digits or "60")))
            steps.append(
                AutomationStep(
                    type="device_command",
                    device_id="sim-ble-light-001",
                    capability="light.set_brightness",
                    parameters={"brightness": brightness},
                )
            )
        elif "关" in compact and "开" not in compact:
            steps.append(
                AutomationStep(
                    type="device_command",
                    device_id="sim-ble-light-001",
                    capability="light.turn_off",
                )
            )
        else:
            steps.append(
                AutomationStep(
                    type="device_command",
                    device_id="sim-ble-light-001",
                    capability="light.turn_on",
                )
            )

        if "秒" in compact and "关" in compact:
            digits = "".join(char for char in compact if char.isdigit())
            seconds = min(60, max(1, int(digits or "3")))
            steps.extend(
                [
                    AutomationStep(type="wait", duration_ms=seconds * 1000),
                    AutomationStep(
                        type="device_command",
                        device_id="sim-ble-light-001",
                        capability="light.turn_off",
                    ),
                ]
            )

        return AutomationProgram(name="AI 教学示例", steps=steps)


class OllamaAutomationGenerator:
    def __init__(self, base_url: str, model: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def generate(self, prompt: str) -> AutomationProgram:
        payload = {
            "model": self.model,
            "stream": False,
            "format": "json",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
        }
        async with httpx.AsyncClient(timeout=45) as client:
            response = await client.post(f"{self.base_url}/api/chat", json=payload)
            response.raise_for_status()
        content = response.json()["message"]["content"]
        return AutomationProgram.model_validate(json.loads(content))
