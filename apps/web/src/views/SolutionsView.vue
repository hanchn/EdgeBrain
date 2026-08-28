<script setup lang="ts">
import { computed, ref } from 'vue'
import { Grid, List } from '@element-plus/icons-vue'
import { solutions, type SolutionLevel } from '@/solutionData'

type Filter = '全部' | SolutionLevel
const tabs: Filter[] = ['全部', '基础方案', '进阶方案', '高阶方案']
const activeTab = ref<Filter>('全部')
const viewMode = ref<'list' | 'card'>('list')
const filtered = computed(() => activeTab.value === '全部' ? solutions : solutions.filter(item => item.level === activeTab.value))
const tagType = (level: SolutionLevel) => level === '基础方案' ? 'success' : level === '进阶方案' ? 'primary' : 'warning'
</script>

<template>
  <section class="page solutions-page">
    <div class="page-heading">
      <div><span class="hero-kicker">从简单到复杂</span><h2>技术方案清单</h2><p>每套方案都包含采购清单、编程依赖和可下载培训文档。</p></div>
      <div class="heading-actions"><el-button-group><el-button :type="viewMode === 'list' ? 'primary' : 'default'" :icon="List" aria-label="列表展示" @click="viewMode = 'list'">列表</el-button><el-button :type="viewMode === 'card' ? 'primary' : 'default'" :icon="Grid" aria-label="卡片展示" @click="viewMode = 'card'">卡片</el-button></el-button-group><RouterLink to="/solutions/new"><el-button type="primary">新建方案</el-button></RouterLink></div>
    </div>
    <div class="solution-tabs" role="tablist" aria-label="方案等级">
      <button v-for="tab in tabs" :key="tab" type="button" role="tab" :aria-selected="activeTab === tab" :class="{ active: activeTab === tab }" @click="activeTab = tab">{{ tab }} <small>{{ tab === '全部' ? solutions.length : solutions.filter(item => item.level === tab).length }}</small></button>
    </div>
    <div class="solution-grid" :class="`${viewMode}-mode`">
      <article v-for="solution in filtered" :key="solution.id" class="solution-card">
        <img :src="solution.image" :alt="solution.name" @error="($event.target as HTMLImageElement).src='/assets/hardware-placeholder.png'" />
        <div class="solution-card-content"><el-tag :type="tagType(solution.level)" effect="light">{{ solution.level }}</el-tag><h3>{{ solution.name }}</h3><p>{{ solution.description }}</p><dl><div><dt>推荐控制器</dt><dd>{{ solution.controller }}</dd></div><div><dt>预计耗时</dt><dd>{{ solution.duration }}</dd></div><div><dt>采购项</dt><dd>{{ solution.bom.length }} 类</dd></div></dl><div class="solution-actions"><RouterLink :to="`/solutions/${solution.id}`"><el-button type="primary">查看方案拆解</el-button></RouterLink><RouterLink :to="`/solutions/${solution.id}/edit`"><el-button>编辑</el-button></RouterLink></div></div>
      </article>
    </div>
  </section>
</template>
