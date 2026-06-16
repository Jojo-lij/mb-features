# 万豪项目 — 目录结构说明

> 记录时间：2026-06-16
> 用途：供后续会话快速了解 `APP功能说明` 仓库的目录结构和各文件夹作用

---

## 仓库基本信息

| 属性 | 值 |
|------|-----|
| 本地路径 | `d:\Jojo\02-Work\万豪\APP功能说明\` |
| 远程地址 | `github.com/Jojo-lij/mb-features` |
| GitHub Pages | `https://jojo-lij.github.io/mb-features/` |
| 用途 | 万豪 China App 功能说明静态站点 |

---

## 根目录文件

| 文件 | 作用 |
|------|------|
| `index.html` | 入口页面（~90行），引用外部 CSS 和 JS 模块，不包含内联样式和数据 |

---

## 文件夹结构

### `css/`

| 文件 | 作用 |
|------|------|
| `style.css` | 全部页面样式（2674行），从原 `index.html` 提取的 CSS |

**注意**：CSS 中不包含 HTML 标签，纯样式定义。

---

### `js/`

#### `js/data.js`

| 内容 | 作用 |
|------|------|
| `let modules = [];` | 全局模块数组，供各数据模块 `push` 数据 |

**加载顺序**：`data.js` 必须在所有模块之前加载，因为模块依赖 `modules` 变量。

#### `js/modules/`（12个数据模块）

每个模块文件通过 `modules.push({...})` 向全局 `modules` 数组添加数据：

| 文件 | 模块ID | 模块名称 | 说明 |
|------|--------|----------|------|
| `benchmark.js` | `benchmark` | 竞品矩阵 | 酒店行业 APP 功能全景矩阵 — 144 功能 × 7 品牌对标 |
| `overview.js` | `overview` | 总览 | 万豪旅享家 China App 全量功能统计与分布 |
| `launch.js` | `launch` | 启动 | 开屏广告、启动页、隐私协议 |
| `homepage.js` | `homepage` | 首页 | 搜索、预订、酒店详情、预订流程 |
| `discover.js` | `discover` | 探索 | 品牌专区、目的地、内容流 |
| `shop.js` | `shop` | 商城 | 商品搜索、购物车、订单管理 |
| `trips.js` | `trips` | 行程 | 入住中心、行程详情、Mobile Key |
| `account.js` | `account` | 账户 | 会员等级、积分、个人资料 |
| `wallet.js` | `wallet` | 钱包 | 礼品卡、优惠券、支付方式 |
| `auth.js` | `auth` | 安全认证 | 登录、注册、MFA、找回密码 |
| `mbop.js` | `mbop` | MBOP | 会员预订优惠、积分商城 |
| `group.js` | `group` | 团体预订 | 团队预订、会议活动 |

**数据格式**：每个模块包含 `id`, `name`, `icon`, `desc`, `sections[]`，`sections` 下包含 `features[]`，`features` 包含 `id`, `name`, `status`, `desc`, `detail`, `screenshot` 等字段。

**screenshot 路径格式**：`images/目录/文件名`，如 `images/启动/UI__图片库__启动__Splash Screen.png`

#### `js/app.js`

应用核心逻辑（1581行），包含：

| 区域 | 内容 |
|------|------|
| `iconMap` | SVG 图标映射 |
| `activeDetailId` | 当前展开的功能详情 ID |
| `FEISHU_API_URL` | 飞书在线数据源 API 地址 |
| `fallbackModules` / `benchmarkModule` | 本地数据备份和竞品矩阵模块引用 |
| `benchmarkData` | 竞品矩阵的完整数据（144个功能 × 7品牌评分） |
| `bmBrands` / `bmState` / `bmModuleColors` / `bmModuleReviews` | 竞品矩阵品牌配置和状态 |
| `bmAllFeatures()` / `bmCurrentBrand()` / `bmCoverage()` | 竞品矩阵数据工具函数 |
| `initApp()` | 初始化：加载缓存 → 更新统计 → 渲染导航 → 渲染内容 → 绑定事件 |
| `loadOnlineModules()` | 从飞书 API 加载在线数据，每分钟自动同步 |
| `transformFeishuRecords()` | 将飞书记录转换为模块格式 |
| `renderNav()` | 渲染左侧导航栏 |
| `renderContent()` | 根据当前模块渲染主内容区 |
| `renderOverview()` | 渲染总览页面（统计卡片 + 模块分布图） |
| `renderBenchmark()` | 渲染竞品矩阵页面（品牌切换 + 功能矩阵 + 搜索筛选） |
| `bmOpenDrawer()` / `bmCloseDrawer()` | 竞品矩阵抽屉详情展开/关闭 |
| `renderModule()` | 渲染普通模块的功能列表 |
| `toggleFeatureDetail()` | 功能详情展开/收起 |
| `openLightbox()` / `closeLightbox()` | 图片灯箱 |
| `bindBenchmarkHandlers()` | 绑定竞品矩阵的事件处理 |
| `updateHeaderStats()` | 更新顶部统计数字 |
| `setDataSourceStatus()` | 更新数据源状态显示 |

---

### `templates/`

功能更新模板目录，供多人协作填写功能更新需求。

| 文件 | 作用 |
|------|------|
| `templates/feature-update-template.csv` | CSV 模板，含示例数据 |

**CSV 字段**：功能编号 | 功能名称 | 状态 | 简要说明 | 功能说明 | 截图路径

**更新规则**：
- 只更新有值的字段，空字段保持原样
- 功能编号必须已存在（用于全局搜索定位）
- 截图路径：单张直接写，多张用 `|` 分隔
- 状态值：`live`/`new`/`iterate`/`pending`

**示例**：
```csv
功能编号,功能名称,状态,简要说明,功能说明,截图路径
DC01-1,,new,,,
DC01-2,,,,1.新描述...,images/探索/新图.png
```
→ 第一行：只改 DC01-1 的 `status` 为 `new`
→ 第二行：只改 DC01-2 的 `detail` 和 `screenshot`

**使用流程**：
1. 复制模板 → 填写要更新的字段（只填要改的）
2. 如有新截图 → 放入 `images/对应模块/` 目录
3. 给我 CSV 数据 → 我通过功能编号全局搜索定位并更新
4. 我复述改动 → 你确认后执行

---

### `images/`

图片资源目录，按功能模块分子目录：

| 子目录 | 内容 |
|--------|------|
| `images/MBOP/` | MBOP 模块截图（7张） |
| `images/QRV/` | QRV（特殊房价验证）截图（4张） |
| `images/启动/` | 启动页、隐私协议、开屏广告截图（6张） |
| `images/团体预订/` | 团体预订 UI 截图（2张） |
| `images/探索/` | 探索模块截图（22张） |
| `images/行程/` | 行程详情、入住中心截图（9张） |
| `images/账户/` | 会员等级、积分、个人资料截图（24张） |
| `images/钱包/` | 礼品卡、优惠券、支付截图（11张） |
| `images/首页/` | 搜索、预订、酒店详情、支付截图（78张） |

**总计**：163 张图片，全部被 `js/modules/*.js` 引用。

**历史清理**：
- 2026-06-16 删除了 101 张未引用/重复图片（根目录重复 19 张 + 未引用 82 张）
- 原 `images/images/` 嵌套目录已合并到根目录
- 2026-06-16 整理根目录图片：删除重复 23 张，移动未引用文件 25 张到对应子目录，根目录仅剩 8 个子文件夹

---

## 已删除的文件夹（历史记录）

| 文件夹 | 删除时间 | 说明 |
|--------|----------|------|
| `功能矩阵/` | 2026-06-16 | 原 `mb-features-gh-pages/index.html`（6283行）和图片存放处，拆分后内容已迁移到根目录 |
| `index_full.html` | 2026-06-16 | 拆分前的原始完整文件备份 |

---

## 关键加载顺序

`index.html` 中 `<script>` 的加载顺序（必须保持）：

```
1. js/data.js          → 定义 let modules = []
2. js/modules/*.js     → 各模块 push 数据到 modules
3. js/app.js           → 使用 modules 数据初始化应用
```

---

## 注意事项

1. **目录结构红线**：GitHub Pages 根目录必须是 `index.html`，禁止多一层 `APP功能说明/` 嵌套
2. **图片路径**：模块中的 `screenshot` 字段使用相对路径 `images/目录/文件名`
3. **竞品矩阵数据**：`benchmarkData` 内嵌在 `app.js` 中，不通过模块加载
4. **飞书同步**：`loadOnlineModules()` 每分钟自动同步，失败时回退到本地缓存
5. **抽屉元素**：`index.html` 中必须有 `<div id="bmDrawerRoot"></div>`，否则竞品矩阵抽屉无法弹出
6. **状态元素**：`index.html` 中必须有 `<div id="dataSourceStatus">`，否则数据源状态不显示

---

## 维护记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2026-06-16 | 文件拆分 | 将 `功能矩阵/mb-features-gh-pages/index.html`（6283行）拆分为模块化结构 |
| 2026-06-16 | 修复 bug | `activeDetailId` 重复定义、CSS/app.js HTML 标签残留、调试语句移除 |
| 2026-06-16 | 元素修复 | 添加 `bmDrawerRoot` 和 `dataSourceStatus` 元素 |
| 2026-06-16 | 图片清理 | 删除 101 张未引用/重复图片，剩余 98 张 |
| 2026-06-16 | 飞书导出工具 | 创建 `scripts/export-to-feishu.html`：本地模块 → CSV → 飞书表格导入 |
| 2026-06-16 | 飞书同步开关 | 添加 `USE_FEISHU` 变量（`js/app.js` 第19行），`true`=启用飞书在线数据，`false`=仅用本地数据 |
| 2026-06-16 | 图片整理 | 根目录清理：删除重复 23 张，移动未引用 25 张到对应子目录，总计 163 张 |

---

## 飞书数据同步方案

### 架构原则

**本地模块文件 = 主数据源，飞书 = 展示层**

- 所有功能编辑在本地 `js/modules/*.js` 完成
- 飞书多维表格只用于在线展示，不反向编辑
- 截图文件放在 `images/模块名/` 目录下，路径写在模块文件中

### 同步流程

```
1. 本地编辑 → 改 js/modules/*.js + 放截图到 images/模块/
2. 自动导出 → 我说「导出飞书数据」或「更新飞书数据」，Claude 自动读取模块文件并生成 CSV
3. 导入飞书 → 下载 CSV / 复制内容 → 粘贴到飞书多维表格
4. 页面展示 → 自动从飞书 API 拉取（每分钟同步，可通过开关控制）
```

### 飞书同步开关

| 配置项 | 位置 | 说明 |
|--------|------|------|
| `USE_FEISHU` | `js/app.js` 第 19 行 | `true` = 启用飞书在线数据，`false` = 仅用本地数据 |

**切换方式**：
- 用户说「打开飞书同步」→ 改为 `true`
- 用户说「关闭飞书同步」→ 改为 `false`

当前状态：`false`（本地数据模式）

### 导出触发方式

| 方式 | 触发指令 | 执行者 |
|------|----------|--------|
| **自动导出（推荐）** | 我说「导出飞书数据」或「更新飞书数据」 | Claude 自动读取所有模块文件并生成 CSV |
| 浏览器工具 | 打开 `scripts/export-to-feishu.html`，选择 modules 文件夹 | 手动操作 |
| Node.js 脚本 | `node scripts/export-to-feishu.js` | 命令行（需安装 Node） |

> **注意**：只有当我明确说「导出飞书数据」或「更新飞书数据」时，Claude 才会执行自动导出。日常功能更新不需要导出。

### 飞书表格字段映射

| 飞书字段 | 模块属性 | 状态映射 |
|----------|----------|----------|
| `功能编号` | `id` | — |
| `功能名称` | `name` | — |
| `模块名称` | 模块 `name` | — |
| `分组名称` | `section.name` | — |
| `状态` | `status` | `已上线` / `新功能` / `功能迭代` / `待确认` |
| `简要说明` | `desc` | — |
| `功能说明` | `detail` | — |
| `截图路径` | `screenshot` / `screenshots` | 多张用换行分隔 |
| `更新记录` | `updateLog` | — |
| `排序` | 自动生成 | 按模块→分组→功能顺序 |

### 注意事项

1. **单向同步**：本地 → 飞书，飞书修改不会反向同步到本地
2. **截图路径**：模块中的路径是相对路径（如 `images/探索/今日灵感.png`），导入飞书后页面通过 API 拉取
3. **状态值**：飞书表格用中文状态（已上线/新增/迭代中），本地模块用英文（`live`/`new`/`iterate`），导出工具自动转换
4. **竞品矩阵**：`benchmarkData` 内嵌在 `app.js` 中，不通过飞书同步
5. **总览模块**：`overview` 是自动生成的统计页面，不需要在飞书维护

### 更新步骤

1. **逐个列出功能点** — 一次展示一个功能（名称/说明/状态/描述），询问是否需要更新
2. **用户放截图** — 截图放到 `images/模块名/` 目录下（如 `images/探索/`），告知文件名和状态
3. **自动写内容** — 读取图片 → 参考现有描述结构 → 写 `desc` + `detail`

### 字段规范

| 字段 | 格式 | 示例 |
|------|------|------|
| `name` | 功能名称 | "今日灵感" |
| `status` | 状态值：`已上线` / `新功能` / `功能迭代` / `待确认` | `已上线` |
| `desc` | 一句话描述功能是什么 | "探索首页下拉刷新功能，下拉后展示每日推荐灵感内容" |
| `detail` | 编号分点，每条一个维度 | "1.展示位置：... 2.交互说明：... 3.状态说明：..." |
| `screenshot` | 单张图片路径 | `"images/探索/探索今日灵感.png"` |
| `screenshots` | 多张图片路径数组 | `["images/探索/图1.png", "images/探索/图2.png"]` |

### 常见 detail 维度

- 展示位置、布局方式、内容类型、交互说明、状态说明、暗黑模式适配、加载机制、空态处理、筛选/搜索功能
