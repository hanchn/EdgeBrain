export type RemoteControlKind = 'light' | 'switch' | 'sensor-light' | 'car' | 'display' | 'environment'
export type ProjectLevel = '入门' | '基础' | '进阶' | '高阶'

export interface ProjectPart { name: string; quantity: number; role: string; required: boolean; source: string }
export interface ProjectMilestone { name: string; status: '已完成' | '进行中' | '待开始'; deliverable: string }
export interface ProgramRecord {
  id: string; name: string; description: string; hardware: string[]; controller: string; image: string
  updated: string; status: '正常' | '草稿'; stage: string; level: ProjectLevel; duration: string
  remote: RemoteControlKind; parts: ProjectPart[]; workflow: string[]; capabilities: string[]; safety: string[]; milestones: ProjectMilestone[]
}

export const programs: ProgramRecord[] = [
  {
    id: 'bluetooth-light', name: '蓝牙 RGB 小灯', description: '第一条真实硬件闭环：发现、连接、调光、反馈和断线重连。',
    hardware: ['ESP32-C3 控制器', 'RGB LED 小灯'], controller: 'ESP32-C3 BLE 控制器', image: '/assets/project-bluetooth-light-v1.png', updated: '刚刚', status: '草稿', stage: 'Hardware Agent 开发', level: '入门', duration: '预计 5–7 天', remote: 'light',
    parts: [
      { name: 'ESP32-C3 开发板', quantity: 2, role: 'BLE 主控制器与备用调试板', required: true, source: '1688 候选 / 本地采购' },
      { name: 'WS2812B RGB LED 模块', quantity: 2, role: '可调光受控设备', required: true, source: '待选品' },
      { name: 'MB-102 面包板', quantity: 1, role: '无焊原型连接', required: true, source: '1688 候选' },
      { name: '杜邦线与 5V USB 电源', quantity: 1, role: '低压供电与信号连接', required: true, source: '常备耗材' },
    ],
    workflow: ['扫描并识别 BLE 设备', '连接并发现 GATT 服务', '读取灯光当前状态', '发送开关、亮度和 RGB 指令', '校验状态通知', '断线重连并记录运行日志'],
    capabilities: ['device.scan', 'device.connect', 'device.disconnect', 'light.turn_on', 'light.turn_off', 'light.set_brightness', 'light.set_rgb', 'device.read_state'],
    safety: ['只使用 5V USB 供电', '亮度默认上限 80%', '连接超时 10 秒', '断线后执行器保持安全状态'],
    milestones: [
      { name: 'BLE 适配器与设备发现', status: '进行中', deliverable: 'macOS 扫描、连接与断线状态' },
      { name: '灯光能力协议', status: '待开始', deliverable: '开关、亮度、RGB GATT 特征值' },
      { name: '积木编译与执行', status: '待开始', deliverable: 'Blockly → Automation IR → Hardware Agent' },
      { name: '断线与日志验收', status: '待开始', deliverable: '自动重连、超时、执行记录' },
    ],
  },
  {
    id: 'low-voltage-switch', name: '低压智能开关', description: '使用 ESP32 和光耦继电器安全控制 5V LED，验证控制器与硬件绑定。',
    hardware: ['ESP32-S3 控制器', '5V 继电器', '低压 LED'], controller: 'ESP32-S3 边缘控制器', image: '/assets/project-smart-switch-v1.png', updated: '刚刚', status: '草稿', stage: '采购与样品验证', level: '基础', duration: '预计 1 周', remote: 'switch',
    parts: [
      { name: 'ESP32-S3 开发板', quantity: 2, role: '主控制器与备用板', required: true, source: '1688 候选' },
      { name: '5V 单路光耦继电器模块', quantity: 3, role: '低压开关执行器', required: true, source: '1688 商品 698945473892' },
      { name: '5V 教学灯泡与灯座', quantity: 3, role: '安全受控负载', required: true, source: '1688 商品 44403552395' },
      { name: '面包板、端子与杜邦线', quantity: 1, role: '原型接线与端子防护', required: true, source: '常备耗材' },
    ],
    workflow: ['核对低压供电', '连接 ESP32 与继电器信号线', '绑定 switch 能力', '执行开关并读取反馈', '验证默认断电状态', '连续运行与温升检查'],
    capabilities: ['device.connect', 'switch.turn_on', 'switch.turn_off', 'switch.read_state', 'safety.require_confirm', 'runtime.log'],
    safety: ['禁止接入 220V 市电', '默认上电保持关闭', '连续切换间隔不小于 500ms', '端子必须加绝缘保护'],
    milestones: [
      { name: '样品采购与电气验证', status: '进行中', deliverable: '触发电平、默认状态和温升记录' },
      { name: 'GPIO 继电器适配器', status: '待开始', deliverable: '开关与状态回读能力' },
      { name: '虚拟开关遥控器', status: '已完成', deliverable: '开关、状态和安全提示界面' },
      { name: '定时开关积木', status: '待开始', deliverable: '确认、等待、开关和日志流程' },
    ],
  },
  {
    id: 'distance-light', name: '距离感应灯', description: '读取距离并通过条件积木自动控制灯光，验证传感器与自动化循环。',
    hardware: ['ESP32-C3 控制器', '超声波传感器', 'RGB LED'], controller: 'ESP32-C3 传感控制器', image: '/assets/project-distance-light-v1.png', updated: '刚刚', status: '草稿', stage: '方案设计', level: '进阶', duration: '预计 1–2 周', remote: 'sensor-light',
    parts: [
      { name: 'ESP32-C3 开发板', quantity: 1, role: '传感与灯光控制器', required: true, source: '与蓝牙小灯复用' },
      { name: 'HC-SR04 超声波传感器', quantity: 2, role: '距离采集与备用件', required: true, source: '待选品' },
      { name: '电平转换或分压模块', quantity: 1, role: '保护 ESP32 3.3V 输入', required: true, source: '待选品' },
      { name: '5V RGB LED 模块', quantity: 1, role: '自动联动执行器', required: true, source: '与蓝牙小灯复用' },
    ],
    workflow: ['连接控制器和距离传感器', '周期读取距离', '过滤无效与抖动数据', '判断是否小于阈值', '开灯并延时', '无人后关灯并记录触发'],
    capabilities: ['sensor.distance.read', 'logic.compare', 'flow.repeat', 'light.turn_on', 'light.turn_off', 'runtime.log'],
    safety: ['Echo 信号必须降压到 3.3V', '采样间隔不小于 60ms', '无效读数不能触发执行器', '保留手动关闭和急停'],
    milestones: [
      { name: '传感器数据采集', status: '待开始', deliverable: '稳定距离值与异常读数处理' },
      { name: '阈值自动化积木', status: '待开始', deliverable: '读取、判断、开灯、延时和关灯' },
      { name: '参数调试遥控器', status: '已完成', deliverable: '实时距离、阈值和手动灯光控制' },
      { name: '连续运行测试', status: '待开始', deliverable: '24 小时误触发与断线报告' },
    ],
  },
  {
    id: 'robot-car', name: '智能避障小车', description: '组合电机、超声波和舵机，实现虚拟遥控、自动避障与急停。',
    hardware: ['EdgeBrain 小车控制器', '超声波传感器', '双电机', 'SG90 舵机'], controller: 'EdgeBrain 小车控制器', image: '/assets/project-robot-car-v2.png', updated: '今天 10:30', status: '正常', stage: '模拟控制可用', level: '高阶', duration: '预计 2–3 周', remote: 'car',
    parts: [
      { name: '四轮金属小车底盘', quantity: 1, role: '机械结构', required: true, source: '待选品' },
      { name: 'ESP32 小车控制器', quantity: 1, role: '主控制器', required: true, source: '待定制' },
      { name: '直流减速电机', quantity: 4, role: '运动执行器', required: true, source: '待选品' },
      { name: '电机驱动板', quantity: 1, role: '电机供电与方向控制', required: true, source: '待选品' },
      { name: '超声波传感器与 SG90 舵机', quantity: 1, role: '距离检测与扫描', required: true, source: '1688 候选' },
      { name: '电池盒、保险丝与总电源开关', quantity: 1, role: '安全供电', required: true, source: '待选品' },
    ],
    workflow: ['连接小车控制器', '校准电机方向与速度', '读取前方距离', '扫描左右障碍', '选择安全方向', '执行移动并持续监听急停'],
    capabilities: ['car.move', 'car.stop', 'motor.set_speed', 'sensor.distance.read', 'servo.set_angle', 'safety.emergency_stop'],
    safety: ['遥控器必须保留急停', '断线立即停止电机', '首次运行速度限制 35%', '电机与控制器分离供电并共地'],
    milestones: [
      { name: '虚拟方向遥控器', status: '已完成', deliverable: '前后左右、速度和急停' },
      { name: '电机控制适配器', status: '待开始', deliverable: '方向、速度、制动和断线停止' },
      { name: '自动避障程序', status: '待开始', deliverable: '距离、舵机扫描和路径判断' },
      { name: '低速路测', status: '待开始', deliverable: '碰撞、失联和续航测试报告' },
    ],
  },
  {
    id: 'environment-lab', name: '环境监测与联动站', description: '采集温湿度和空气质量数据，并与风扇、提醒器形成自动联动。',
    hardware: ['ESP32-S3 控制器', '温湿度传感器', '空气质量传感器', '风扇驱动模块'], controller: 'ESP32-S3 边缘控制器', image: '/assets/project-environment-monitor.png', updated: '05-20 14:21', status: '草稿', stage: '传感器总线设计', level: '高阶', duration: '预计 1 天', remote: 'environment',
    parts: [
      { name: 'ESP32-S3 开发板', quantity: 1, role: '边缘控制器', required: true, source: '待选品' },
      { name: '温湿度传感器', quantity: 1, role: '环境采集', required: true, source: '待选品' },
      { name: '空气质量传感器', quantity: 1, role: '空气质量采集', required: true, source: '待选品' },
      { name: '5V 风扇与驱动模块', quantity: 1, role: '自动联动执行器', required: true, source: '待选品' },
      { name: '蜂鸣器或状态灯', quantity: 1, role: '本地异常提醒', required: false, source: '常备耗材' },
    ],
    workflow: ['搭建传感器总线', '完成多设备地址配置', '设置采样和异常阈值', '建立风扇联动程序', '连续运行并检查数据质量'],
    capabilities: ['sensor.temperature.read', 'sensor.humidity.read', 'sensor.air_quality.read', 'fan.set_speed', 'alert.notify'],
    safety: ['传感器总线使用 3.3V 逻辑', '风扇单独使用 5V 驱动并与控制器共地', '异常值连续出现三次后再触发联动', '保留手动停止风扇入口'],
    milestones: [
      { name: '传感器总线', status: '进行中', deliverable: '温湿度与空气质量稳定读数' },
      { name: '阈值与联动', status: '待开始', deliverable: '风扇、提醒器和异常处理规则' },
      { name: '数据面板', status: '待开始', deliverable: '实时曲线与最近异常记录' },
      { name: '连续运行', status: '待开始', deliverable: '24 小时数据质量与温升报告' },
    ],
  },
]
