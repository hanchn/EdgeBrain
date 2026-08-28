<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { requestJson, type ComponentRecord } from '@/api'

const route = useRoute()
const item = ref<ComponentRecord | null>(null)
const error = ref('')
const componentId = computed(() => Number(route.params.id))
function usePlaceholder(event: Event) { (event.target as HTMLImageElement).src = '/assets/hardware-placeholder.png' }
onMounted(async () => {
  try {
    item.value = await requestJson<ComponentRecord>(`/api/components/${componentId.value}`)
  } catch (reason) { error.value = reason instanceof Error ? reason.message : '加载失败' }
})
</script>

<template><section class="page"><div class="page-heading"><div><h2>{{ item?.name ?? '配件详情' }}</h2><p>{{ item?.model || '完整硬件档案' }}</p></div><RouterLink to="/components"><el-button>返回列表</el-button></RouterLink></div><div v-if="error" class="error-box">{{ error }}</div><article v-if="item" class="panel detail-layout"><img class="detail-image" :src="item.image_path || '/assets/hardware-placeholder.png'" :alt="`${item.name} 主图`" @error="usePlaceholder" /><div><el-descriptions :column="1" border><el-descriptions-item label="名称">{{ item.name }}</el-descriptions-item><el-descriptions-item label="型号">{{ item.model || '未填写' }}</el-descriptions-item><el-descriptions-item label="采购店铺">{{ item.store_name || '未填写' }}</el-descriptions-item><el-descriptions-item label="参考价格">¥{{ (item.price_cents / 100).toFixed(2) }}</el-descriptions-item><el-descriptions-item label="采购链接"><a v-if="item.purchase_url" :href="item.purchase_url" target="_blank" rel="noreferrer">打开店铺页面</a><span v-else>未填写</span></el-descriptions-item><el-descriptions-item label="详细介绍">{{ item.description || '暂无详细描述' }}</el-descriptions-item></el-descriptions></div></article></section></template>
