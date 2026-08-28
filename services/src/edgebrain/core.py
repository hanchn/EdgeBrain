from __future__ import annotations

import io
import json
import os
from pathlib import Path
from typing import Any
from uuid import uuid4

import httpx
from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image, UnidentifiedImageError
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session, sessionmaker

from .automation import OllamaAutomationGenerator, TeachingExampleGenerator
from .models import Base, Component, ControlJob, KnowledgeEntry
from .schemas import (
    AutomationGenerateRead,
    AutomationGenerateRequest,
    ComponentCreate,
    ComponentRead,
    ControlJobRead,
    ControlRequest,
    KnowledgeEntryCreate,
    KnowledgeEntryRead,
    MediaUploadRead,
)

# FastAPI 使用 Depends/File 作为参数默认值来声明依赖和上传字段。
# ruff 的通用 B008 规则不理解这个框架约定。
# ruff: noqa: B008

MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_IMAGE_PIXELS = 25_000_000
ALLOWED_IMAGE_FORMATS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}
ALLOWED_CAPABILITIES = {
    "light.turn_on": {},
    "light.turn_off": {},
    "light.set_brightness": {"brightness": (0, 100)},
}


def create_core_app(
    database_url: str | None = None,
    media_root: Path | None = None,
    agent_url: str | None = None,
    agent_transport: httpx.AsyncBaseTransport | None = None,
) -> FastAPI:
    root = media_root or Path(os.getenv("EDGEBRAIN_MEDIA_ROOT", "data/media"))
    component_media = root / "components"
    component_media.mkdir(parents=True, exist_ok=True)

    db_url = database_url or os.getenv("EDGEBRAIN_DATABASE_URL", "sqlite:///data/edgebrain.db")
    if db_url.startswith("sqlite:///"):
        db_path = Path(db_url.removeprefix("sqlite:///"))
        db_path.parent.mkdir(parents=True, exist_ok=True)
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, expire_on_commit=False)

    app = FastAPI(title="EdgeBrain Core API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.mount("/media", StaticFiles(directory=root), name="media")
    app.state.session_factory = session_factory
    app.state.agent_url = agent_url or os.getenv("EDGEBRAIN_AGENT_URL", "http://127.0.0.1:8101")
    app.state.agent_transport = agent_transport

    ai_provider = os.getenv("EDGEBRAIN_AI_PROVIDER", "teaching_example")
    if ai_provider == "ollama":
        app.state.automation_generator = OllamaAutomationGenerator(
            os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434"),
            os.getenv("OLLAMA_MODEL", "qwen3:4b"),
        )
        app.state.ai_source = "ollama"
    else:
        app.state.automation_generator = TeachingExampleGenerator()
        app.state.ai_source = "teaching_example"

    def get_session(request: Request):
        session = request.app.state.session_factory()
        try:
            yield session
        finally:
            session.close()

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "core"}

    @app.get("/api/system/overview")
    def overview(session: Session = Depends(get_session)) -> dict[str, Any]:
        component_count = session.scalar(select(func.count()).select_from(Component)) or 0
        knowledge_count = session.scalar(select(func.count()).select_from(KnowledgeEntry)) or 0
        return {
            "components": component_count,
            "controllers": 0,
            "devices": 1,
            "online_devices": 1,
            "ai_provider": app.state.ai_source,
            "hardware_mode": "simulation",
            "knowledge_entries": knowledge_count,
            "learning_mode": "review_required",
        }

    @app.get("/api/knowledge", response_model=list[KnowledgeEntryRead])
    def list_knowledge(session: Session = Depends(get_session)) -> list[KnowledgeEntry]:
        return list(session.scalars(select(KnowledgeEntry).order_by(KnowledgeEntry.id.desc())))

    @app.post("/api/knowledge", response_model=KnowledgeEntryRead, status_code=201)
    def create_knowledge(
        payload: KnowledgeEntryCreate, session: Session = Depends(get_session)
    ) -> KnowledgeEntry:
        entry = KnowledgeEntry(**payload.model_dump(), status="staged")
        session.add(entry)
        session.commit()
        session.refresh(entry)
        return entry

    @app.get("/api/learning/overview")
    def learning_overview(session: Session = Depends(get_session)) -> dict[str, Any]:
        staged = (
            session.scalar(
                select(func.count())
                .select_from(KnowledgeEntry)
                .where(KnowledgeEntry.status == "staged")
            )
            or 0
        )
        approved = (
            session.scalar(
                select(func.count())
                .select_from(KnowledgeEntry)
                .where(KnowledgeEntry.status == "approved")
            )
            or 0
        )
        return {
            "runtime": "hermes-compatible",
            "write_policy": "review_required",
            "staged_entries": staged,
            "approved_entries": approved,
            "physical_control_policy_mutable": False,
        }

    @app.get("/api/marketplace/providers")
    def marketplace_providers() -> list[dict[str, Any]]:
        return [
            {
                "id": "1688",
                "name": "1688 商品搜索",
                "status": "unconfigured",
                "adapter": "skill",
                "recommended_skill": "linkfox-1688-procurement",
            }
        ]

    @app.get("/api/marketplace/search")
    def marketplace_search(q: str) -> dict[str, Any]:
        if not q.strip():
            raise HTTPException(status_code=422, detail="请输入商品关键词")
        raise HTTPException(status_code=503, detail="1688 Skill 尚未安装或配置")

    @app.get("/api/components", response_model=list[ComponentRead])
    def list_components(session: Session = Depends(get_session)) -> list[Component]:
        return list(session.scalars(select(Component).order_by(Component.id.desc())))

    @app.post("/api/components", response_model=ComponentRead, status_code=201)
    def create_component(
        payload: ComponentCreate, session: Session = Depends(get_session)
    ) -> Component:
        component = Component(**payload.model_dump())
        session.add(component)
        session.commit()
        session.refresh(component)
        return component

    @app.get("/api/components/{component_id}", response_model=ComponentRead)
    def get_component(component_id: int, session: Session = Depends(get_session)) -> Component:
        component = session.get(Component, component_id)
        if component is None:
            raise HTTPException(status_code=404, detail="配件档案不存在")
        return component

    @app.post("/api/media/images", response_model=MediaUploadRead, status_code=201)
    async def upload_image(image: UploadFile = File(...)) -> MediaUploadRead:
        content = await image.read(MAX_IMAGE_BYTES + 1)
        if len(content) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=413, detail="图片不能超过 5 MB")
        try:
            with Image.open(io.BytesIO(content)) as parsed:
                image_format = parsed.format
                if parsed.width * parsed.height > MAX_IMAGE_PIXELS:
                    raise HTTPException(status_code=413, detail="图片像素尺寸过大")
                parsed.verify()
        except (UnidentifiedImageError, OSError) as exc:
            raise HTTPException(
                status_code=415, detail="只支持有效的 JPG、PNG 或 WEBP 图片"
            ) from exc
        if image_format not in ALLOWED_IMAGE_FORMATS:
            raise HTTPException(status_code=415, detail="只支持 JPG、PNG 或 WEBP 图片")
        filename = f"{uuid4().hex}{ALLOWED_IMAGE_FORMATS[image_format]}"
        destination = component_media / filename
        destination.write_bytes(content)
        return MediaUploadRead(
            path=f"/media/components/{filename}",
            content_type=f"image/{image_format.lower()}",
            size=len(content),
        )

    @app.get("/api/devices")
    async def devices(request: Request) -> Any:
        try:
            async with httpx.AsyncClient(
                transport=request.app.state.agent_transport,
                base_url=request.app.state.agent_url,
                timeout=3,
            ) as client:
                response = await client.get("/devices")
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=503, detail="本地硬件代理不可用") from exc

    @app.post("/api/control-jobs", response_model=ControlJobRead, status_code=201)
    async def create_control_job(
        payload: ControlRequest,
        request: Request,
        session: Session = Depends(get_session),
    ) -> ControlJobRead:
        constraints = ALLOWED_CAPABILITIES.get(payload.capability)
        if constraints is None:
            raise HTTPException(status_code=422, detail="能力未进入安全白名单")
        for name, (minimum, maximum) in constraints.items():
            value = payload.parameters.get(name)
            if not isinstance(value, int) or not minimum <= value <= maximum:
                raise HTTPException(status_code=422, detail=f"{name} 参数越界")

        job_id = str(uuid4())
        job = ControlJob(
            id=job_id,
            device_id=payload.device_id,
            capability=payload.capability,
            status="running",
            parameters_json=json.dumps(payload.parameters, ensure_ascii=False),
        )
        session.add(job)
        session.commit()
        try:
            async with httpx.AsyncClient(
                transport=request.app.state.agent_transport,
                base_url=request.app.state.agent_url,
                timeout=5,
            ) as client:
                response = await client.post(
                    f"/devices/{payload.device_id}/execute",
                    json={
                        "command_id": job_id,
                        "capability": payload.capability,
                        "parameters": payload.parameters,
                    },
                )
                response.raise_for_status()
                result = response.json()
            job.status = "succeeded"
        except httpx.TimeoutException:
            result = {"detail": "设备控制超时"}
            job.status = "timed_out"
        except httpx.HTTPError:
            result = {"detail": "设备控制失败"}
            job.status = "failed"
        job.result_json = json.dumps(result, ensure_ascii=False)
        session.commit()
        return ControlJobRead(
            id=job.id,
            device_id=job.device_id,
            capability=job.capability,
            status=job.status,
            result=result,
        )

    @app.post("/api/automations/generate", response_model=AutomationGenerateRead)
    async def generate_automation(
        payload: AutomationGenerateRequest, request: Request
    ) -> AutomationGenerateRead:
        try:
            program = await request.app.state.automation_generator.generate(payload.prompt)
        except (httpx.HTTPError, ValueError, KeyError, json.JSONDecodeError) as exc:
            raise HTTPException(status_code=502, detail="本地模型未能生成有效积木程序") from exc
        return AutomationGenerateRead(
            source=request.app.state.ai_source,
            requires_confirmation=True,
            program=program,
        )

    return app


app = create_core_app()
