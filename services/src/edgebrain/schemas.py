from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ComponentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    model: str = Field(default="", max_length=120)
    store_name: str = Field(default="", max_length=160)
    purchase_url: str = Field(default="", max_length=1000)
    price_cents: int = Field(default=0, ge=0, le=100_000_000)
    description: str = Field(default="", max_length=5000)
    image_path: str = Field(
        default="/assets/hardware-placeholder.png", min_length=1, max_length=500
    )

    @field_validator("image_path")
    @classmethod
    def validate_image_path(cls, value: str) -> str:
        if (
            not value.startswith("/media/components/")
            and value != "/assets/hardware-placeholder.png"
        ):
            raise ValueError("图片路径无效")
        return value


class ComponentRead(ComponentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class MediaUploadRead(BaseModel):
    path: str
    content_type: str
    size: int


class ControlRequest(BaseModel):
    device_id: str = Field(min_length=1, max_length=120)
    capability: str = Field(min_length=1, max_length=160)
    parameters: dict[str, Any] = Field(default_factory=dict)


class ControlJobRead(BaseModel):
    id: str
    device_id: str
    capability: str
    status: Literal["queued", "running", "succeeded", "failed", "timed_out"]
    result: dict[str, Any] = Field(default_factory=dict)


class AutomationStep(BaseModel):
    type: Literal["device_command", "wait"]
    device_id: str | None = None
    capability: str | None = None
    parameters: dict[str, Any] = Field(default_factory=dict)
    duration_ms: int | None = Field(default=None, ge=100, le=60_000)

    @field_validator("capability")
    @classmethod
    def capability_is_whitelisted(cls, value: str | None) -> str | None:
        allowed = {"light.turn_on", "light.turn_off", "light.set_brightness"}
        if value is not None and value not in allowed:
            raise ValueError("自动化包含未允许的能力")
        return value


class AutomationProgram(BaseModel):
    schema_version: Literal["1.0"] = "1.0"
    name: str = Field(min_length=1, max_length=120)
    trigger: Literal["manual", "voice"] = "manual"
    steps: list[AutomationStep] = Field(min_length=1, max_length=50)


class AutomationGenerateRequest(BaseModel):
    prompt: str = Field(min_length=2, max_length=1000)


class AutomationGenerateRead(BaseModel):
    source: Literal["ollama", "teaching_example"]
    requires_confirmation: Literal[True] = True
    program: AutomationProgram


class KnowledgeEntryCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    kind: Literal["fact", "procedure", "correction", "failure", "device_profile"]
    content: str = Field(min_length=1, max_length=10_000)
    source: str = Field(default="manual", max_length=500)
    confidence: float = Field(default=1.0, ge=0, le=1)


class KnowledgeEntryRead(KnowledgeEntryCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: Literal["staged", "approved", "rejected", "superseded"]
    created_at: datetime
