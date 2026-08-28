<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { Box, ChatDotRound, Collection, Connection, Expand, Fold, House, List, Moon, Reading, ShoppingCart, Sunny, User } from '@element-plus/icons-vue'

const sidebarCollapsed = ref(localStorage.getItem('edgebrain-sidebar-collapsed') === 'true')
const route = useRoute()
const theme = ref(localStorage.getItem('edgebrain-theme') === 'dark' ? 'dark' : 'light')
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('edgebrain-sidebar-collapsed', String(sidebarCollapsed.value))
}
function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('edgebrain-theme', theme.value)
}
watchEffect(() => { document.documentElement.dataset.theme = theme.value })
watch(() => route.meta.fullscreenEditor, (isFullscreen) => {
  if (isFullscreen) sidebarCollapsed.value = true
}, { immediate: true })
</script>

<template>
  <div class="app-shell" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <aside class="sidebar">
      <div class="brand">
        <img src="/assets/edgebrain-logo.png" alt="EdgeBrain" />
        <div class="brand-copy"><strong>EdgeBrain</strong><span>边缘智造</span></div>
      </div>
      <nav aria-label="主导航">
        <RouterLink to="/" title="积木工作室"><el-icon><House /></el-icon><span>积木工作室</span></RouterLink>
        <RouterLink to="/components" title="硬件设备"><el-icon><Box /></el-icon><span>硬件设备</span></RouterLink>
        <RouterLink to="/devices" title="控制器"><el-icon><Connection /></el-icon><span>控制器</span></RouterLink>
        <RouterLink to="/ai" title="AI 助手"><el-icon><ChatDotRound /></el-icon><span>AI 助手</span></RouterLink>
        <RouterLink to="/programs" title="项目"><el-icon><Collection /></el-icon><span>项目</span></RouterLink>
        <RouterLink to="/todos" title="教学任务"><el-icon><List /></el-icon><span>教学任务</span></RouterLink>
        <RouterLink to="/knowledge" title="系统知识"><el-icon><Reading /></el-icon><span>系统知识</span></RouterLink>
        <RouterLink to="/marketplace" title="商城"><el-icon><ShoppingCart /></el-icon><span>商城</span></RouterLink>
        <RouterLink to="/profile" title="我的"><el-icon><User /></el-icon><span>我的</span></RouterLink>
      </nav>
      <div class="sidebar-footer">
        <button class="theme-toggle" type="button" :aria-label="theme === 'light' ? '切换深色模式' : '切换浅色模式'" @click="toggleTheme"><el-icon><Moon v-if="theme === 'light'" /><Sunny v-else /></el-icon><span>{{ theme === 'light' ? '深色模式' : '浅色模式' }}</span></button>
        <button class="collapse-toggle" type="button" :aria-label="sidebarCollapsed ? '展开菜单' : '收起菜单'" @click="toggleSidebar"><el-icon><Expand v-if="sidebarCollapsed" /><Fold v-else /></el-icon><span>收起</span></button>
      </div>
    </aside>
    <main><RouterView /></main>
  </div>
</template>
