# EdgeBrain

EdgeBrain 是运行在电脑或 ARM64 边缘主机上的本地 AI 设备控制与管理系统。

当前仓库处于 Foundation 0：包含架构文档、FastAPI Core、本地 Hardware Agent、Vue 管理端、配件档案、知识库、方案清单和 Scratch 风格积木自动化原型。系统采用贯穿式自学习理念，候选知识必须先暂存、审核，再进入长期使用。

界面采用无顶部栏的硬件实验室工作台，左侧菜单可收起并支持近黑深色模式；业务列表、新增和详情使用独立路由。积木编辑器进入时默认收起菜单，AI 以右下角气泡展开；程序支持经过安全校验的 JSON 导入、导出。每个项目均有按绑定硬件生成的虚拟遥控器。

方案清单按基础、进阶、高阶分级，包含采购清单、编程依赖和可编辑、预览、下载的 Markdown 培训文档。商城已保存 1688 Skill 的真实选品结果，无图片时使用统一硬件占位图。

## 本地启动

```bash
uv sync --project services --extra dev
pnpm install
```

分别启动：

```bash
uv run --project services uvicorn edgebrain.agent:app --port 8101
uv run --project services uvicorn edgebrain.core:app --port 8100
pnpm --dir apps/web dev
```

访问 `http://localhost:5173`。默认硬件为模拟 BLE 小灯，不会操作真实设备。

## 测试

```bash
uv run --project services pytest
pnpm --dir apps/web test
pnpm --dir apps/web typecheck
pnpm --dir apps/web build
```

技术与硬件运行时决策见 `docs/decisions/ADR-0001-platform-and-device-runtime.md`。
