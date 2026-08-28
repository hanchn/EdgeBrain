<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const form = reactive({ name: '', hardware: [] as string[], description: '' })
const hardwareOptions = ['EdgeBrain 控制器', '模拟蓝牙小灯', '超声波传感器', 'LED 点阵屏', '温湿度传感器']
async function create() {
  if (!form.name || !form.hardware.length) return
  localStorage.setItem('edgebrain-new-program', JSON.stringify(form))
  ElMessage.success('项目信息已创建，开始搭建积木')
  await router.push('/programs/new-project/edit')
}
</script>

<template><section class="page form-page"><div class="page-heading"><div><h2>新建项目</h2><p>先建立项目资料，再进入积木编辑器。</p></div><RouterLink to="/programs"><el-button>返回项目列表</el-button></RouterLink></div><article class="panel"><el-steps :active="0" simple style="margin-bottom:28px"><el-step title="项目资料" /><el-step title="积木搭建" /><el-step title="检查运行" /></el-steps><el-form label-position="top" @submit.prevent="create"><el-form-item label="项目名称（必填）"><el-input v-model="form.name" placeholder="例如：蓝牙小灯定时开关" maxlength="120" /></el-form-item><el-form-item label="绑定硬件（必填）"><el-select v-model="form.hardware" multiple style="width:100%" placeholder="选择这个项目要控制的硬件"><el-option v-for="item in hardwareOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item><el-form-item label="项目描述"><el-input v-model="form.description" type="textarea" :rows="5" placeholder="说明这个项目要解决什么问题、如何工作" maxlength="1000" /></el-form-item><el-button type="primary" native-type="submit" :disabled="!form.name || !form.hardware.length">创建并进入积木编辑器</el-button></el-form></article></section></template>
