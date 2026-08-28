<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { requestJson } from '@/api'

const router = useRouter()
const form = reactive({ title: '', kind: 'fact', content: '', source: 'manual', confidence: 1 })
async function save() { await requestJson('/api/knowledge', { method: 'POST', body: JSON.stringify(form) }); ElMessage.success('知识候选已暂存，审核通过后才会进入索引'); await router.push('/knowledge') }
</script>

<template><section class="page form-page"><div class="page-heading"><div><span class="hero-kicker">候选区</span><h2>提交知识候选</h2><p>人工补充只进入待审核区，不会立即改变系统行为。</p></div><RouterLink to="/knowledge"><el-button>返回文件库</el-button></RouterLink></div><article class="panel"><el-alert title="提交后需要审核、分块和索引，才会被端侧 AI 使用" type="info" :closable="false" show-icon style="margin-bottom:22px" /><el-form label-position="top" @submit.prevent="save"><el-form-item label="标题"><el-input v-model="form.title" /></el-form-item><el-form-item label="知识类型"><el-select v-model="form.kind" style="width:100%"><el-option label="事实" value="fact" /><el-option label="操作流程" value="procedure" /><el-option label="纠正" value="correction" /><el-option label="失败经验" value="failure" /><el-option label="设备档案" value="device_profile" /></el-select></el-form-item><el-form-item label="来源"><el-input v-model="form.source" placeholder="文件路径、设备日志或人工记录" /></el-form-item><el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="9" /></el-form-item><el-button type="primary" native-type="submit" :disabled="!form.title || !form.content">提交到待审核区</el-button></el-form></article></section></template>
