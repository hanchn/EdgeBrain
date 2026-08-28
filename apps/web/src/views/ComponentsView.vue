<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { requestJson, type ComponentRecord } from '@/api'

const components = ref<ComponentRecord[]>([])
const loading = ref(true)
const error = ref('')
function usePlaceholder(event: Event) { (event.target as HTMLImageElement).src = '/assets/hardware-placeholder.png' }
async function load() {
  loading.value = true
  error.value = ''
  try { components.value = await requestJson<ComponentRecord[]>('/api/components') }
  catch (reason) { error.value = reason instanceof Error ? reason.message : '加载失败' }
  finally { loading.value = false }
}
onMounted(load)
</script>

<template>
  <section class="page">
    <div class="page-heading"><div><h2>配件库</h2><p>列表只负责查找与浏览，建档和详情使用独立页面。</p></div><RouterLink to="/components/new"><el-button type="primary">新增配件</el-button></RouterLink></div>
    <div v-if="error" class="error-box">{{ error }} <el-button link @click="load">重试</el-button></div>
    <div v-loading="loading" class="component-grid">
      <RouterLink v-for="item in components" :key="item.id" class="detail-link" :to="`/components/${item.id}`">
        <article class="component-card"><img :src="item.image_path || '/assets/hardware-placeholder.png'" :alt="`${item.name} 主图`" @error="usePlaceholder" /><section><h3>{{ item.name }}</h3><p>{{ item.description || '暂无详细描述' }}</p><div class="component-meta"><span>{{ item.model || '未填写型号' }}</span><strong>¥{{ (item.price_cents / 100).toFixed(2) }}</strong></div></section></article>
      </RouterLink>
    </div>
    <div v-if="!loading && !components.length" class="panel empty-state"><div><h3>还没有配件</h3><p>先录入 ESP32、继电器或蓝牙小灯。</p><RouterLink to="/components/new"><el-button type="primary">建立第一份档案</el-button></RouterLink></div></div>
  </section>
</template>
