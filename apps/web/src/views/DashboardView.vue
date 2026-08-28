<script setup lang="ts">
import { Box, Connection, Monitor, Right } from '@element-plus/icons-vue'
import { programs } from '@/programData'

const recentPrograms = programs.slice(0, 4)
</script>

<template>
  <section class="page dashboard">
    <div class="lab-hero">
      <div class="hero-copy">
        <span class="hero-kicker">Edge AI Maker Lab</span>
        <h1>我的硬件实验室</h1>
        <p>连接、编程、创造，<br />让想法动起来！</p>
        <div class="hero-actions"><RouterLink class="primary-action" to="/programs/new">开始搭建 <el-icon><Right /></el-icon></RouterLink><RouterLink class="text-action" to="/programs/new">新建项目 →</RouterLink></div>
      </div>
      <div class="hero-visual"><img src="/assets/hardware-lab-hero.png" alt="装有超声波传感器和控制器的硬件小车" /></div>
      <aside class="online-panel">
        <h2 class="section-title"><span class="online-dot"></span>设备在线</h2>
        <div class="device-list">
          <div class="device-row"><span class="device-icon"><el-icon><Monitor /></el-icon></span><strong>EdgeBrain 控制器</strong><span>在线</span></div>
          <div class="device-row"><span class="device-icon"><el-icon><Connection /></el-icon></span><strong>超声波传感器</strong><span>在线</span></div>
          <div class="device-row"><span class="device-icon"><el-icon><Box /></el-icon></span><strong>舵机 SG90</strong><span>在线</span></div>
        </div>
        <RouterLink class="more-link" to="/devices">查看全部设备（3） →</RouterLink>
      </aside>
    </div>
    <div class="work-grid">
      <section class="work-section">
        <h2>待办</h2>
        <div class="task-feature"><span class="progress-ring"></span><div><strong>避障小车入门</strong><p>学习如何让小车自动避开前方障碍物<br />预计 30 分钟</p></div><RouterLink class="text-action" to="/programs/robot-car/edit">继续学习 →</RouterLink></div>
        <div class="task-list"><div class="task-row"><span class="task-icon">01</span><strong>完成避障小车程序</strong><span>›</span></div><div class="task-row"><span class="task-icon">02</span><strong>了解超声波传感器工作原理</strong><span>›</span></div><div class="task-row"><span class="task-icon">03</span><strong>尝试调整小车速度和灵敏度</strong><span>›</span></div></div>
        <RouterLink class="more-link" to="/todos">查看全部任务 →</RouterLink>
      </section>
      <section class="work-section">
        <h2>最近项目</h2>
        <div class="project-list">
          <RouterLink v-for="program in recentPrograms" :key="program.id" class="project-row detail-link" :to="`/programs/${program.id}`">
            <img :src="program.image" :alt="program.name" @error="($event.target as HTMLImageElement).src='/assets/hardware-placeholder.png'" />
            <div><strong>{{ program.name }}</strong><p>{{ program.description }}</p></div>
            <time>{{ program.updated }}</time>
          </RouterLink>
        </div>
        <RouterLink class="more-link" to="/programs">查看全部项目 →</RouterLink>
      </section>
    </div>
  </section>
</template>
