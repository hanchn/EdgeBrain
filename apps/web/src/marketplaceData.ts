export type ProductStage = '基础元件' | '原型搭建' | '方案集成'

export interface MarketplaceProduct {
  id: string; title: string; price: string; url: string; stage: ProductStage; category: string
  sales30d: string; goodRate: string; repurchaseRate: string; recommendation: string; risk?: string; image?: string
}

// 由 1688-shopkeeper Skill 于 2026-08-28 查询并筛选；价格与指标以再次查询时为准。
export const marketplaceProducts: MarketplaceProduct[] = [
  { id: '44403552395', title: '2.5V / 3.8V / 6V / 12V 教学小灯泡与灯座', price: '0.18', url: 'https://detail.1688.com/offer/44403552395.html', stage: '基础元件', category: '低压灯具', sales30d: '4200+', goodRate: '97.8%', repurchaseRate: '53.2%', recommendation: '低成本、销量和复购稳定，适合作为智能开关的首个受控负载。' },
  { id: '698945473892', title: '1/2/4/6/8 路 3V/5V/12V/24V 继电器模块', price: '2.75', url: 'https://detail.1688.com/offer/698945473892.html', stage: '基础元件', category: '继电器模块', sales30d: '200+', goodRate: '100%', repurchaseRate: '52.1%', recommendation: '电压和路数选择完整，适合先采购 5V 单路版本做低压开关验证。' },
  { id: '537222361275', title: 'MB-102 面包板实验套件（跳线与电源模块）', price: '2.50', url: 'https://detail.1688.com/offer/537222361275.html', stage: '基础元件', category: '开发板配件', sales30d: '1000+', goodRate: '100%', repurchaseRate: '47.1%', recommendation: '原型搭建的通用底座，销量高、供货成熟。', risk: '评价样本仅 2 条，采购前需抽样验证质量。' },
  { id: '692869046969', title: 'ESP32 WiFi 蓝牙 2.8 寸触摸显示开发板', price: '55.00', url: 'https://detail.1688.com/offer/692869046969.html', stage: '原型搭建', category: 'ESP32 控制器', sales30d: '60+', goodRate: '100%', repurchaseRate: '39.4%', recommendation: '同时具备 WiFi、蓝牙和可视化屏幕，可覆盖开关、遥控器与状态显示。', risk: '评价样本 19 条；作为量产控制器前需验证引脚和固件兼容性。' },
  { id: '714033764706', title: 'SP658E 米家 / 语音幻彩 LED 控制器', price: '22.00', url: 'https://detail.1688.com/offer/714033764706.html', stage: '原型搭建', category: '灯具控制器', sales30d: '70+', goodRate: '100%', repurchaseRate: '73.3%', recommendation: '可作为语音开关和灯带联动的竞品参考，复购数据突出。' },
  { id: '795572204176', title: '零基础智能家居传感器实验套件', price: '24.40', url: 'https://detail.1688.com/offer/795572204176.html', stage: '方案集成', category: '教育开发套件', sales30d: '-', goodRate: '100%', repurchaseRate: '-', recommendation: '包含多种传感器，适合拆解成进阶课程和方案依赖。', risk: '销量和评价数据不足，仅建议先买样品。' },
  { id: '718346389769', title: '儿童木制 LED 开关拆装忙碌板', price: '38.00', url: 'https://detail.1688.com/offer/718346389769.html', stage: '方案集成', category: '儿童教育成品', sales30d: '500+', goodRate: '100%', repurchaseRate: '35.2%', recommendation: '销量、揽收率和评价量均稳定，适合作为儿童交互与结构设计参考。' },
]
