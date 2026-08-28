<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Connection, Refresh } from '@element-plus/icons-vue'
import { systemKnowledgeFiles } from '@/knowledgeData'

const route = useRoute()
const file = computed(() => systemKnowledgeFiles.find(item => item.id === route.params.id) ?? systemKnowledgeFiles[0]!)
function reindex() { ElMessage.success('已加入重新索引队列') }
</script>

<template>
  <section class="page knowledge-detail-page">
    <div class="page-heading"><div><span class="hero-kicker">{{ file.category }}</span><h2>{{ file.title }}</h2><p>{{ file.summary }}</p></div><div class="heading-actions"><RouterLink to="/knowledge"><el-button>返回文件库</el-button></RouterLink><el-button :icon="Refresh" @click="reindex">重新索引</el-button></div></div>
    <div class="knowledge-detail-layout">
      <article class="panel knowledge-document"><div class="document-path"><span>{{ file.type }}</span><code>{{ file.path }}</code></div><div class="document-content"><h1>{{ file.title }}</h1><p v-for="paragraph in file.content.split('\n').filter(Boolean)" :key="paragraph" :class="{ 'doc-heading': paragraph.startsWith('#') }">{{ paragraph.replace(/^#+\s*/, '') }}</p></div></article>
      <aside class="knowledge-inspector">
        <article class="panel"><div class="panel-title"><h3>索引信息</h3><el-tag type="success">{{ file.status }}</el-tag></div><dl class="knowledge-meta"><div><dt>版本</dt><dd>{{ file.version }}</dd></div><div><dt>来源</dt><dd>{{ file.source }}</dd></div><div><dt>分块</dt><dd>{{ file.chunks }}</dd></div><div><dt>更新时间</dt><dd>{{ file.updated }}</dd></div></dl></article>
        <article class="panel"><div class="panel-title"><h3>检索标签</h3></div><div class="capability-list"><span v-for="tag in file.tags" :key="tag">{{ tag }}</span></div></article>
        <article class="panel knowledge-usage"><el-icon><Connection /></el-icon><div><strong>被系统使用</strong><p>方案生成、AI 问答、设备诊断和积木推荐会检索这份资料。</p></div></article>
      </aside>
    </div>
  </section>
</template>
