<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, type UploadProps } from 'element-plus'
import { useRouter } from 'vue-router'
import { requestJson, type ComponentRecord } from '@/api'

const router = useRouter()
const saving = ref(false)
const form = reactive({ name: '', model: '', store_name: '', purchase_url: '', price: 0, description: '', image_path: '/assets/hardware-placeholder.png' })
const uploadSuccess: UploadProps['onSuccess'] = (response) => { form.image_path = response.path; ElMessage.success('主图已上传') }
const uploadError: UploadProps['onError'] = () => ElMessage.error('图片上传失败，请使用 5 MB 以内的 JPG、PNG 或 WEBP')
async function save() {
  saving.value = true
  try {
    const created = await requestJson<ComponentRecord>('/api/components', { method: 'POST', body: JSON.stringify({ ...form, price_cents: Math.round(form.price * 100), price: undefined }) })
    ElMessage.success('配件档案已建立')
    await router.push(`/components/${created.id}`)
  } catch (reason) { ElMessage.error(reason instanceof Error ? reason.message : '保存失败') }
  finally { saving.value = false }
}
</script>

<template><section class="page form-page"><div class="page-heading"><div><h2>新增配件</h2><p>建立采购来源和详细说明；没有图片时使用默认图。</p></div><RouterLink to="/components"><el-button>返回列表</el-button></RouterLink></div><article class="panel"><el-form label-position="top" @submit.prevent="save"><el-form-item label="配件主图（可选）"><el-upload action="/api/media/images" name="image" :show-file-list="false" accept="image/jpeg,image/png,image/webp" :on-success="uploadSuccess" :on-error="uploadError"><img :src="form.image_path" style="width:180px;height:130px;object-fit:cover;border-radius:12px" /><el-button style="margin-left:12px">选择图片</el-button></el-upload></el-form-item><el-row :gutter="16"><el-col :span="12"><el-form-item label="名称"><el-input v-model="form.name" /></el-form-item></el-col><el-col :span="12"><el-form-item label="型号"><el-input v-model="form.model" /></el-form-item></el-col></el-row><el-row :gutter="16"><el-col :span="12"><el-form-item label="采购店铺"><el-input v-model="form.store_name" /></el-form-item></el-col><el-col :span="12"><el-form-item label="价格"><el-input-number v-model="form.price" :min="0" :precision="2" style="width:100%" /></el-form-item></el-col></el-row><el-form-item label="采购链接"><el-input v-model="form.purchase_url" /></el-form-item><el-form-item label="详细描述"><el-input v-model="form.description" type="textarea" :rows="6" /></el-form-item><el-button type="primary" native-type="submit" :loading="saving" :disabled="!form.name">保存档案</el-button></el-form></article></section></template>
