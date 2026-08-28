export type AutomationStep =
  | {
      type: 'device_command'
      device_id: string
      capability: 'light.turn_on' | 'light.turn_off' | 'light.set_brightness'
      parameters: { brightness?: number }
    }
  | { type: 'wait'; duration_ms: number }

export interface AutomationProgram {
  schema_version: '1.0'
  name: string
  trigger: 'manual' | 'voice'
  steps: AutomationStep[]
}

export interface BlockDescriptor {
  type: 'edge_light_on' | 'edge_light_off' | 'edge_light_brightness' | 'edge_wait'
  value?: number
}

export function programToBlockDescriptors(program: AutomationProgram): BlockDescriptor[] {
  return program.steps.map((step) => {
    if (step.type === 'wait') return { type: 'edge_wait', value: step.duration_ms / 1000 }
    if (step.capability === 'light.turn_on') return { type: 'edge_light_on' }
    if (step.capability === 'light.turn_off') return { type: 'edge_light_off' }
    return { type: 'edge_light_brightness', value: step.parameters.brightness ?? 60 }
  })
}

export function parseAutomationProgram(value: unknown): AutomationProgram {
  if (!value || typeof value !== 'object') throw new Error('JSON 顶层必须是对象')
  const candidate = value as Partial<AutomationProgram>
  if (candidate.schema_version !== '1.0' || typeof candidate.name !== 'string') throw new Error('程序版本或名称无效')
  if (candidate.trigger !== 'manual' && candidate.trigger !== 'voice') throw new Error('触发方式无效')
  if (!Array.isArray(candidate.steps) || candidate.steps.length < 1 || candidate.steps.length > 50) throw new Error('步骤数量必须为 1 到 50')
  const capabilities = new Set(['light.turn_on', 'light.turn_off', 'light.set_brightness'])
  for (const step of candidate.steps) {
    if (step.type === 'wait') {
      if (!Number.isInteger(step.duration_ms) || step.duration_ms < 100 || step.duration_ms > 60_000) throw new Error('等待时间超出范围')
    } else if (step.type === 'device_command') {
      if (!capabilities.has(step.capability) || typeof step.device_id !== 'string') throw new Error('设备能力不在白名单')
      if (step.capability === 'light.set_brightness') {
        const brightness = step.parameters?.brightness
        if (typeof brightness !== 'number' || !Number.isInteger(brightness) || brightness < 0 || brightness > 100) throw new Error('亮度必须为 0 到 100')
      }
    } else throw new Error('存在未知步骤')
  }
  return candidate as AutomationProgram
}
