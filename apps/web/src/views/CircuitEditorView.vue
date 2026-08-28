<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { circuitPartLibrary, getCircuitTemplate, type CircuitDiagram, type CircuitNode, type CircuitPort } from '@/circuitData'
import { programs } from '@/programData'

const NODE_WIDTH = 184
const NODE_HEIGHT = 112
const route = useRoute()
const svgRef = ref<SVGSVGElement>()
const program = computed(() => programs.find(item => item.id === route.params.id) ?? programs[0]!)
const diagram = ref<CircuitDiagram>(getCircuitTemplate(program.value.id))
const selectedNodeId = ref('')
const selectedWireId = ref('')
const pendingPort = ref<{ nodeId: string; portId: string } | null>(null)
const history = ref<string[]>([])
const future = ref<string[]>([])
const savedAt = ref('')
const drag = ref<{ nodeId: string; offsetX: number; offsetY: number; before: string } | null>(null)

const selectedNode = computed(() => diagram.value.nodes.find(node => node.id === selectedNodeId.value))

function storageKey() { return `edgebrain-circuit-${program.value.id}` }
function serialize() { return JSON.stringify(diagram.value) }
function restore(raw: string) { diagram.value = JSON.parse(raw) as CircuitDiagram }
function cloneDiagram() { return JSON.parse(serialize()) as CircuitDiagram }
function commit(next: CircuitDiagram) {
  history.value.push(serialize())
  diagram.value = next
  future.value = []
}
function loadDiagram() {
  const saved = localStorage.getItem(storageKey())
  diagram.value = saved ? JSON.parse(saved) as CircuitDiagram : getCircuitTemplate(program.value.id)
  history.value = []
  future.value = []
  selectedNodeId.value = ''
  selectedWireId.value = ''
  pendingPort.value = null
}
watch(() => route.params.id, loadDiagram)
onMounted(loadDiagram)

function portPosition(node: CircuitNode, port: CircuitPort) {
  const sameSide = node.ports.filter(item => item.side === port.side)
  const index = sameSide.findIndex(item => item.id === port.id)
  return {
    x: node.x + (port.side === 'left' ? 0 : NODE_WIDTH),
    y: node.y + 38 + ((index + 1) * (NODE_HEIGHT - 46) / (sameSide.length + 1)),
  }
}
function endpoint(nodeId: string, portId: string) {
  const node = diagram.value.nodes.find(item => item.id === nodeId)
  const port = node?.ports.find(item => item.id === portId)
  return node && port ? portPosition(node, port) : { x: 0, y: 0 }
}
function wirePath(fromNode: string, fromPort: string, toNode: string, toPort: string) {
  const start = endpoint(fromNode, fromPort)
  const end = endpoint(toNode, toPort)
  const bend = Math.max(70, Math.abs(end.x - start.x) * .45)
  const direction = end.x >= start.x ? 1 : -1
  return `M ${start.x} ${start.y} C ${start.x + bend * direction} ${start.y}, ${end.x - bend * direction} ${end.y}, ${end.x} ${end.y}`
}
function canvasPoint(event: PointerEvent) {
  const rect = svgRef.value!.getBoundingClientRect()
  return { x: (event.clientX - rect.left) * 1200 / rect.width, y: (event.clientY - rect.top) * 720 / rect.height }
}
function startDrag(event: PointerEvent, node: CircuitNode) {
  if ((event.target as Element).classList.contains('circuit-port')) return
  const point = canvasPoint(event)
  drag.value = { nodeId: node.id, offsetX: point.x - node.x, offsetY: point.y - node.y, before: serialize() }
  selectedNodeId.value = node.id
  selectedWireId.value = ''
  svgRef.value?.setPointerCapture(event.pointerId)
}
function moveDrag(event: PointerEvent) {
  if (!drag.value) return
  const point = canvasPoint(event)
  const node = diagram.value.nodes.find(item => item.id === drag.value?.nodeId)
  if (!node) return
  node.x = Math.max(10, Math.min(1200 - NODE_WIDTH - 10, point.x - drag.value.offsetX))
  node.y = Math.max(10, Math.min(720 - NODE_HEIGHT - 10, point.y - drag.value.offsetY))
}
function endDrag() {
  if (drag.value && drag.value.before !== serialize()) {
    history.value.push(drag.value.before)
    future.value = []
  }
  drag.value = null
}
function selectWire(id: string) {
  selectedWireId.value = id
  selectedNodeId.value = ''
  pendingPort.value = null
}
function connectPort(nodeId: string, portId: string) {
  selectedNodeId.value = nodeId
  selectedWireId.value = ''
  if (!pendingPort.value) {
    pendingPort.value = { nodeId, portId }
    return
  }
  if (pendingPort.value.nodeId === nodeId && pendingPort.value.portId === portId) {
    pendingPort.value = null
    return
  }
  const next = cloneDiagram()
  next.wires.push({
    id: `wire-${Date.now()}`,
    fromNode: pendingPort.value.nodeId,
    fromPort: pendingPort.value.portId,
    toNode: nodeId,
    toPort: portId,
    color: '#2f80ed',
    label: '新连线',
  })
  commit(next)
  pendingPort.value = null
}
function addPart(index: number) {
  const preset = circuitPartLibrary[index]
  if (!preset) return
  const next = cloneDiagram()
  const count = next.nodes.filter(node => node.kind === preset.kind).length + 1
  const id = `${preset.kind}-${Date.now()}`
  next.nodes.push({ ...JSON.parse(JSON.stringify(preset)), id, label: `${preset.label} ${count}`, x: 470 + count * 18, y: 270 + count * 18 })
  commit(next)
  selectedNodeId.value = id
}
function deleteSelection() {
  if (!selectedNodeId.value && !selectedWireId.value) return
  const next = cloneDiagram()
  if (selectedNodeId.value) {
    next.nodes = next.nodes.filter(node => node.id !== selectedNodeId.value)
    next.wires = next.wires.filter(wire => wire.fromNode !== selectedNodeId.value && wire.toNode !== selectedNodeId.value)
  } else {
    next.wires = next.wires.filter(wire => wire.id !== selectedWireId.value)
  }
  commit(next)
  selectedNodeId.value = ''
  selectedWireId.value = ''
}
function undo() {
  const previous = history.value.pop()
  if (!previous) return
  future.value.push(serialize())
  restore(previous)
}
function redo() {
  const next = future.value.pop()
  if (!next) return
  history.value.push(serialize())
  restore(next)
}
function resetDiagram() {
  commit(getCircuitTemplate(program.value.id))
  selectedNodeId.value = ''
  selectedWireId.value = ''
  pendingPort.value = null
}
function saveDiagram() {
  localStorage.setItem(storageKey(), serialize())
  savedAt.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  ElMessage.success('电路图已保存在本机')
}
function exportSvg() {
  if (!svgRef.value) return
  const clone = svgRef.value.cloneNode(true) as SVGSVGElement
  clone.querySelectorAll('.selection-outline').forEach(item => item.remove())
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${program.value.id}-circuit.svg`
  link.click()
  URL.revokeObjectURL(link.href)
}
</script>

<template>
  <section class="page circuit-editor-page">
    <div class="circuit-editor-heading">
      <div><RouterLink :to="`/programs/${program.id}`">← 返回项目</RouterLink><span class="hero-kicker">电路设计工作台</span><h2>{{ diagram.title }}</h2></div>
      <div class="circuit-toolbar"><el-button :disabled="!history.length" @click="undo">撤销</el-button><el-button :disabled="!future.length" @click="redo">重做</el-button><el-button @click="resetDiagram">恢复预置</el-button><el-button @click="exportSvg">导出 SVG</el-button><el-button type="primary" @click="saveDiagram">保存电路图</el-button></div>
    </div>
    <div class="circuit-status"><span><b></b>{{ savedAt ? `已保存 ${savedAt}` : '当前修改尚未保存' }}</span><p>{{ pendingPort ? '请选择另一个端口完成连线' : '拖动元件调整位置；依次点击两个端口即可连线' }}</p></div>
    <div class="circuit-editor-layout">
      <aside class="panel circuit-library"><h3>元件库</h3><p>点击添加到画布</p><button v-for="(part, index) in circuitPartLibrary" :key="part.kind" type="button" @click="addPart(index)"><span :class="`part-symbol ${part.kind}`">{{ part.kind === 'controller' ? 'MCU' : part.kind === 'power' ? '5V' : '◈' }}</span><div><strong>{{ part.label }}</strong><small>{{ part.subtitle }}</small></div><b>＋</b></button></aside>
      <article class="panel circuit-canvas-panel">
        <svg ref="svgRef" class="circuit-canvas" viewBox="0 0 1200 720" role="img" :aria-label="`${program.name}电路图编辑画布`" @pointermove="moveDrag" @pointerup="endDrag" @pointercancel="endDrag" @click.self="selectedNodeId = ''; selectedWireId = ''; pendingPort = null">
          <defs><pattern id="minor-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" stroke-opacity=".08" stroke-width="1" /></pattern><pattern id="major-grid" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="url(#minor-grid)" /><path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" stroke-opacity=".15" stroke-width="1" /></pattern></defs>
          <rect width="1200" height="720" class="circuit-grid" fill="url(#major-grid)" />
          <g v-for="wire in diagram.wires" :key="wire.id" class="circuit-wire" :class="{ selected: selectedWireId === wire.id }" @click.stop="selectWire(wire.id)">
            <path class="wire-hit" :d="wirePath(wire.fromNode, wire.fromPort, wire.toNode, wire.toPort)" />
            <path class="wire-line" :d="wirePath(wire.fromNode, wire.fromPort, wire.toNode, wire.toPort)" :stroke="wire.color" />
            <text :x="(endpoint(wire.fromNode, wire.fromPort).x + endpoint(wire.toNode, wire.toPort).x) / 2" :y="(endpoint(wire.fromNode, wire.fromPort).y + endpoint(wire.toNode, wire.toPort).y) / 2 - 8">{{ wire.label }}</text>
          </g>
          <g v-for="node in diagram.nodes" :key="node.id" class="circuit-node" :class="{ selected: selectedNodeId === node.id }" :transform="`translate(${node.x} ${node.y})`" @pointerdown="startDrag($event, node)">
            <rect class="node-card" :width="NODE_WIDTH" :height="NODE_HEIGHT" rx="13" />
            <rect class="node-accent" width="6" :height="NODE_HEIGHT" rx="3" />
            <text class="node-title" x="18" y="24">{{ node.label }}</text><text class="node-subtitle" x="18" y="42">{{ node.subtitle }}</text>
            <g v-for="port in node.ports" :key="port.id" class="port-group" @pointerdown.stop @click.stop="connectPort(node.id, port.id)">
              <circle class="circuit-port" :class="{ pending: pendingPort?.nodeId === node.id && pendingPort?.portId === port.id }" :cx="port.side === 'left' ? 0 : NODE_WIDTH" :cy="portPosition(node, port).y - node.y" r="7" />
              <text class="port-label" :text-anchor="port.side === 'left' ? 'start' : 'end'" :x="port.side === 'left' ? 12 : NODE_WIDTH - 12" :y="portPosition(node, port).y - node.y + 4">{{ port.label }}</text>
            </g>
            <rect v-if="selectedNodeId === node.id" class="selection-outline" x="-4" y="-4" :width="NODE_WIDTH + 8" :height="NODE_HEIGHT + 8" rx="16" />
          </g>
        </svg>
      </article>
      <aside class="panel circuit-inspector"><h3>设计检查</h3><div class="circuit-counts"><span><b>{{ diagram.nodes.length }}</b>元件</span><span><b>{{ diagram.wires.length }}</b>连线</span></div><ul><li v-for="note in diagram.notes" :key="note"><span>✓</span>{{ note }}</li></ul><template v-if="selectedNode"><h4>所选元件</h4><label>名称<el-input v-model="selectedNode.label" /></label><label>说明<el-input v-model="selectedNode.subtitle" /></label></template><el-button class="delete-circuit-item" type="danger" plain :disabled="!selectedNodeId && !selectedWireId" @click="deleteSelection">删除所选{{ selectedWireId ? '连线' : '元件' }}</el-button></aside>
    </div>
  </section>
</template>
