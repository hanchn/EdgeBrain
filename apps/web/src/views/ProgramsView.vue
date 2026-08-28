<script setup lang="ts">
import { VideoPlay } from '@element-plus/icons-vue'
import { programs, type ProjectLevel } from '@/programData'
const levelType = (level: ProjectLevel) => level === '入门' ? 'success' : level === '基础' ? 'primary' : level === '进阶' ? 'warning' : 'danger'
</script>

<template>
  <section class="page programs-page">
    <div class="page-heading"><div><span class="hero-kicker">真实硬件开发路线</span><h2>项目</h2><p>从蓝牙小灯到智能小车，每个项目都有独立图片、清单、流程和里程碑。</p></div><RouterLink to="/programs/new"><el-button type="primary">新建项目</el-button></RouterLink></div>
    <div class="project-roadmap"><span v-for="(program, index) in programs" :key="program.id"><b>{{ index + 1 }}</b>{{ program.name }}</span></div>
    <div class="program-card-grid">
      <article v-for="program in programs" :key="program.id" class="panel program-card">
        <RouterLink :to="`/programs/${program.id}`" class="program-card-image"><img :src="program.image" :alt="program.name" @error="($event.target as HTMLImageElement).src='/assets/hardware-placeholder.png'" /><el-tag :type="levelType(program.level)">{{ program.level }}</el-tag></RouterLink>
        <div class="program-card-body"><div class="program-card-title"><div><RouterLink :to="`/programs/${program.id}`"><h3>{{ program.name }}</h3></RouterLink><p>{{ program.description }}</p></div><el-tag :type="program.status === '正常' ? 'success' : 'warning'">{{ program.status }}</el-tag></div><div class="program-card-meta"><span><small>控制器</small>{{ program.controller }}</span><span><small>开发周期</small>{{ program.duration }}</span><span><small>当前阶段</small>{{ program.stage }}</span></div><div class="program-card-hardware"><span v-for="item in program.hardware.slice(0, 3)" :key="item">{{ item }}</span><b v-if="program.hardware.length > 3">+{{ program.hardware.length - 3 }}</b></div><div class="program-card-actions"><RouterLink :to="`/programs/${program.id}`"><el-button type="primary">查看项目清单</el-button></RouterLink><RouterLink :to="`/programs/${program.id}/edit`"><el-button>积木编程</el-button></RouterLink><RouterLink :to="`/programs/${program.id}/remote`"><el-button :icon="VideoPlay">遥控器</el-button></RouterLink></div></div>
      </article>
    </div>
  </section>
</template>
