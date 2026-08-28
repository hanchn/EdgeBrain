<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { solutions } from '@/solutionData'
const route = useRoute(); const router = useRouter()
const existing = solutions.find(item => item.id === route.params.id)
const editing = computed(() => Boolean(existing))
const form = reactive({ name: existing?.name ?? '', level: existing?.level ?? '基础方案', controller: existing?.controller ?? '', description: existing?.description ?? '' })
async function save() { ElMessage.success(editing.value ? '方案修改已保存' : '新方案已建立'); await router.push(existing ? `/solutions/${existing.id}` : '/solutions') }
</script>
<template><section class="page form-page"><div class="page-heading"><div><h2>{{ editing ? '编辑方案' : '新建方案' }}</h2><p>定义目标、难度、控制器；保存后继续维护 BOM、接线和程序能力。</p></div><RouterLink to="/solutions"><el-button>返回列表</el-button></RouterLink></div><article class="panel"><el-form label-position="top" @submit.prevent="save"><el-form-item label="方案名称"><el-input v-model="form.name" /></el-form-item><el-form-item label="方案等级"><el-select v-model="form.level" style="width:100%"><el-option label="基础方案" value="基础方案" /><el-option label="进阶方案" value="进阶方案" /><el-option label="高阶方案" value="高阶方案" /></el-select></el-form-item><el-form-item label="控制器"><el-input v-model="form.controller" /></el-form-item><el-form-item label="详细描述"><el-input v-model="form.description" type="textarea" :rows="5" /></el-form-item><el-button type="primary" native-type="submit" :disabled="!form.name || !form.controller">保存方案</el-button></el-form></article></section></template>
