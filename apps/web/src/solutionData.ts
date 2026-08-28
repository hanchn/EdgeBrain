export type SolutionLevel = '基础方案' | '进阶方案' | '高阶方案'
export interface SolutionRecord {
  id: string; name: string; level: SolutionLevel; description: string; controller: string; image: string
  duration: string; bom: { name: string; quantity: number; role: string }[]; steps: string[]; capabilities: string[]
}
export const solutions: SolutionRecord[] = [
  { id: 'smart-switch', name: '智能开关', level: '基础方案', description: '用控制器安全控制低压 LED 灯的开关，适合作为第一个硬件项目。', controller: 'ESP32-S3 控制器', image: '/assets/hardware-placeholder.png', duration: '约 45 分钟', bom: [{ name: 'ESP32-S3 开发板', quantity: 1, role: '主控制器' }, { name: '单路继电器模块', quantity: 1, role: '开关执行' }, { name: '低压 LED 灯', quantity: 1, role: '受控设备' }], steps: ['核对低压供电范围', '连接控制器与继电器信号线', '绑定开关能力', '运行开关与断电测试'], capabilities: ['light.turn_on', 'light.turn_off'] },
  { id: 'smart-car', name: '智能避障小车', level: '进阶方案', description: '组合电机、超声波传感器和舵机，实现自动避障与跟随。', controller: 'EdgeBrain 小车控制器', image: '/assets/project-robot-car.png', duration: '约 3 小时', bom: [{ name: '小车控制器', quantity: 1, role: '主控制器' }, { name: '直流减速电机', quantity: 4, role: '运动执行' }, { name: '超声波传感器', quantity: 1, role: '距离检测' }, { name: 'SG90 舵机', quantity: 1, role: '传感器转向' }], steps: ['完成底盘与电机装配', '安装超声波传感器和舵机', '检查供电与电机方向', '导入避障积木程序', '标定距离阈值并路测'], capabilities: ['car.move', 'car.stop', 'distance.read', 'servo.set_angle'] },
  { id: 'environment-lab', name: '环境监测与联动站', level: '高阶方案', description: '采集温湿度和空气质量数据，并与风扇、提醒器形成自动联动。', controller: 'ESP32-S3 边缘控制器', image: '/assets/project-environment-monitor.png', duration: '约 1 天', bom: [{ name: 'ESP32-S3 开发板', quantity: 1, role: '边缘控制器' }, { name: '温湿度传感器', quantity: 1, role: '环境采集' }, { name: '空气质量传感器', quantity: 1, role: '环境采集' }, { name: '风扇驱动模块', quantity: 1, role: '联动执行' }], steps: ['搭建传感器总线', '完成多设备地址配置', '设置采样和异常阈值', '建立风扇联动程序', '连续运行并检查数据质量'], capabilities: ['sensor.read', 'fan.set_speed', 'alert.notify'] },
]
