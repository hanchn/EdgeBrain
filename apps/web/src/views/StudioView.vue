<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ChatDotRound, Close, Connection, RefreshLeft, RefreshRight } from '@element-plus/icons-vue'
import * as Blockly from 'blockly/core'
import 'blockly/blocks'
import * as ZhHansMessages from 'blockly/msg/zh-hans'
import { requestJson } from '@/api'
import { parseAutomationProgram, programToBlockDescriptors, type AutomationProgram } from '@/automationProgram'
import { programs } from '@/programData'

const route = useRoute()
const currentProgram = computed(() => programs.find(item => item.id === route.params.id))
const host = ref<HTMLDivElement | null>(null)
const prompt = ref('打开小灯，3 秒后关闭')
const generating = ref(false)
const generated = ref<AutomationProgram | null>(null)
const source = ref('')
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const aiOpen = ref(false)
const blockCount = ref(0)
let workspace: Blockly.WorkspaceSvg | null = null

Blockly.setLocale(ZhHansMessages as unknown as Record<string, string>)
const edgeBlockDefinitions = [
  { type: 'edge_when_run', message0: '当程序开始运行', nextStatement: null, colour: 38, hat: 'cap', tooltip: '程序的起点' },
  { type: 'edge_when_connected', message0: '当 %1 连接成功', args0: [{ type: 'field_dropdown', name: 'DEVICE', options: [['主控制器', 'controller'], ['蓝牙小灯', 'light'], ['小车', 'car']] }], nextStatement: null, colour: 38, hat: 'cap' },
  { type: 'edge_when_sensor_changed', message0: '当 %1 数值变化', args0: [{ type: 'field_dropdown', name: 'SENSOR', options: [['距离传感器', 'distance'], ['温度传感器', 'temperature'], ['按钮', 'button']] }], nextStatement: null, colour: 38, hat: 'cap' },
  { type: 'edge_connect', message0: '连接 %1 超时 %2 秒', args0: [{ type: 'field_dropdown', name: 'DEVICE', options: [['EdgeBrain 控制器', 'controller'], ['模拟蓝牙小灯', 'light'], ['智能小车', 'car']] }, { type: 'field_number', name: 'TIMEOUT', value: 10, min: 1, max: 60 }], previousStatement: null, nextStatement: null, colour: 210 },
  { type: 'edge_disconnect', message0: '断开 %1', args0: [{ type: 'field_dropdown', name: 'DEVICE', options: [['主控制器', 'controller'], ['蓝牙小灯', 'light'], ['智能小车', 'car']] }], previousStatement: null, nextStatement: null, colour: 210 },
  { type: 'edge_is_connected', message0: '%1 已连接', args0: [{ type: 'field_dropdown', name: 'DEVICE', options: [['主控制器', 'controller'], ['蓝牙小灯', 'light'], ['智能小车', 'car']] }], output: 'Boolean', colour: 210 },
  { type: 'edge_read_sensor', message0: '读取 %1', args0: [{ type: 'field_dropdown', name: 'SENSOR', options: [['距离 cm', 'distance'], ['温度 ℃', 'temperature'], ['湿度 %', 'humidity'], ['环境光', 'light_level'], ['空气质量', 'air_quality']] }], output: 'Number', colour: 198 },
  { type: 'edge_button_pressed', message0: '按钮 %1 被按下', args0: [{ type: 'field_dropdown', name: 'BUTTON', options: [['A', 'A'], ['B', 'B'], ['急停', 'emergency']] }], output: 'Boolean', colour: 198 },
  { type: 'edge_light_on', message0: '打开 模拟蓝牙小灯', previousStatement: null, nextStatement: null, colour: 145 },
  { type: 'edge_light_off', message0: '关闭 模拟蓝牙小灯', previousStatement: null, nextStatement: null, colour: 155 },
  { type: 'edge_light_brightness', message0: '把小灯亮度设为 %1 %%', args0: [{ type: 'field_number', name: 'BRIGHTNESS', value: 60, min: 0, max: 100, precision: 1 }], previousStatement: null, nextStatement: null, colour: 155 },
  { type: 'edge_rgb', message0: '设置灯光 R %1 G %2 B %3', args0: [{ type: 'field_number', name: 'R', value: 40, min: 0, max: 255 }, { type: 'field_number', name: 'G', value: 120, min: 0, max: 255 }, { type: 'field_number', name: 'B', value: 255, min: 0, max: 255 }], previousStatement: null, nextStatement: null, colour: 155 },
  { type: 'edge_motor', message0: '设置 %1 速度 %2 %%', args0: [{ type: 'field_dropdown', name: 'MOTOR', options: [['左电机', 'left'], ['右电机', 'right'], ['全部电机', 'all']] }, { type: 'field_number', name: 'SPEED', value: 45, min: -100, max: 100 }], previousStatement: null, nextStatement: null, colour: 145 },
  { type: 'edge_servo', message0: '设置舵机 %1 角度 %2 °', args0: [{ type: 'field_dropdown', name: 'SERVO', options: [['舵机 1', 'servo_1'], ['舵机 2', 'servo_2']] }, { type: 'field_number', name: 'ANGLE', value: 90, min: 0, max: 180 }], previousStatement: null, nextStatement: null, colour: 145 },
  { type: 'edge_buzzer', message0: '蜂鸣器播放 %1 Hz 持续 %2 秒', args0: [{ type: 'field_number', name: 'FREQUENCY', value: 880, min: 20, max: 5000 }, { type: 'field_number', name: 'DURATION', value: 0.3, min: 0.1, max: 10, precision: 0.1 }], previousStatement: null, nextStatement: null, colour: 145 },
  { type: 'edge_display_text', message0: '屏幕显示 %1', args0: [{ type: 'field_input', name: 'TEXT', text: '设备已启动' }], previousStatement: null, nextStatement: null, colour: 145 },
  { type: 'edge_wait', message0: '等待 %1 秒', args0: [{ type: 'field_number', name: 'SECONDS', value: 1, min: 0.1, max: 60, precision: 0.1 }], previousStatement: null, nextStatement: null, colour: 42 },
  { type: 'edge_require_confirm', message0: '请求人工确认 %1', args0: [{ type: 'field_input', name: 'MESSAGE', text: '即将控制真实硬件' }], previousStatement: null, nextStatement: null, colour: 2 },
  { type: 'edge_safe_limit', message0: '限制 %1 最大值为 %2', args0: [{ type: 'field_dropdown', name: 'TARGET', options: [['电机速度', 'motor_speed'], ['灯光亮度', 'brightness'], ['舵机角度', 'servo_angle']] }, { type: 'field_number', name: 'LIMIT', value: 70, min: 0, max: 100 }], previousStatement: null, nextStatement: null, colour: 2 },
  { type: 'edge_emergency_stop', message0: '立即急停并断开执行器', previousStatement: null, nextStatement: null, colour: 2 },
  { type: 'edge_log', message0: '记录日志 %1', args0: [{ type: 'field_input', name: 'MESSAGE', text: '运行到这里' }], previousStatement: null, nextStatement: null, colour: 225 },
  { type: 'edge_notify', message0: '发送本机提醒 %1', args0: [{ type: 'field_input', name: 'MESSAGE', text: '任务已完成' }], previousStatement: null, nextStatement: null, colour: 225 },
]
Blockly.defineBlocksWithJsonArray(edgeBlockDefinitions.filter(definition => !Blockly.Blocks[definition.type]) as Parameters<typeof Blockly.defineBlocksWithJsonArray>[0])
const toolbox: Blockly.utils.toolbox.ToolboxDefinition = { kind: 'categoryToolbox', contents: [
  { kind: 'category', name: '事件', colour: '#f3a83b', contents: [{ kind: 'block', type: 'edge_when_run' }, { kind: 'block', type: 'edge_when_connected' }, { kind: 'block', type: 'edge_when_sensor_changed' }] },
  { kind: 'category', name: '连接', colour: '#4b8cff', contents: [{ kind: 'block', type: 'edge_connect' }, { kind: 'block', type: 'edge_disconnect' }, { kind: 'block', type: 'edge_is_connected' }] },
  { kind: 'category', name: '传感器', colour: '#31a6be', contents: [{ kind: 'block', type: 'edge_read_sensor' }, { kind: 'block', type: 'edge_button_pressed' }] },
  { kind: 'category', name: '执行器', colour: '#36a269', contents: [{ kind: 'block', type: 'edge_light_on' }, { kind: 'block', type: 'edge_light_off' }, { kind: 'block', type: 'edge_light_brightness' }, { kind: 'block', type: 'edge_rgb' }, { kind: 'block', type: 'edge_motor' }, { kind: 'block', type: 'edge_servo' }, { kind: 'block', type: 'edge_buzzer' }, { kind: 'block', type: 'edge_display_text' }] },
  { kind: 'category', name: '流程', colour: '#e48e2f', contents: [{ kind: 'block', type: 'edge_wait' }, { kind: 'block', type: 'controls_repeat_ext' }, { kind: 'block', type: 'controls_whileUntil' }] },
  { kind: 'category', name: '逻辑', colour: '#8a63d2', contents: [{ kind: 'block', type: 'controls_if' }, { kind: 'block', type: 'logic_compare' }, { kind: 'block', type: 'logic_operation' }, { kind: 'block', type: 'logic_boolean' }] },
  { kind: 'category', name: '数据与日志', colour: '#6f7f96', contents: [{ kind: 'block', type: 'math_number' }, { kind: 'block', type: 'text' }, { kind: 'block', type: 'edge_log' }, { kind: 'block', type: 'edge_notify' }] },
  { kind: 'category', name: '安全', colour: '#e25555', contents: [{ kind: 'block', type: 'edge_require_confirm' }, { kind: 'block', type: 'edge_safe_limit' }, { kind: 'block', type: 'edge_emergency_stop' }] },
] }

function createBlock(type: string, x = 70, y = 55) { if (!workspace) throw new Error('工作区未初始化'); const block = workspace.newBlock(type); block.initSvg(); block.render(); block.moveBy(x, y); return block }
function loadProgram(program: AutomationProgram) { if (!workspace) return; workspace.clear(); const start = createBlock('edge_when_run'); let previous: Blockly.BlockSvg = start; for (const descriptor of programToBlockDescriptors(program)) { const block = createBlock(descriptor.type); if (descriptor.type === 'edge_wait') block.setFieldValue(String(descriptor.value), 'SECONDS'); if (descriptor.type === 'edge_light_brightness') block.setFieldValue(String(descriptor.value), 'BRIGHTNESS'); previous.nextConnection?.connect(block.previousConnection!); previous = block } workspace.cleanUp() }
async function generate() { generating.value = true; error.value = ''; try { const response = await requestJson<{ source: string; requires_confirmation: true; program: AutomationProgram }>('/api/automations/generate', { method: 'POST', body: JSON.stringify({ prompt: prompt.value }) }); generated.value = response.program; source.value = response.source; loadProgram(response.program); ElMessage.success('已生成可编辑积木，请确认后运行') } catch (reason) { error.value = reason instanceof Error ? reason.message : '生成失败' } finally { generating.value = false } }
function saveWorkspace() { if (!workspace) return; const state = Blockly.serialization.workspaces.save(workspace); localStorage.setItem('edgebrain-studio-draft', JSON.stringify(state)); ElMessage.success('草稿已保存在本机') }
function undo() { workspace?.undo(false) }
function redo() { workspace?.undo(true) }
function exportJson() {
  if (!workspace) return
  const payload = {
    format: 'edgebrain.blockly.workspace.v1',
    project: { id: String(route.params.id), name: currentProgram.value?.name ?? '新设备程序', hardware: currentProgram.value?.hardware ?? [] },
    workspace: Blockly.serialization.workspaces.save(workspace),
    generated_program: generated.value,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${String(route.params.id)}-edgebrain-blocks.json`
  anchor.click()
  URL.revokeObjectURL(url)
}
async function importJson(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const payload = JSON.parse(await file.text()) as { format?: string; workspace?: object; generated_program?: unknown }
    if (payload.format === 'edgebrain.blockly.workspace.v1' && payload.workspace && workspace) {
      Blockly.serialization.workspaces.load(payload.workspace, workspace)
      if (payload.generated_program) generated.value = parseAutomationProgram(payload.generated_program)
    } else {
      const program = parseAutomationProgram(payload)
      generated.value = program
      loadProgram(program)
    }
    source.value = 'imported'
    ElMessage.success('JSON 已导入为可编辑积木')
  } catch (reason) { ElMessage.error(reason instanceof Error ? reason.message : 'JSON 导入失败') }
  finally { input.value = '' }
}
function runPreview() { ElMessage.warning('当前只预览程序；真实运行将在控制任务执行器完成后开放') }
onMounted(async () => { await nextTick(); if (!host.value) return; workspace = Blockly.inject(host.value, { toolbox, renderer: 'zelos', trashcan: true, move: { scrollbars: true, drag: true, wheel: true }, zoom: { controls: true, wheel: true, startScale: .86, minScale: .55, maxScale: 1.4 }, grid: { spacing: 24, length: 3, colour: '#d8d8d0', snap: true } }); const saved = localStorage.getItem('edgebrain-studio-draft'); if (saved) Blockly.serialization.workspaces.load(JSON.parse(saved), workspace); else createBlock('edge_when_run'); workspace.addChangeListener(() => { blockCount.value = workspace?.getAllBlocks(false).length ?? 0 }); blockCount.value = workspace.getAllBlocks(false).length; window.addEventListener('resize', resize); resize() })
function resize() { if (workspace) Blockly.svgResize(workspace) }
onBeforeUnmount(() => { window.removeEventListener('resize', resize); workspace?.dispose() })
</script>

<template>
  <section class="studio-page">
    <div class="studio-topbar">
      <div class="studio-project"><RouterLink to="/programs" class="studio-back" aria-label="返回项目列表"><el-icon><ArrowLeft /></el-icon></RouterLink><div><strong>{{ currentProgram?.name || '新设备程序' }}</strong><span><el-icon><Connection /></el-icon>{{ currentProgram?.hardware.join(' · ') || '未绑定硬件' }}</span></div><el-tag type="success" effect="plain">模拟设备已连接</el-tag><small>{{ blockCount }} 个积木</small></div>
      <div class="studio-actions"><el-button-group><el-button :icon="RefreshLeft" aria-label="撤销" @click="undo" /><el-button :icon="RefreshRight" aria-label="重做" @click="redo" /></el-button-group><input ref="fileInput" type="file" accept="application/json,.json" hidden @change="importJson" /><el-button @click="fileInput?.click()">导入</el-button><el-button @click="exportJson">导出 JSON</el-button><el-button @click="saveWorkspace">保存</el-button><el-button type="primary" @click="runPreview">检查并运行</el-button></div>
    </div>
    <article class="panel blockly-panel"><div ref="host" class="blockly-host"></div></article>
    <button class="ai-bubble" type="button" :aria-label="aiOpen ? '关闭 AI 助手' : '打开 AI 助手'" :aria-expanded="aiOpen" @click="aiOpen = !aiOpen"><el-icon><Close v-if="aiOpen" /><ChatDotRound v-else /></el-icon><span v-if="!aiOpen">AI 搭积木</span></button>
    <aside v-if="aiOpen" class="ai-float-panel" aria-label="AI 积木助手">
      <article class="ai-card"><div class="panel-title"><div><span class="hero-kicker">端侧模型</span><h3>AI 帮我搭积木</h3></div><el-button circle text :icon="Close" aria-label="关闭" @click="aiOpen = false" /></div><p>用一句话描述你想让设备做什么。</p><el-input v-model="prompt" type="textarea" placeholder="例如：打开小灯，3 秒后关闭" /><el-button type="primary" class="ai-generate" :loading="generating" @click="generate">生成积木程序</el-button><p class="ai-source">生成方式：{{ source === 'ollama' ? '本地 Ollama 模型' : source === 'imported' ? '导入的 JSON 文件' : '本地教学示例器' }}。生成后不会自动运行。</p><div v-if="error" class="error-box">{{ error }}</div></article>
      <article v-if="generated" class="program-preview"><strong>运行预览</strong><ol><li v-for="(step, index) in generated.steps" :key="index">{{ step.type === 'wait' ? `等待 ${(step.duration_ms ?? 0) / 1000} 秒` : step.capability }}</li></ol><el-alert title="需要人工确认" type="warning" :closable="false" show-icon /></article>
    </aside>
  </section>
</template>
