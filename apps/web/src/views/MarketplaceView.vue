<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search, ShoppingCart } from '@element-plus/icons-vue'
import { marketplaceProducts, type ProductStage } from '@/marketplaceData'

type StageFilter = '全部' | ProductStage
const stages: StageFilter[] = ['全部', '基础元件', '原型搭建', '方案集成']
const query = ref('')
const activeStage = ref<StageFilter>('全部')
const searchedQuery = ref('')
const filtered = computed(() => marketplaceProducts.filter(product => {
  const matchesStage = activeStage.value === '全部' || product.stage === activeStage.value
  const keywords = searchedQuery.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const haystack = `${product.title} ${product.category} ${product.recommendation}`.toLowerCase()
  return matchesStage && keywords.every(word => haystack.includes(word))
}))
function search() { searchedQuery.value = query.value }
</script>

<template>
  <section class="page marketplace-page">
    <div class="page-heading"><div><span class="hero-kicker">真实 1688 选品</span><h2>商城</h2><p>按落地阶段筛选硬件，把候选商品加入方案采购清单。</p></div><el-tag type="success">Skill 结果已导入</el-tag></div>
    <article class="panel market-hero"><div><strong>智能开关首批选品已完成</strong><p>查询时间：2026-08-28。价格、库存和规格在采购前需要重新核实。</p></div><div class="market-search"><el-input v-model="query" size="large" clearable placeholder="筛选 ESP32、继电器、LED……" @keyup.enter="search"><template #prefix><el-icon><Search /></el-icon></template></el-input><el-button type="primary" size="large" @click="search">筛选结果</el-button></div></article>
    <div class="solution-tabs market-tabs" role="tablist" aria-label="落地阶段"><button v-for="stage in stages" :key="stage" type="button" role="tab" :aria-selected="activeStage === stage" :class="{ active: activeStage === stage }" @click="activeStage = stage">{{ stage }} <small>{{ stage === '全部' ? marketplaceProducts.length : marketplaceProducts.filter(item => item.stage === stage).length }}</small></button></div>
    <div class="market-product-list">
      <article v-for="product in filtered" :key="product.id" class="panel market-product-card">
        <img :src="product.image || '/assets/hardware-placeholder.png'" :alt="product.title" @error="($event.target as HTMLImageElement).src='/assets/hardware-placeholder.png'" />
        <div class="market-product-main"><div class="market-product-kicker"><el-tag size="small">{{ product.stage }}</el-tag><span>{{ product.category }}</span></div><h3>{{ product.title }}</h3><p>{{ product.recommendation }}</p><div v-if="product.risk" class="product-risk">注意：{{ product.risk }}</div></div>
        <div class="market-product-metrics"><div><span>参考价</span><strong>¥{{ product.price }}</strong></div><div><span>近 30 天销量</span><b>{{ product.sales30d }}</b></div><div><span>好评 / 复购</span><b>{{ product.goodRate }} / {{ product.repurchaseRate }}</b></div></div>
        <div class="market-product-actions"><a :href="product.url" target="_blank" rel="noreferrer"><el-button type="primary">查看 1688 商品</el-button></a><el-button :icon="ShoppingCart">加入采购候选</el-button></div>
      </article>
      <el-empty v-if="!filtered.length" description="当前筛选条件没有商品，试试更短的关键词" />
    </div>
  </section>
</template>
