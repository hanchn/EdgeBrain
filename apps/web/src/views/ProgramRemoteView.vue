<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Bottom, CaretTop, SwitchButton } from '@element-plus/icons-vue'
import { programs, type ProgramRecord } from '@/programData'

const route = useRoute()
const program = computed<ProgramRecord>(() => programs.find(item => item.id === route.params.id) ?? programs[0]!)
const connected = ref(true)
const brightness = ref(65)
const speed = ref(45)
const fanOn = ref(false)
const lightOn = ref(true)
const lightColor = ref('#3c86ff')
const threshold = ref(35)
const distance = ref(62)
const expression = ref('微笑')
function command(name: string) { ElMessage.success(`已发送：${name}`) }
</script>

<template>
  <section class="page remote-page">
    <div class="page-heading">
      <div><span class="hero-kicker">虚拟遥控器</span><h2>{{ program.name }}</h2><p>控制项会根据项目绑定的硬件自动组合。</p></div>
      <div class="heading-actions"><el-tag :type="connected ? 'success' : 'info'">{{ connected ? '设备已连接' : '设备未连接' }}</el-tag><RouterLink :to="`/programs/${program.id}`"><el-button>返回项目</el-button></RouterLink></div>
    </div>
    <div class="remote-layout">
      <article class="panel remote-device-card">
        <img class="remote-project-image" :src="program.image" :alt="program.name" @error="($event.target as HTMLImageElement).src='/assets/hardware-placeholder.png'" />
        <h3>{{ program.name }}</h3><p>{{ program.description }}</p>
        <div class="remote-hardware"><span v-for="item in program.hardware" :key="item">{{ item }}</span></div>
        <el-switch v-model="connected" active-text="连接" inactive-text="断开" />
      </article>
      <article class="panel remote-console">
        <template v-if="program.remote === 'light'">
          <div class="panel-title"><h3>灯光控制</h3><el-tag type="success">BLE 状态已同步</el-tag></div>
          <div class="remote-light-preview" :class="{ on: lightOn }" :style="{ '--lamp-color': lightColor }"><span></span><small>{{ lightOn ? `${brightness}%` : '已关闭' }}</small></div>
          <div class="remote-toggle"><div><strong>蓝牙 RGB 小灯</strong><p>开关指令会等待设备状态回报</p></div><el-switch v-model="lightOn" @change="command(lightOn ? '打开小灯' : '关闭小灯')" /></div>
          <label class="remote-slider"><span>亮度</span><el-slider v-model="brightness" show-input @change="command(`亮度 ${brightness}%`)" /></label>
          <div class="remote-color"><span>灯光颜色</span><el-color-picker v-model="lightColor" @change="command(`颜色 ${lightColor}`)" /></div>
        </template>
        <template v-else-if="program.remote === 'switch'">
          <div class="panel-title"><h3>低压开关</h3><el-button type="danger" plain :icon="SwitchButton" @click="command('立即断开继电器')">安全断开</el-button></div>
          <div class="remote-switch-visual" :class="{ on: lightOn }"><span></span><strong>{{ lightOn ? '继电器已吸合' : '继电器已断开' }}</strong><small>5V 低压 LED 负载</small></div>
          <div class="remote-toggle"><div><strong>智能开关</strong><p>禁止连接 220V 市电</p></div><el-switch v-model="lightOn" @change="command(lightOn ? '打开低压开关' : '关闭低压开关')" /></div>
        </template>
        <template v-else-if="program.remote === 'sensor-light'">
          <div class="panel-title"><h3>距离联动调试</h3><el-tag type="info">每 100ms 更新</el-tag></div>
          <div class="sensor-metrics"><div><span>当前距离</span><strong>{{ distance }}cm</strong></div><div><span>触发阈值</span><strong>{{ threshold }}cm</strong></div><div><span>灯光状态</span><strong>{{ distance < threshold ? '自动开启' : '保持关闭' }}</strong></div></div>
          <label class="remote-slider"><span>模拟距离</span><el-slider v-model="distance" :max="200" show-input /></label>
          <label class="remote-slider"><span>触发阈值</span><el-slider v-model="threshold" :max="100" show-input @change="command(`阈值 ${threshold}cm`)" /></label>
          <div class="remote-toggle"><div><strong>手动覆盖灯光</strong><p>调试结束后恢复自动模式</p></div><el-switch v-model="lightOn" @change="command(lightOn ? '手动开灯' : '恢复自动控制')" /></div>
        </template>
        <template v-else-if="program.remote === 'car'">
          <div class="panel-title"><h3>方向与速度</h3><el-button type="danger" plain :icon="SwitchButton" @click="command('紧急停止')">急停</el-button></div>
          <div class="d-pad" aria-label="小车方向控制">
            <el-button class="up" circle :icon="CaretTop" aria-label="前进" @click="command('前进')" />
            <el-button class="left" circle aria-label="左转" @click="command('左转')">←</el-button>
            <el-button class="stop" circle aria-label="停止" @click="command('停止')">■</el-button>
            <el-button class="right" circle aria-label="右转" @click="command('右转')">→</el-button>
            <el-button class="down" circle :icon="Bottom" aria-label="后退" @click="command('后退')" />
          </div>
          <label class="remote-slider"><span>速度</span><el-slider v-model="speed" show-input /></label>
        </template>
        <template v-else-if="program.remote === 'display'">
          <div class="panel-title"><h3>显示控制</h3></div>
          <div class="expression-preview">{{ expression === '微笑' ? '◡' : expression === '爱心' ? '♥' : '•ᴗ•' }}</div>
          <el-segmented v-model="expression" :options="['微笑', '爱心', '眨眼']" block @change="command(`显示${expression}`)" />
          <label class="remote-slider"><span>屏幕亮度</span><el-slider v-model="brightness" show-input /></label>
        </template>
        <template v-else>
          <div class="panel-title"><h3>环境联动</h3></div>
          <div class="sensor-metrics"><div><span>温度</span><strong>24.6℃</strong></div><div><span>湿度</span><strong>53%</strong></div><div><span>空气质量</span><strong>优</strong></div></div>
          <div class="remote-toggle"><div><strong>通风风扇</strong><p>超过阈值时可自动开启</p></div><el-switch v-model="fanOn" @change="command(fanOn ? '开启风扇' : '关闭风扇')" /></div>
          <label class="remote-slider"><span>风扇转速</span><el-slider v-model="speed" show-input /></label>
        </template>
      </article>
    </div>
  </section>
</template>
