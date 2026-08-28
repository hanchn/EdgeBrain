<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { requestJson, type DeviceRecord } from '@/api'

const device = ref<DeviceRecord | null>(null)
const loading = ref(true)
const running = ref(false)
const brightness = ref(60)
const isOn = computed(() => device.value?.state.on ?? false)
async function load() { loading.value = true; try { const items = await requestJson<DeviceRecord[]>('/api/devices'); device.value = items[0] ?? null; if (device.value) brightness.value = device.value.state.brightness } catch { ElMessage.error('硬件代理不可用') } finally { loading.value = false } }
async function execute(capability: string, parameters: Record<string, unknown> = {}) { if (!device.value) return; running.value = true; try { const job = await requestJson<{ status: string; result: { state: DeviceRecord['state'] } }>('/api/control-jobs', { method: 'POST', body: JSON.stringify({ device_id: device.value.id, capability, parameters }) }); device.value.state = job.result.state; ElMessage.success('模拟控制已执行') } catch (reason) { ElMessage.error(reason instanceof Error ? reason.message : '执行失败') } finally { running.value = false } }
onMounted(load)
</script>

<template><section class="page"><div class="page-heading"><div><h2>设备实验台</h2><p>先在模拟环境验证能力、参数和交互，再接入真实蓝牙 Profile。</p></div><el-tag type="warning">SIMULATION</el-tag></div><article v-loading="loading" class="panel"><div v-if="device" class="device-hero"><div class="light-orb" :class="{ on: isOn }"></div><div><el-tag :type="device.online ? 'success' : 'danger'">{{ device.online ? '在线' : '离线' }}</el-tag><h2>{{ device.name }}</h2><p>{{ device.transport }} · 亮度 {{ device.state.brightness }}%</p><div class="device-actions"><el-button type="primary" :loading="running" @click="execute('light.turn_on')">打开</el-button><el-button :loading="running" @click="execute('light.turn_off')">关闭</el-button></div><el-slider v-model="brightness" :disabled="running" show-input @change="execute('light.set_brightness', { brightness })" /></div></div><div v-else class="empty-state">没有发现设备</div></article></section></template>

