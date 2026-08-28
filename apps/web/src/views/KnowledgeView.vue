<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { DocumentAdd, Refresh, Search } from '@element-plus/icons-vue'
import { requestJson, type KnowledgeRecord } from '@/api'
import { systemKnowledgeFiles, type KnowledgeCategory, type KnowledgeStatus, type SystemKnowledgeFile } from '@/knowledgeData'

type CategoryFilter = '全部文件' | KnowledgeCategory
const categories: CategoryFilter[] = ['全部文件', '架构与决策', '产品需求', '设备与控制器', '运行流程', '学习记录']
const entries = ref<KnowledgeRecord[]>([])
const query = ref('')
const category = ref<CategoryFilter>('全部文件')
const status = ref<'全部状态' | KnowledgeStatus>('全部状态')
const loading = ref(false)
const syncedAt = ref('刚刚')

const apiFiles = computed<SystemKnowledgeFile[]>(() => entries.value.map(entry => ({
  id: `entry-${entry.id}`, title: entry.title, path: entry.source, category: '学习记录', type: '系统记录',
  status: entry.status === 'approved' ? '已索引' : '待审核', source: entry.source, version: `entry-${entry.id}`,
  updated: new Date(entry.created_at).toLocaleString('zh-CN'), chunks: entry.status === 'approved' ? 1 : 0,
  summary: entry.content.slice(0, 110), content: entry.content, tags: [entry.kind],
})))
const allFiles = computed(() => [...systemKnowledgeFiles, ...apiFiles.value])
const filtered = computed(() => allFiles.value.filter(file => {
  const matchesCategory = category.value === '全部文件' || file.category === category.value
  const matchesStatus = status.value === '全部状态' || file.status === status.value
  const needle = query.value.trim().toLowerCase()
  const matchesQuery = !needle || `${file.title} ${file.path} ${file.summary} ${file.tags.join(' ')}`.toLowerCase().includes(needle)
  return matchesCategory && matchesStatus && matchesQuery
}))
const countFor = (item: CategoryFilter) => item === '全部文件' ? allFiles.value.length : allFiles.value.filter(file => file.category === item).length
const indexedCount = computed(() => allFiles.value.filter(file => file.status === '已索引').length)
const pendingCount = computed(() => allFiles.value.filter(file => file.status === '待审核').length)
const chunkCount = computed(() => allFiles.value.reduce((sum, file) => sum + file.chunks, 0))
const statusType = (value: KnowledgeStatus) => value === '已索引' ? 'success' : value === '待审核' ? 'warning' : 'danger'

async function load() {
  loading.value = true
  try { entries.value = await requestJson<KnowledgeRecord[]>('/api/knowledge'); syncedAt.value = '刚刚' }
  finally { loading.value = false }
}
onMounted(load)
</script>

<template>
  <section class="page knowledge-page">
    <div class="page-heading">
      <div><span class="hero-kicker">系统内部资产</span><h2>系统知识库</h2><p>为设备控制、方案生成、AI 检索和自学习提供可追溯的建设资料。</p></div>
      <div class="heading-actions"><el-tag type="info">默认由系统维护</el-tag><el-button :icon="Refresh" :loading="loading" @click="load">同步</el-button><RouterLink to="/knowledge/new"><el-button type="primary" :icon="DocumentAdd">提交知识候选</el-button></RouterLink></div>
    </div>
    <div class="knowledge-metrics">
      <div><span>文件总数</span><strong>{{ allFiles.length }}</strong><small>含系统记录</small></div>
      <div><span>已完成索引</span><strong>{{ indexedCount }}</strong><small>可供 AI 检索</small></div>
      <div><span>待人工审核</span><strong>{{ pendingCount }}</strong><small>不会进入长期记忆</small></div>
      <div><span>检索分块</span><strong>{{ chunkCount }}</strong><small>最近同步 {{ syncedAt }}</small></div>
    </div>
    <div class="knowledge-workspace">
      <aside class="panel knowledge-sidebar">
        <div class="knowledge-side-title"><strong>资料分类</strong><span>自动归档</span></div>
        <button v-for="item in categories" :key="item" type="button" :class="{ active: category === item }" @click="category = item"><span>{{ item }}</span><b>{{ countFor(item) }}</b></button>
        <div class="knowledge-boundary"><strong>学习边界</strong><p>安全白名单、急停规则和危险参数不可由系统自行改写。</p></div>
      </aside>
      <main class="panel knowledge-files">
        <div class="knowledge-toolbar"><el-input v-model="query" clearable placeholder="搜索文件名、路径、标签或内容摘要"><template #prefix><el-icon><Search /></el-icon></template></el-input><el-select v-model="status" style="width:150px"><el-option label="全部状态" value="全部状态" /><el-option label="已索引" value="已索引" /><el-option label="待审核" value="待审核" /><el-option label="需更新" value="需更新" /></el-select></div>
        <div class="knowledge-list-head"><span>文件与用途</span><span>来源</span><span>索引</span><span>状态</span><span>更新</span></div>
        <RouterLink v-for="file in filtered" :key="file.id" class="knowledge-file-row" :to="`/knowledge/${file.id}`">
          <div class="knowledge-file-name"><span class="file-type">{{ file.type === 'Markdown' ? 'MD' : file.type === 'JSON' ? 'JSON' : 'LOG' }}</span><div><strong>{{ file.title }}</strong><p>{{ file.summary }}</p><code>{{ file.path }}</code></div></div>
          <span>{{ file.source }}</span><span>{{ file.chunks }} 块</span><span><el-tag :type="statusType(file.status)" size="small">{{ file.status }}</el-tag></span><time>{{ file.updated }}</time>
        </RouterLink>
        <el-empty v-if="!filtered.length" description="没有符合当前条件的系统文件" />
      </main>
    </div>
  </section>
</template>
