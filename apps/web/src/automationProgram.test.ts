import { describe, expect, it } from 'vitest'
import { parseAutomationProgram, programToBlockDescriptors, type AutomationProgram } from './automationProgram.js'

describe('programToBlockDescriptors', () => {
  it('turns validated automation IR into editable block descriptors', () => {
    const program: AutomationProgram = {
      schema_version: '1.0',
      name: '测试程序',
      trigger: 'manual',
      steps: [
        {
          type: 'device_command',
          device_id: 'sim-ble-light-001',
          capability: 'light.turn_on',
          parameters: {},
        },
        { type: 'wait', duration_ms: 3000 },
        {
          type: 'device_command',
          device_id: 'sim-ble-light-001',
          capability: 'light.turn_off',
          parameters: {},
        },
      ],
    }

    expect(programToBlockDescriptors(program)).toEqual([
      { type: 'edge_light_on' },
      { type: 'edge_wait', value: 3 },
      { type: 'edge_light_off' },
    ])
  })
})

describe('parseAutomationProgram', () => {
  it('rejects imported programs with unsafe capabilities', () => {
    expect(() => parseAutomationProgram({ schema_version: '1.0', name: '危险程序', trigger: 'manual', steps: [{ type: 'device_command', device_id: 'x', capability: 'shell.execute', parameters: {} }] })).toThrow('白名单')
  })
})
