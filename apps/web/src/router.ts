import { createRouter, createWebHistory } from 'vue-router'

const legacySolutionProject: Record<string, string> = {
  'smart-switch': 'low-voltage-switch',
  'smart-car': 'robot-car',
  'environment-lab': 'environment-lab',
}
const projectPathForLegacySolution = (id?: string | string[]) => {
  const legacyId = String(id ?? '')
  return legacyId ? `/programs/${legacySolutionProject[legacyId] ?? legacyId}` : '/programs'
}

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/DashboardView.vue'), meta: { title: '工作台' } },
    { path: '/components', component: () => import('./views/ComponentsView.vue'), meta: { title: '配件管理' } },
    { path: '/components/new', component: () => import('./views/ComponentCreateView.vue'), meta: { title: '新增配件' } },
    { path: '/components/:id', component: () => import('./views/ComponentDetailView.vue'), meta: { title: '配件详情' } },
    { path: '/devices', component: () => import('./views/DevicesView.vue'), meta: { title: '设备控制' } },
    { path: '/solutions', redirect: '/programs' },
    { path: '/solutions/new', redirect: '/programs/new' },
    { path: '/solutions/:id', redirect: to => projectPathForLegacySolution(to.params.id) },
    { path: '/solutions/:id/edit', redirect: to => projectPathForLegacySolution(to.params.id) },
    { path: '/solutions/:id/training', redirect: to => projectPathForLegacySolution(to.params.id) },
    { path: '/programs', component: () => import('./views/ProgramsView.vue'), meta: { title: '项目' } },
    { path: '/programs/new', component: () => import('./views/ProgramCreateView.vue'), meta: { title: '新建项目' } },
    { path: '/programs/:id/circuit', component: () => import('./views/CircuitEditorView.vue'), meta: { title: '电路图编辑器', fullscreenEditor: true } },
    { path: '/programs/:id/edit', component: () => import('./views/StudioView.vue'), meta: { title: '积木编辑器', fullscreenEditor: true } },
    { path: '/programs/:id/remote', component: () => import('./views/ProgramRemoteView.vue'), meta: { title: '虚拟遥控器' } },
    { path: '/programs/:id', component: () => import('./views/ProgramDetailView.vue'), meta: { title: '项目详情' } },
    { path: '/studio', redirect: '/programs' },
    { path: '/ai', component: () => import('./views/PlaceholderView.vue'), meta: { title: 'AI 助手', description: '本地 AI 会帮助生成项目、解释硬件和诊断问题。' } },
    { path: '/todos', component: () => import('./views/PlaceholderView.vue'), meta: { title: '教学任务', description: '任务会关联硬件、课程和项目进度。' } },
    { path: '/marketplace', component: () => import('./views/MarketplaceView.vue'), meta: { title: '商城' } },
    { path: '/profile', component: () => import('./views/PlaceholderView.vue'), meta: { title: '我的', description: '管理本机资料、偏好和权限。' } },
    { path: '/knowledge', component: () => import('./views/KnowledgeView.vue'), meta: { title: '系统知识库' } },
    { path: '/knowledge/new', component: () => import('./views/KnowledgeIngestView.vue'), meta: { title: '提交知识候选' } },
    { path: '/knowledge/:id', component: () => import('./views/KnowledgeDetailView.vue'), meta: { title: '知识文件详情' } },
  ],
})
