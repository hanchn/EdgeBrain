<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Document, Edit, ShoppingCart } from '@element-plus/icons-vue'
import { solutions, type SolutionRecord } from '@/solutionData'

const route = useRoute()
const solution = computed<SolutionRecord>(() => solutions.find(item => item.id === route.params.id) ?? solutions[0]!)
</script>

<template>
  <section class="page solution-detail-page">
    <div class="page-heading"><div><span class="hero-kicker">{{ solution.level }}</span><h2>{{ solution.name }}</h2><p>从采购、接线到积木程序和培训，一页看清完整落地路径。</p></div><div class="heading-actions"><RouterLink to="/solutions"><el-button>返回清单</el-button></RouterLink><RouterLink :to="`/solutions/${solution.id}/training`"><el-button :icon="Document">培训文档</el-button></RouterLink><RouterLink :to="`/solutions/${solution.id}/edit`"><el-button type="primary" :icon="Edit">编辑方案</el-button></RouterLink></div></div>
    <article class="panel solution-detail-hero"><img :src="solution.image" :alt="solution.name" @error="($event.target as HTMLImageElement).src='/assets/hardware-placeholder.png'" /><div><el-tag>{{ solution.level }}</el-tag><h3>{{ solution.name }}</h3><p>{{ solution.description }}</p><div class="solution-facts"><div><span>控制器</span><strong>{{ solution.controller }}</strong></div><div><span>预计耗时</span><strong>{{ solution.duration }}</strong></div><div><span>难度顺序</span><strong>{{ solutions.findIndex(item => item.id === solution.id) + 1 }} / {{ solutions.length }}</strong></div></div></div></article>
    <div class="solution-detail-grid">
      <article class="panel solution-section purchase-section"><div class="panel-title"><div><span class="section-index">01</span><h3>采购清单</h3></div><RouterLink to="/marketplace"><el-button :icon="ShoppingCart">去商城选品</el-button></RouterLink></div><table class="bom-table"><thead><tr><th>配件</th><th>数量</th><th>用途</th><th>选品状态</th></tr></thead><tbody><tr v-for="item in solution.bom" :key="item.name"><td><strong>{{ item.name }}</strong></td><td>× {{ item.quantity }}</td><td>{{ item.role }}</td><td><el-tag type="info">待选品</el-tag></td></tr></tbody></table></article>
      <article class="panel solution-section"><div class="panel-title"><div><span class="section-index">02</span><h3>搭建步骤</h3></div></div><ol class="build-steps"><li v-for="(step, index) in solution.steps" :key="step"><span>{{ String(index + 1).padStart(2, '0') }}</span><p>{{ step }}</p></li></ol></article>
      <article class="panel solution-section"><div class="panel-title"><div><span class="section-index">03</span><h3>编程依赖</h3></div><RouterLink :to="`/programs/${solution.id}/edit`"><el-button type="primary">在积木编辑器中查看</el-button></RouterLink></div><p class="section-copy">打开编辑器后会按方案绑定控制器和能力积木，仍可继续修改并导入、导出 JSON。</p><div class="capability-list"><span v-for="capability in solution.capabilities" :key="capability">{{ capability }}</span></div></article>
      <RouterLink class="training-entry panel" :to="`/solutions/${solution.id}/training`"><div><span class="section-index">04</span><h3>培训文档</h3><p>Markdown 格式，支持编辑、预览和下载到本地。</p></div><el-icon><Document /></el-icon></RouterLink>
    </div>
  </section>
</template>
