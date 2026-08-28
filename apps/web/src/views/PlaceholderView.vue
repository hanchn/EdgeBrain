<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const title = computed(() => String(route.meta.title ?? '功能'))
const description = computed(() => String(route.meta.description ?? '功能建设中'))
</script>
<template><section class="page"><div class="page-heading"><div><h2>{{ title }}</h2><p>{{ description }}</p></div></div><div class="panel empty-state"><div><h3>功能已进入规划</h3><p>当前版本先完成核心硬件与项目链路。</p></div></div></section></template>
