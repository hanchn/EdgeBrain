export type CircuitPartKind = 'controller' | 'power' | 'led' | 'relay' | 'sensor' | 'motor-driver' | 'motor' | 'servo' | 'resistor'
export type PortSide = 'left' | 'right'

export interface CircuitPort {
  id: string
  label: string
  side: PortSide
}

export interface CircuitNode {
  id: string
  kind: CircuitPartKind
  label: string
  subtitle: string
  x: number
  y: number
  ports: CircuitPort[]
}

export interface CircuitWire {
  id: string
  fromNode: string
  fromPort: string
  toNode: string
  toPort: string
  color: string
  label: string
}

export interface CircuitDiagram {
  title: string
  notes: string[]
  nodes: CircuitNode[]
  wires: CircuitWire[]
}

export const circuitPartLibrary: Omit<CircuitNode, 'id' | 'x' | 'y'>[] = [
  { kind: 'controller', label: 'ESP32 控制器', subtitle: '3.3V 逻辑', ports: [{ id: '3v3', label: '3V3', side: 'left' }, { id: 'gnd', label: 'GND', side: 'left' }, { id: 'gpio1', label: 'GPIO 4', side: 'right' }, { id: 'gpio2', label: 'GPIO 5', side: 'right' }] },
  { kind: 'power', label: '5V 电源', subtitle: '低压直流', ports: [{ id: 'gnd', label: 'GND', side: 'right' }, { id: 'vcc', label: '5V', side: 'right' }] },
  { kind: 'led', label: 'LED 模块', subtitle: '受控负载', ports: [{ id: 'gnd', label: 'GND', side: 'left' }, { id: 'vcc', label: 'VCC', side: 'left' }, { id: 'data', label: 'DATA', side: 'left' }] },
  { kind: 'relay', label: '光耦继电器', subtitle: '5V 单路', ports: [{ id: 'dc-', label: 'DC-', side: 'left' }, { id: 'dc+', label: 'DC+', side: 'left' }, { id: 'in', label: 'IN', side: 'left' }, { id: 'com', label: 'COM', side: 'right' }, { id: 'no', label: 'NO', side: 'right' }] },
  { kind: 'sensor', label: '超声波传感器', subtitle: 'HC-SR04', ports: [{ id: 'vcc', label: 'VCC', side: 'left' }, { id: 'gnd', label: 'GND', side: 'left' }, { id: 'trig', label: 'TRIG', side: 'left' }, { id: 'echo', label: 'ECHO', side: 'left' }] },
  { kind: 'motor-driver', label: '电机驱动', subtitle: '双路 H 桥', ports: [{ id: 'vcc', label: 'VM', side: 'left' }, { id: 'gnd', label: 'GND', side: 'left' }, { id: 'in1', label: 'IN1', side: 'left' }, { id: 'in2', label: 'IN2', side: 'left' }, { id: 'out-a+', label: 'A+', side: 'right' }, { id: 'out-a-', label: 'A−', side: 'right' }, { id: 'out-b+', label: 'B+', side: 'right' }, { id: 'out-b-', label: 'B−', side: 'right' }] },
  { kind: 'motor', label: '直流电机', subtitle: '低压电机', ports: [{ id: 'minus', label: '−', side: 'left' }, { id: 'plus', label: '+', side: 'left' }] },
  { kind: 'servo', label: '舵机', subtitle: 'SG90', ports: [{ id: 'gnd', label: 'GND', side: 'left' }, { id: 'vcc', label: '5V', side: 'left' }, { id: 'signal', label: 'PWM', side: 'left' }] },
  { kind: 'resistor', label: '分压电阻', subtitle: '保护 3.3V 输入', ports: [{ id: 'in', label: 'IN', side: 'left' }, { id: 'gnd', label: 'GND', side: 'left' }, { id: 'out', label: 'OUT', side: 'right' }] },
]

const controller = (id: string, x: number, y: number, gpioLabels: string[] = ['GPIO 4', 'GPIO 5']): CircuitNode => ({
  id, kind: 'controller', label: 'ESP32 控制器', subtitle: '3.3V 逻辑', x, y,
  ports: [{ id: '3v3', label: '3V3', side: 'left' }, { id: 'gnd', label: 'GND', side: 'left' }, ...gpioLabels.map((label, index) => ({ id: `gpio${index + 1}`, label, side: 'right' as const }))],
})

const diagrams: Record<string, CircuitDiagram> = {
  'bluetooth-light': {
    title: '蓝牙 RGB 小灯电路', notes: ['ESP32 与 LED 必须共地', '灯光电源按模块额定电压接入', '首次上电将亮度限制为 30%'],
    nodes: [controller('esp32', 150, 250, ['GPIO 4 / DATA']), { ...circuitPartLibrary[2]!, id: 'rgb-led', label: 'RGB LED', x: 700, y: 250 }, { ...circuitPartLibrary[1]!, id: 'power', x: 150, y: 500 }],
    wires: [
      { id: 'w1', fromNode: 'esp32', fromPort: 'gpio1', toNode: 'rgb-led', toPort: 'data', color: '#2f80ed', label: 'DATA' },
      { id: 'w2', fromNode: 'power', fromPort: 'vcc', toNode: 'rgb-led', toPort: 'vcc', color: '#e74c3c', label: '5V' },
      { id: 'w3', fromNode: 'power', fromPort: 'gnd', toNode: 'rgb-led', toPort: 'gnd', color: '#2f3542', label: 'GND' },
      { id: 'w4', fromNode: 'esp32', fromPort: 'gnd', toNode: 'power', toPort: 'gnd', color: '#2f3542', label: '共地' },
    ],
  },
  'low-voltage-switch': {
    title: '低压智能开关电路', notes: ['仅允许 5V 低压负载，禁止接入 220V', '继电器默认断开', '电源、控制器和继电器共地'],
    nodes: [controller('esp32', 90, 250, ['GPIO 5 / RELAY']), { ...circuitPartLibrary[3]!, id: 'relay', x: 480, y: 230 }, { ...circuitPartLibrary[2]!, id: 'load', label: '5V LED 负载', x: 860, y: 230 }, { ...circuitPartLibrary[1]!, id: 'power', x: 480, y: 500 }],
    wires: [
      { id: 'w1', fromNode: 'esp32', fromPort: 'gpio1', toNode: 'relay', toPort: 'in', color: '#2f80ed', label: '控制信号' },
      { id: 'w2', fromNode: 'power', fromPort: 'vcc', toNode: 'relay', toPort: 'dc+', color: '#e74c3c', label: '5V' },
      { id: 'w3', fromNode: 'power', fromPort: 'gnd', toNode: 'relay', toPort: 'dc-', color: '#2f3542', label: 'GND' },
      { id: 'w4', fromNode: 'power', fromPort: 'vcc', toNode: 'relay', toPort: 'com', color: '#e74c3c', label: 'COM / 5V' },
      { id: 'w5', fromNode: 'relay', fromPort: 'no', toNode: 'load', toPort: 'vcc', color: '#f39c12', label: 'NO' },
      { id: 'w6', fromNode: 'power', fromPort: 'gnd', toNode: 'load', toPort: 'gnd', color: '#2f3542', label: 'GND' },
    ],
  },
  'distance-light': {
    title: '距离感应灯电路', notes: ['HC-SR04 Echo 为 5V，进入 ESP32 前必须分压', '所有模块共地', '超声波采样间隔不小于 60ms'],
    nodes: [controller('esp32', 390, 250, ['GPIO 5 / TRIG', 'GPIO 4 / ECHO', 'GPIO 18 / LED']), { ...circuitPartLibrary[4]!, id: 'sensor', x: 80, y: 220 }, { ...circuitPartLibrary[8]!, id: 'divider', x: 190, y: 470 }, { ...circuitPartLibrary[2]!, id: 'lamp', label: '感应灯', x: 820, y: 240 }, { ...circuitPartLibrary[1]!, id: 'power', x: 700, y: 500 }],
    wires: [
      { id: 'w1', fromNode: 'esp32', fromPort: 'gpio1', toNode: 'sensor', toPort: 'trig', color: '#2f80ed', label: 'TRIG' },
      { id: 'w2', fromNode: 'sensor', fromPort: 'echo', toNode: 'divider', toPort: 'in', color: '#f39c12', label: '5V ECHO' },
      { id: 'w3', fromNode: 'divider', fromPort: 'out', toNode: 'esp32', toPort: 'gpio2', color: '#27ae60', label: '3.3V ECHO' },
      { id: 'w4', fromNode: 'esp32', fromPort: 'gpio3', toNode: 'lamp', toPort: 'data', color: '#9b51e0', label: '灯光控制' },
      { id: 'w5', fromNode: 'power', fromPort: 'vcc', toNode: 'lamp', toPort: 'vcc', color: '#e74c3c', label: '5V' },
      { id: 'w6', fromNode: 'power', fromPort: 'gnd', toNode: 'lamp', toPort: 'gnd', color: '#2f3542', label: 'GND' },
      { id: 'w7', fromNode: 'power', fromPort: 'vcc', toNode: 'sensor', toPort: 'vcc', color: '#e74c3c', label: '5V' },
      { id: 'w8', fromNode: 'power', fromPort: 'gnd', toNode: 'sensor', toPort: 'gnd', color: '#2f3542', label: 'GND' },
      { id: 'w9', fromNode: 'divider', fromPort: 'gnd', toNode: 'power', toPort: 'gnd', color: '#2f3542', label: '分压地' },
    ],
  },
  'environment-lab': {
    title: '环境监测与联动站电路', notes: ['I²C 传感器使用 3.3V 逻辑并与控制器共地', '风扇由独立驱动供电，禁止直接接 GPIO', '传感器地址冲突时必须修改地址或更换总线'],
    nodes: [
      controller('esp32', 390, 250, ['GPIO 8 / SDA', 'GPIO 9 / SCL', 'GPIO 18 / FAN']),
      { id: 'temp-sensor', kind: 'sensor', label: '温湿度传感器', subtitle: 'I²C', x: 70, y: 110, ports: [{ id: 'vcc', label: '3V3', side: 'right' }, { id: 'gnd', label: 'GND', side: 'right' }, { id: 'sda', label: 'SDA', side: 'right' }, { id: 'scl', label: 'SCL', side: 'right' }] },
      { id: 'air-sensor', kind: 'sensor', label: '空气质量传感器', subtitle: 'I²C', x: 70, y: 390, ports: [{ id: 'vcc', label: '3V3', side: 'right' }, { id: 'gnd', label: 'GND', side: 'right' }, { id: 'sda', label: 'SDA', side: 'right' }, { id: 'scl', label: 'SCL', side: 'right' }] },
      { ...circuitPartLibrary[5]!, id: 'fan-driver', label: '风扇驱动模块', subtitle: 'MOSFET / PWM', x: 690, y: 210 },
      { ...circuitPartLibrary[6]!, id: 'fan', label: '5V 风扇', x: 970, y: 210 },
      { ...circuitPartLibrary[1]!, id: 'power', x: 690, y: 500 },
    ],
    wires: [
      { id: 'w1', fromNode: 'temp-sensor', fromPort: 'sda', toNode: 'esp32', toPort: 'gpio1', color: '#2f80ed', label: 'SDA' },
      { id: 'w2', fromNode: 'temp-sensor', fromPort: 'scl', toNode: 'esp32', toPort: 'gpio2', color: '#9b51e0', label: 'SCL' },
      { id: 'w3', fromNode: 'air-sensor', fromPort: 'sda', toNode: 'esp32', toPort: 'gpio1', color: '#2f80ed', label: 'SDA BUS' },
      { id: 'w4', fromNode: 'air-sensor', fromPort: 'scl', toNode: 'esp32', toPort: 'gpio2', color: '#9b51e0', label: 'SCL BUS' },
      { id: 'w5', fromNode: 'esp32', fromPort: '3v3', toNode: 'temp-sensor', toPort: 'vcc', color: '#e74c3c', label: '3V3' },
      { id: 'w6', fromNode: 'esp32', fromPort: 'gnd', toNode: 'temp-sensor', toPort: 'gnd', color: '#2f3542', label: 'GND' },
      { id: 'w7', fromNode: 'esp32', fromPort: '3v3', toNode: 'air-sensor', toPort: 'vcc', color: '#e74c3c', label: '3V3' },
      { id: 'w8', fromNode: 'esp32', fromPort: 'gnd', toNode: 'air-sensor', toPort: 'gnd', color: '#2f3542', label: 'GND' },
      { id: 'w9', fromNode: 'esp32', fromPort: 'gpio3', toNode: 'fan-driver', toPort: 'in1', color: '#27ae60', label: 'FAN PWM' },
      { id: 'w10', fromNode: 'power', fromPort: 'vcc', toNode: 'fan-driver', toPort: 'vcc', color: '#e74c3c', label: '5V' },
      { id: 'w11', fromNode: 'power', fromPort: 'gnd', toNode: 'fan-driver', toPort: 'gnd', color: '#2f3542', label: 'GND' },
      { id: 'w12', fromNode: 'fan-driver', fromPort: 'out-a+', toNode: 'fan', toPort: 'plus', color: '#f39c12', label: 'FAN +' },
      { id: 'w13', fromNode: 'fan-driver', fromPort: 'out-a-', toNode: 'fan', toPort: 'minus', color: '#2f3542', label: 'FAN −' },
      { id: 'w14', fromNode: 'esp32', fromPort: 'gnd', toNode: 'power', toPort: 'gnd', color: '#2f3542', label: '共地' },
    ],
  },
  'robot-car': {
    title: '智能避障小车电路', notes: ['电机与控制器分路供电但必须共地', '电机电源串联保险丝和总开关', '断线时控制程序必须立即停止电机'],
    nodes: [controller('esp32', 60, 250, ['GPIO 16 / IN1', 'GPIO 17 / IN2', 'GPIO 5 / TRIG', 'GPIO 4 / ECHO', 'GPIO 18 / SERVO']), { ...circuitPartLibrary[5]!, id: 'driver', x: 370, y: 230 }, { ...circuitPartLibrary[6]!, id: 'motor-a', label: '左侧电机', x: 690, y: 120 }, { ...circuitPartLibrary[6]!, id: 'motor-b', label: '右侧电机', x: 690, y: 360 }, { ...circuitPartLibrary[4]!, id: 'sensor', x: 60, y: 500 }, { ...circuitPartLibrary[7]!, id: 'servo', x: 370, y: 500 }, { ...circuitPartLibrary[1]!, id: 'power', label: '电机与控制电源', x: 930, y: 500 }],
    wires: [
      { id: 'w1', fromNode: 'esp32', fromPort: 'gpio1', toNode: 'driver', toPort: 'in1', color: '#2f80ed', label: 'PWM A' },
      { id: 'w2', fromNode: 'esp32', fromPort: 'gpio2', toNode: 'driver', toPort: 'in2', color: '#9b51e0', label: 'PWM B' },
      { id: 'w3', fromNode: 'driver', fromPort: 'out-a+', toNode: 'motor-a', toPort: 'plus', color: '#e74c3c', label: 'A+' },
      { id: 'w4', fromNode: 'driver', fromPort: 'out-a-', toNode: 'motor-a', toPort: 'minus', color: '#2f3542', label: 'A−' },
      { id: 'w5', fromNode: 'driver', fromPort: 'out-b+', toNode: 'motor-b', toPort: 'plus', color: '#f39c12', label: 'B+' },
      { id: 'w6', fromNode: 'driver', fromPort: 'out-b-', toNode: 'motor-b', toPort: 'minus', color: '#2f3542', label: 'B−' },
      { id: 'w7', fromNode: 'sensor', fromPort: 'trig', toNode: 'esp32', toPort: 'gpio3', color: '#27ae60', label: 'TRIG' },
      { id: 'w8', fromNode: 'sensor', fromPort: 'echo', toNode: 'esp32', toPort: 'gpio4', color: '#f39c12', label: 'ECHO / 分压' },
      { id: 'w9', fromNode: 'servo', fromPort: 'signal', toNode: 'esp32', toPort: 'gpio5', color: '#00a8a8', label: 'SERVO PWM' },
      { id: 'w10', fromNode: 'power', fromPort: 'vcc', toNode: 'driver', toPort: 'vcc', color: '#e74c3c', label: '电机电源' },
      { id: 'w11', fromNode: 'power', fromPort: 'gnd', toNode: 'driver', toPort: 'gnd', color: '#2f3542', label: '共地' },
      { id: 'w12', fromNode: 'power', fromPort: 'vcc', toNode: 'servo', toPort: 'vcc', color: '#e74c3c', label: '5V' },
      { id: 'w13', fromNode: 'power', fromPort: 'gnd', toNode: 'servo', toPort: 'gnd', color: '#2f3542', label: 'GND' },
      { id: 'w14', fromNode: 'power', fromPort: 'vcc', toNode: 'sensor', toPort: 'vcc', color: '#e74c3c', label: '5V' },
      { id: 'w15', fromNode: 'power', fromPort: 'gnd', toNode: 'sensor', toPort: 'gnd', color: '#2f3542', label: 'GND' },
    ],
  },
}

export function getCircuitTemplate(programId: string): CircuitDiagram {
  return structuredClone(diagrams[programId] ?? diagrams['bluetooth-light']!)
}
