可以，先把它定义成一个**“电脑端侧 AI 硬件控制与设备管理系统”**，机器人相关能力先完全排除，第一阶段把“设备接入、管理、控制、AI 调度”这条链路跑通。

下面这版可以直接作为 `EdgeBrain` 项目的初版需求文档。

# EdgeBrain 产品需求文档

## 一、项目名称

**EdgeBrain**

英文定位：

**EdgeBrain — Local AI Device Control System**

中文定位：

**基于电脑端侧模型的本地智能设备控制与管理系统**

---

## 二、项目背景

目前大量端侧 AI 项目主要停留在聊天、文本生成、图片识别等软件层面。

EdgeBrain 希望进一步让端侧 AI 具备控制现实设备的能力。

整个系统不设计独立机器人，也不把计算能力放到机器人或硬件设备中。

**电脑就是整个系统唯一的大脑。**

电脑负责：

* 运行端侧 AI 模型
* 理解用户自然语言
* 判断用户意图
* 调用不同设备
* 执行自动化任务
* 保存设备状态
* 管理硬件能力
* 保存执行记录
* 处理摄像头、传感器等输入
* 管理整个家庭或实验环境中的设备

外部采购的硬件只承担：

**感知、执行、通信。**

例如：

* ESP32
* Arduino
* USB 控制器
* 继电器
* 红外发射器
* 摄像头
* 麦克风
* 智能插座
* 温湿度传感器
* 光照传感器
* 人体传感器
* 电机
* 灯
* 风扇
* 家电
* 蓝牙设备

真正的智能全部集中在电脑端。

---

# 三、核心理念

EdgeBrain 的核心架构可以理解为：

```text
                     用户
                      │
          ┌───────────┴───────────┐
          │                       │
       文字指令                 语音指令
          │                       │
          └───────────┬───────────┘
                      │
                 EdgeBrain
                      │
               本地端侧模型
                      │
             Intent / Agent
                      │
                设备能力中心
                      │
        ┌─────────────┼─────────────┐
        │             │             │
      ESP32         USB设备       网络设备
        │             │             │
     传感器          摄像头         智能家电
     继电器          麦克风         插座
     红外模块        控制板         Home设备
```

EdgeBrain 不直接关心底层某个设备具体是什么品牌。

系统更关心：

**这个设备能够提供什么能力。**

例如：

```text
设备：客厅红外控制器

能力：

turn_on_tv
turn_off_tv
set_tv_volume
switch_tv_source
turn_on_air_conditioner
set_air_conditioner_temperature
```

AI 只需要知道：

> 当前系统拥有哪些能力。

而不需要知道：

> GPIO 17 应该输出高电平还是低电平。

底层细节由设备驱动负责。

---

# 四、第一阶段产品目标

第一阶段不要追求复杂机器人能力。

重点完成四件事情：

## 设备可以接进来

能够把购买的各种硬件注册到 EdgeBrain。

例如：

```text
ESP32-客厅控制器

ESP32-书房控制器

USB摄像头

红外发射器

智能插座

温湿度传感器
```

---

## 系统可以看到设备

在 EdgeBrain 管理后台中能够查看：

```text
设备名称

设备类型

连接方式

当前状态

在线 / 离线

IP / 串口

固件版本

设备能力

所在房间

最后通信时间
```

---

## 系统可以控制设备

例如后台可以直接执行：

```text
打开插座

关闭灯

打开电视

关闭空调

空调设置 25°C

读取房间温度

获取摄像头画面
```

---

## AI 可以调用设备

最终用户不需要自己点按钮。

直接告诉 EdgeBrain：

```text
把书房灯打开。
```

EdgeBrain 判断：

```text
用户意图：

打开设备

区域：

书房

目标：

灯
```

找到设备：

```text
书房控制器
```

调用：

```text
light.turn_on()
```

最终完成现实设备控制。

---

# 五、系统核心模块

整个 EdgeBrain 建议拆成以下几个核心模块。

---

# 六、设备中心 Device Center

这是整个 EdgeBrain 最基础的模块。

所有购买回来的硬件，都必须先进入设备中心。

每个设备建立唯一 Device ID。

例如：

```text
Device ID

EB-ESP32-001
```

设备信息包括：

```text
设备名称

设备类型

品牌

型号

采购平台

采购链接

采购价格

购买日期

设备照片

连接协议

MAC地址

IP地址

串口

固件版本

当前状态

备注
```

例如：

```text
设备名称：
客厅红外控制器

类型：
ESP32

芯片：
ESP32-S3

连接：
Wi-Fi

位置：
客厅

功能：

电视控制
空调控制
风扇控制
```

这样以后采购几十甚至几百个模块以后，不会出现：

> 这个板子是干什么的？

> 这个模块在哪里买的？

> 这个 ESP32 烧的是什么程序？

EdgeBrain 本身同时也是一个：

**硬件资产管理系统。**

---

# 七、配件库 Component Library

设备和配件建议分开管理。

例如一块 ESP32 可以组成一个设备，但 ESP32 本身属于一个配件。

配件库可以保存：

```text
ESP32-S3

ESP32-C3

继电器模块

红外发射模块

红外接收模块

温湿度模块

人体红外模块

光照模块

USB摄像头

麦克风

舵机

电机

电源模块

USB转TTL
```

每个配件保存：

```text
名称

型号

照片

采购地址

价格

库存数量

规格

引脚定义

供电电压

通信方式

驱动地址

Datasheet

说明书

测试记录
```

以后可以直接看到：

```text
ESP32-S3

库存：7

已使用：3

剩余：4
```

---

# 八、设备能力 Capability

这是 EdgeBrain 非常关键的一层。

不要让 AI 直接调用硬件。

统一抽象成 Capability。

例如：

```text
light.turn_on

light.turn_off

light.set_brightness

fan.turn_on

fan.turn_off

air_conditioner.turn_on

air_conditioner.set_temperature

tv.turn_on

tv.turn_off

camera.capture

camera.stream

sensor.temperature.read

sensor.humidity.read
```

AI 最终操作的不是设备，而是：

**Capability。**

例如用户说：

```text
客厅有点热。
```

AI 可以先调用：

```text
sensor.temperature.read
```

得到：

```text
29.3°C
```

然后根据规则判断调用：

```text
air_conditioner.turn_on
```

再执行：

```text
air_conditioner.set_temperature
25
```

---

# 九、驱动中心 Driver Center

不同硬件接入方式完全不同。

所以需要建立统一 Driver 层。

例如：

```text
ESP32 Driver

Serial Driver

Bluetooth Driver

HTTP Driver

MQTT Driver

WebSocket Driver

USB Driver

Home Assistant Driver
```

上层不关心通信细节。

例如 AI 调用：

```text
light.turn_on
```

Driver 可能实际执行：

```text
HTTP
```

也可能执行：

```text
MQTT
```

或者：

```text
Serial
```

---

# 十、房间与空间管理

建议系统从第一版就加入：

**Space / Room**

例如：

```text
家

├── 客厅
│
├── 主卧
│
├── 次卧
│
├── 书房
│
├── 厨房
│
└── 阳台
```

设备全部属于某个空间。

例如：

```text
客厅

电视

空调

灯

摄像头

温度传感器

ESP32红外控制器
```

这样 AI 才能够理解：

```text
把客厅灯打开。
```

而不是只能理解：

```text
打开 Device-EB-004。
```

---

# 十一、设备分组

除了房间，还需要支持设备分组。

例如：

```text
所有灯

所有摄像头

所有空调

所有传感器

实验设备

夜间设备
```

用户可以直接执行：

```text
关闭所有灯。
```

EdgeBrain 自动找到：

```text
light.*
```

设备组并批量执行。

---

# 十二、控制台

系统需要提供一个设备控制页面。

每个设备自动生成控制面板。

例如：

```text
客厅空调

状态：

在线

当前温度：
29.3°C

空调状态：
OFF

--------------------------------

[ 开机 ]

[ 关机 ]

温度

[-] 25°C [+]

模式

制冷
制热
送风
自动
```

AI 能做的事情，原则上人工也应该能通过后台执行。

这样方便测试。

---

# 十三、设备测试中心

EdgeBrain 非常适合加入：

**Device Test**

每新增一个设备都可以单独测试。

例如：

```text
测试 Wi-Fi

测试连接

测试 GPIO

测试继电器

测试红外

测试传感器

测试 Capability

测试响应时间
```

测试结果保存。

例如：

```text
设备：

EB-ESP32-001

测试：

air_conditioner.turn_on

结果：

PASS

耗时：

121ms

时间：

2026-08-28 09:12
```

---

# 十四、设备状态

设备至少需要拥有：

```text
Online

Offline

Error

Updating

Unknown
```

同时保存：

```text
最后在线时间

最后心跳时间

最近错误

最近执行任务
```

---

# 十五、日志中心

所有 AI 控制硬件的行为必须能够追溯。

例如：

```text
09:31:02

用户：

客厅有点热

AI：

读取客厅温度

设备：

TemperatureSensor-01

结果：

29.3°C
```

然后：

```text
09:31:03

AI：

开启客厅空调

设备：

IRController-01

Capability：

air_conditioner.turn_on

结果：

Success
```

这样以后出现设备误操作时可以追踪全过程。

---

# 十六、AI Agent

EdgeBrain 的 Agent 负责把用户语言转换成设备能力。

例如：

```text
用户：

我要睡觉了。
```

AI 可以根据场景调用：

```text
living_room.light.turn_off

study.light.turn_off

tv.turn_off

bedroom.light.set_brightness(20)
```

Agent 不直接控制 GPIO。

Agent 只调用 EdgeBrain 已经注册好的 Capability。

---

# 十七、场景 Scene

系统需要支持用户保存一些固定场景。

例如：

```text
睡眠模式

离家模式

回家模式

观影模式

工作模式

早晨模式
```

例如：

### 睡眠模式

执行：

```text
关闭客厅灯

关闭电视

关闭书房设备

卧室灯调到 20%

空调设置 25°C
```

用户只需要说：

```text
我要睡觉了。
```

即可触发整个场景。

---

# 十八、自动化 Automation

除了 AI，也要允许传统规则。

例如：

```text
IF

温度 > 30°C

THEN

打开空调
```

或者：

```text
IF

人体传感器 30 分钟无人

THEN

关闭书房灯
```

或者：

```text
每天 23:30

关闭客厅所有灯
```

这样 EdgeBrain 不会过度依赖大模型。

---

# 十九、端侧模型

EdgeBrain 的 AI 核心应该支持模型插件化。

例如：

```text
Ollama

MLX

llama.cpp

LM Studio

OpenAI Compatible API
```

模型负责：

```text
自然语言理解

意图识别

设备选择

任务规划

工具调用

异常解释
```

原则上系统不绑定某个模型。

---

# 二十、Knowledge 知识库

设备本身也可以拥有知识。

例如 ESP32-S3 配件页面保存：

```text
Datasheet

引脚定义

供电要求

示例代码

历史故障

测试经验

采购记录
```

未来 AI 遇到：

```text
ESP32 红外模块无法工作
```

可以直接查询知识库。

因此 EdgeBrain 后面可以形成：

**设备知识库。**

---

# 二十一、采购管理

既然大量硬件会从淘宝、1688采购，建议直接加入简单采购管理。

保存：

```text
采购平台

采购链接

店铺

商品名称

SKU

单价

数量

运费

下单日期

到货日期

评价

是否推荐再次采购
```

以后同一个模块坏了，可以直接找到原采购链接。

---

# 二十二、硬件版本管理

一个设备实际上包含：

```text
硬件

固件

配置
```

例如：

```text
EB-ESP32-001

Hardware：

ESP32-S3

Firmware：

EdgeBrain Node

Version：

0.1.3
```

后台最好能够看到固件版本。

后期可以逐渐增加：

```text
OTA Update
```

能力。

---

# 二十三、建议通信架构

第一阶段建议重点支持：

```text
HTTP

MQTT

Serial
```

其中：

### HTTP

最容易开发和调试。

ESP32 可以提供：

```text
POST /light/on

POST /light/off
```

### MQTT

以后设备变多之后非常适合。

例如：

```text
edgebrain/home/livingroom/light/set
```

### Serial

非常适合桌面附近的 Arduino、ESP32 和控制板。

---

# 二十四、Edge Node

建议给 ESP32 一类设备定义统一概念：

**EdgeBrain Node**

Node 本身不负责 AI。

只负责：

```text
连接电脑

接收命令

读取传感器

执行动作

上报状态
```

例如：

```text
EdgeBrain

        ↓

EB Node 001
ESP32

        ↓

红外模块

        ↓

空调
```

以后所有 ESP32 固件都可以使用统一协议。

---

# 二十五、后台页面规划

第一阶段后台建议包括：

```text
Dashboard

Devices

Components

Capabilities

Spaces

Scenes

Automations

Models

AI Chat

Logs

Settings
```

---

# 二十六、Dashboard

首页展示：

```text
设备总数

在线设备

离线设备

异常设备

今日执行任务

今日 AI 调用

传感器数量

最近事件
```

并展示：

```text
当前家庭状态

房间温度

设备状态

最近 AI 操作
```

---

# 二十七、Devices

设备管理。

```text
新增设备

删除设备

编辑设备

设备配网

设备测试

查看状态

查看日志

查看 Capability

查看固件
```

---

# 二十八、Components

硬件配件资产管理。

主要解决：

**我已经买了什么。**

---

# 二十九、Capabilities

能力中心。

主要解决：

**我的系统现在能够做什么。**

例如首页直接显示：

```text
当前 EdgeBrain

拥有 42 个设备能力

灯光控制
12

环境感知
8

家电控制
14

摄像头
4

其他
4
```

---

# 三十、AI Chat

提供类似 ChatGPT 的聊天界面。

用户可以说：

```text
打开书房灯。
```

或者：

```text
客厅现在多少度？
```

或者：

```text
把一楼所有灯关闭。
```

或者：

```text
检查有没有设备掉线。
```

AI 根据 Capability 调用系统。

---

# 三十一、MVP 第一版范围

EdgeBrain 第一版不要做太大。

建议第一版完成：

```text
设备管理

配件管理

房间管理

Capability 注册

设备在线状态

HTTP Driver

MQTT Driver

Serial Driver

设备控制

设备测试

操作日志

AI Chat

端侧模型

Tool Calling

简单 Scene
```

第一批硬件建议只接：

```text
ESP32-S3

继电器

红外发射器

温湿度传感器

智能插座

USB摄像头
```

这批设备已经足够验证整个 EdgeBrain 架构。

---

# 三十二、第一个 Demo

非常建议第一个完整 Demo 就做：

## AI 控制桌面环境

电脑：

```text
运行 EdgeBrain
```

连接：

```text
ESP32-S3
```

ESP32 接：

```text
继电器

红外发射器

温湿度传感器
```

控制：

```text
桌面灯

风扇

空调
```

用户说：

```text
这里有点热。
```

EdgeBrain：

```text
读取温度

29.8°C
```

AI 判断：

```text
温度偏高
```

执行：

```text
打开风扇
```

如果用户说：

```text
还是有点热。
```

执行：

```text
打开空调

设置 25°C
```

这就已经是一个非常完整的：

**端侧 AI → 感知 → 判断 → 调用工具 → 控制现实设备**

闭环。

---

# 三十三、长期定位

EdgeBrain 后面不应该只定义成：

**智能家居。**

更合适的定位是：

> **让电脑成为现实世界设备的本地 AI 大脑。**

未来所有能够通过：

```text
USB

Serial

Wi-Fi

Bluetooth

MQTT

HTTP

局域网
```

控制的设备，都可以成为 EdgeBrain 的外围设备。

电脑负责智能。

硬件负责执行。

最终逐渐形成：

```text
                    EdgeBrain

                        │
               Local AI Agent
                        │
               Capability Layer
                        │
               Device Runtime
                        │
        ┌───────────────┼───────────────┐
        │               │               │
     Sensors         Appliances      Cameras
        │               │               │
      感知             执行             视觉
```

EdgeBrain 最重要的不是某一块 ESP32。

也不是某一个智能家居产品。

真正需要沉淀的是：

**一套能够让 AI 安全、统一、可管理地控制现实设备的软件系统。**

我建议你下一步直接按照这个文档继续拆 **EdgeBrain V0.1 的技术架构 + 数据库表结构 + 前端后台页面 + ESP32 通信协议**，这样就已经可以开始让 Codex 搭项目骨架了。
