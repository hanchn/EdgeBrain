export type KnowledgeCategory = '架构与决策' | '产品需求' | '设备与控制器' | '运行流程' | '学习记录'
export type KnowledgeStatus = '已索引' | '待审核' | '需更新'

export interface SystemKnowledgeFile {
  id: string
  title: string
  path: string
  category: KnowledgeCategory
  type: 'Markdown' | 'JSON' | '系统记录'
  status: KnowledgeStatus
  source: string
  version: string
  updated: string
  chunks: number
  summary: string
  content: string
  tags: string[]
}

export const systemKnowledgeFiles: SystemKnowledgeFile[] = [
  { id: 'system-architecture', title: '系统总体架构 v0.1', path: 'docs/architecture/system-architecture-v0.1.md', category: '架构与决策', type: 'Markdown', status: '已索引', source: '项目文档', version: 'v0.1', updated: '今天 09:42', chunks: 18, summary: '电脑端、Hardware Agent、Core API、本地模型与未来 ARM64 迁移边界。', tags: ['架构', 'ARM64', '端侧AI'], content: '# 系统总体架构\n\nEdgeBrain 采用 UI、Core API、Hardware Agent、端侧模型四层结构。硬件访问只允许通过 Hardware Agent，业务层不得直接调用蓝牙、串口或 GPIO。\n\n## 运行边界\n\n- UI：设备、方案、编程与知识管理。\n- Core API：业务数据、权限、审计与任务编排。\n- Hardware Agent：蓝牙、串口、GPIO 与安全急停。\n- Local AI：意图解析、积木生成、知识检索。' },
  { id: 'runtime-adr', title: '平台与设备运行时决策', path: 'docs/decisions/ADR-0001-platform-and-device-runtime.md', category: '架构与决策', type: 'Markdown', status: '已索引', source: '架构决策', version: 'ADR-0001', updated: '昨天 17:20', chunks: 12, summary: '确定 Web UI + 本地服务 + 独立硬件代理的跨平台技术路线。', tags: ['ADR', '运行时', '安全'], content: '# ADR-0001 平台与设备运行时\n\n选择 Vue 桌面管理端、FastAPI Core 与独立 Hardware Agent。设备驱动采用适配器接口，桌面蓝牙与树莓派 GPIO 共用能力契约。' },
  { id: 'visual-programming', title: '积木编程与端侧 AI 需求', path: 'docs/requirements/visual-programming-ai.json', category: '产品需求', type: 'JSON', status: '已索引', source: '需求存档', version: 'v1', updated: '今天 11:18', chunks: 9, summary: 'Scratch 风格积木、JSON 导入导出、本地模型生成和运行确认规则。', tags: ['Blockly', 'JSON', '本地模型'], content: '# 积木编程与端侧 AI\n\n积木程序必须覆盖连接、传感、判断、执行、安全和日志流程。AI 只生成草稿，不可绕过人工确认直接运行真实硬件。' },
  { id: 'solution-catalog', title: '技术方案清单需求', path: 'docs/requirements/solution-catalog.json', category: '产品需求', type: 'JSON', status: '已索引', source: '需求存档', version: 'v1', updated: '今天 10:56', chunks: 8, summary: '基础、进阶、高阶方案，以及采购清单、编程依赖和培训文档。', tags: ['方案', 'BOM', '培训'], content: '# 技术方案清单\n\n每个方案包含等级、控制器、采购清单、搭建步骤、编程能力与 Markdown 培训文档。列表和详情必须使用独立页面。' },
  { id: 'marketplace-1688', title: '1688 商城接入边界', path: 'docs/requirements/marketplace-1688.json', category: '产品需求', type: 'JSON', status: '需更新', source: '需求存档', version: 'v1', updated: '今天 11:50', chunks: 7, summary: '商品搜索、真实来源、默认图片、采购候选与高风险操作边界。', tags: ['1688', '采购', 'Skill'], content: '# 1688 商城接入\n\n只读选品可自动执行；下单、支付和取消订单属于高风险操作，必须单独确认。商品无图片时统一使用硬件占位图。' },
  { id: 'voice-ble', title: '声控开关与蓝牙小灯需求', path: 'docs/requirements/voice-and-ble-light.json', category: '设备与控制器', type: 'JSON', status: '已索引', source: '硬件需求', version: 'v1', updated: '昨天 16:30', chunks: 11, summary: '语音意图、本地推理、BLE 连接和低压灯具安全控制链路。', tags: ['BLE', '灯具', '语音'], content: '# 声控开关与蓝牙小灯\n\n真实流程：扫描设备 → 连接 → 发现服务 → 读取状态 → 人工确认 → 写入控制指令 → 校验反馈 → 记录日志。' },
  { id: 'component-schema', title: '配件与控制器档案规则', path: 'docs/requirements/requirement.json', category: '设备与控制器', type: 'JSON', status: '已索引', source: '业务规则', version: 'v1', updated: '前天 14:12', chunks: 14, summary: '配件名称、采购店铺、价格、图片、控制器绑定与详细描述。', tags: ['配件', '控制器', '采购'], content: '# 配件与控制器档案\n\n每个硬件必须关联对应控制器、图片、采购来源、价格和详细说明。图片缺失时使用默认占位图，但必须标记待补图。' },
  { id: 'self-learning', title: '自学习知识治理规则', path: 'docs/requirements/self-learning-knowledge.json', category: '运行流程', type: 'JSON', status: '已索引', source: '安全规则', version: 'v1', updated: '今天 08:40', chunks: 16, summary: '候选知识暂存、审核、来源追踪、版本替换和不可自优化边界。', tags: ['Hermes', '审核', '治理'], content: '# 自学习知识治理\n\n系统可以积累事实、设备档案、流程、纠正和失败经验。新知识只能进入待审核区；能力白名单、危险参数、确认规则和急停规则不可自行修改。' },
  { id: 'foundation-validation', title: 'Foundation 0 验证记录', path: 'docs/evidence/foundation-0-validation.md', category: '学习记录', type: '系统记录', status: '已索引', source: '自动验证', version: 'run-001', updated: '今天 11:51', chunks: 10, summary: '前后端构建、自动测试、模拟设备和页面主流程验证证据。', tags: ['测试', '证据', '回归'], content: '# Foundation 0 验证记录\n\n前端类型检查、单元测试和生产构建通过；FastAPI 测试通过；模拟 BLE 小灯、方案清单、积木编辑器与知识暂存流程可运行。' },
]

// 补齐旧数据中省略的标签，避免每条样例重复占用空间。
for (const file of systemKnowledgeFiles) file.tags ??= []
