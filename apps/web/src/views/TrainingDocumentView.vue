<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { Download } from '@element-plus/icons-vue'
import { solutions, type SolutionRecord } from '@/solutionData'

const route = useRoute()
const solution = computed<SolutionRecord>(() => solutions.find(item => item.id === route.params.id) ?? solutions[0]!)
const storageKey = computed(() => `edgebrain-training-${solution.value.id}`)
const defaultMarkdown = computed(() => `# ${solution.value.name}培训文档

> 适用等级：${solution.value.level}  
> 推荐控制器：${solution.value.controller}  
> 预计学习时间：${solution.value.duration}

## 学习目标

${solution.value.description}

完成本课后，学习者能够识别核心配件、完成安全连接，并用积木程序控制硬件。

## 课前准备

${solution.value.bom.map(item => `- ${item.name} × ${item.quantity}：${item.role}`).join('\n')}

## 搭建步骤

${solution.value.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## 编程能力

${solution.value.capabilities.map(item => `- \`${item}\``).join('\n')}

## 安全检查

- 只使用方案规定的低压供电。
- 通电前再次核对正负极和信号线。
- 首次运行时保留人工确认，并准备立即断电。

## 练习任务

修改一个参数，观察硬件响应，并在下方记录结果。
`)
const markdown = ref(localStorage.getItem(storageKey.value) ?? defaultMarkdown.value)
const mode = ref<'preview' | 'edit'>('preview')
const rendered = computed(() => DOMPurify.sanitize(marked.parse(markdown.value) as string))
function save() { localStorage.setItem(storageKey.value, markdown.value); ElMessage.success('培训文档已保存在本机') }
function download() {
  const blob = new Blob([markdown.value], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${solution.value.name}-培训文档.md`; anchor.click(); URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="page training-page">
    <div class="page-heading"><div><span class="hero-kicker">培训文档</span><h2>{{ solution.name }}</h2><p>预览教学内容，或切换编辑模式维护 Markdown 原文。</p></div><div class="heading-actions"><RouterLink :to="`/solutions/${solution.id}`"><el-button>返回方案</el-button></RouterLink><el-button-group><el-button :type="mode === 'preview' ? 'primary' : 'default'" @click="mode = 'preview'">预览</el-button><el-button :type="mode === 'edit' ? 'primary' : 'default'" @click="mode = 'edit'">编辑</el-button></el-button-group><el-button v-if="mode === 'edit'" type="primary" @click="save">保存</el-button><el-button :icon="Download" @click="download">下载 .md</el-button></div></div>
    <article v-if="mode === 'preview'" class="panel markdown-preview" aria-label="培训文档预览" v-html="rendered"></article>
    <article v-else class="panel markdown-editor"><label for="training-markdown">Markdown 内容</label><textarea id="training-markdown" v-model="markdown" spellcheck="false" aria-describedby="markdown-help"></textarea><p id="markdown-help">支持标题、列表、引用和代码标记。保存后仅存于当前电脑。</p></article>
  </section>
</template>
