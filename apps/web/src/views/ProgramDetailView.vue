<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Edit, VideoPlay } from '@element-plus/icons-vue'
import { programs, type ProjectMilestone } from '@/programData'

const route = useRoute()
const program = computed(() => programs.find(item => item.id === route.params.id) ?? programs[0]!)
const milestoneType = (status: ProjectMilestone['status']) => status === '已完成' ? 'success' : status === '进行中' ? 'primary' : 'info'
const completed = computed(() => program.value.milestones.filter(item => item.status === '已完成').length)
</script>

<template>
  <section class="page project-detail-page">
    <div class="page-heading"><div><span class="hero-kicker">{{ program.level }}项目 · {{ program.stage }}</span><h2>{{ program.name }}</h2><p>{{ program.description }}</p></div><div class="heading-actions"><RouterLink to="/programs"><el-button>返回项目</el-button></RouterLink><RouterLink :to="`/programs/${program.id}/remote`"><el-button :icon="VideoPlay">虚拟遥控器</el-button></RouterLink><RouterLink :to="`/programs/${program.id}/edit`"><el-button type="primary" :icon="Edit">积木编程</el-button></RouterLink></div></div>
    <article class="panel project-detail-hero"><img :src="program.image" :alt="program.name" @error="($event.target as HTMLImageElement).src='/assets/hardware-placeholder.png'" /><div><div class="project-detail-tags"><el-tag>{{ program.level }}</el-tag><el-tag type="success" effect="plain">{{ program.controller }}</el-tag></div><h3>开发目标</h3><p>{{ program.description }}</p><div class="project-progress"><div><span>里程碑进度</span><strong>{{ completed }} / {{ program.milestones.length }}</strong></div><el-progress :percentage="Math.round(completed / program.milestones.length * 100)" :stroke-width="10" /></div><dl><div><dt>预计周期</dt><dd>{{ program.duration }}</dd></div><div><dt>绑定硬件</dt><dd>{{ program.hardware.length }} 类</dd></div><div><dt>能力接口</dt><dd>{{ program.capabilities.length }} 项</dd></div></dl></div></article>
    <div class="project-detail-grid">
      <article class="panel project-section project-bom"><div class="panel-title"><div><span class="section-index">01</span><h3>硬件与采购清单</h3></div><RouterLink to="/marketplace"><el-button>去商城选品</el-button></RouterLink></div><table class="bom-table"><thead><tr><th>硬件/耗材</th><th>数量</th><th>用途</th><th>采购来源</th><th>要求</th></tr></thead><tbody><tr v-for="part in program.parts" :key="part.name"><td><strong>{{ part.name }}</strong></td><td>× {{ part.quantity }}</td><td>{{ part.role }}</td><td>{{ part.source }}</td><td><el-tag :type="part.required ? 'danger' : 'info'" size="small">{{ part.required ? '必需' : '可选' }}</el-tag></td></tr></tbody></table></article>
      <article class="panel project-section"><div class="panel-title"><div><span class="section-index">02</span><h3>真实运行流程</h3></div></div><ol class="project-workflow"><li v-for="(step, index) in program.workflow" :key="step"><span>{{ index + 1 }}</span><p>{{ step }}</p></li></ol></article>
      <article class="panel project-section"><div class="panel-title"><div><span class="section-index">03</span><h3>编程依赖</h3></div><RouterLink :to="`/programs/${program.id}/edit`"><el-button type="primary">打开积木</el-button></RouterLink></div><div class="capability-list"><span v-for="capability in program.capabilities" :key="capability">{{ capability }}</span></div></article>
      <article class="panel project-section"><div class="panel-title"><div><span class="section-index">04</span><h3>安全检查</h3></div></div><ul class="safety-checklist"><li v-for="item in program.safety" :key="item"><span>✓</span>{{ item }}</li></ul></article>
      <article class="panel project-section project-milestones"><div class="panel-title"><div><span class="section-index">05</span><h3>开发里程碑</h3></div></div><div class="milestone-list"><div v-for="milestone in program.milestones" :key="milestone.name"><span class="milestone-dot" :class="milestone.status"></span><div><strong>{{ milestone.name }}</strong><p>{{ milestone.deliverable }}</p></div><el-tag :type="milestoneType(milestone.status)" size="small">{{ milestone.status }}</el-tag></div></div></article>
    </div>
  </section>
</template>
