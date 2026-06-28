# AI Collaboration Card
# day 1
Task4
一.分析项目目录结构
1.prompt:根据我的文件夹，分析项目目录结构

2.AI输出：campus-market-seed/
├── .editorconfig / .git* / .nvmrc / .oxlintrc.json  # 项目配置
├── .vscode/                # VSCode 推荐扩展 & 设置
├── .uploads/               # 上传目录
├── docs/
│   ├── ai/                 # AI 协作卡片
│   ├── evidence/           # 每日进度证据 (Day1~7)
│   └── guide/              # 环境搭建 & 上手指南
├── public/                 # favicon
├── scripts/                # 脚本 (空)
├── src/
│   ├── api/                # API 模块 (空, 待实现)
│   ├── components/         # 公共组件 (空, 待实现)
│   ├── router/index.ts     # Vue Router (当前仅 / → HomeView)
│   ├── stores/             # Pinia 状态管理 (空, 待实现)
│   ├── views/HomeView.vue  # 首页 (启动成功占位)
│   ├── App.vue             # 根组件 (标题 + RouterView)
│   └── main.ts             # 入口
├── index.html
├── vite.config.ts
├── eslint.config.ts
├── tsconfig*.json
└── package.json
3.自己的理解：campus-market-seed（校园轻集市）前端技术栈全部配好了，业务层留白现在。

4.最终结论：项目目前配置了基础设施，接下来需要我们分析需求进行前端内容完善。


二.解释 main.ts
1.prompt:解释一下 main.ts；整体和部分展开

2.AI输出：
整体概述
main.ts 是 Vue 3 应用的入口文件，负责：创建 Vue 实例 → 安装插件 → 挂载到 DOM。整个流程仅 12 行，职责非常清晰。
逐部分展开
1. 导入依赖（第 1~5 行）
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
- createApp — Vue 3 提供的工厂函数，用于创建应用实例（Vue 2 的 new Vue() 在 Vue 3 中不再使用）
- createPinia — Pinia 状态管理的工厂函数，Pinia 是 Vue 3 官方推荐的状态管理库，替代 Vuex
- App — 根组件（App.vue），包含应用标题和 <RouterView />
- router — 从 ./router/index.ts 导入的路由实例，当前只有 / 一条路由
2. 创建应用实例（第 7 行）
const app = createApp(App)
以 App.vue 为根组件创建 Vue 应用实例。这个 app 对象是后续所有插件注册的载体。
3. 注册插件（第 9~10 行）
app.use(createPinia())   // 注册 Pinia 状态管理
app.use(router)          // 注册 Vue Router
- app.use() 是 Vue 3 的插件安装方法，与 Vue 2 的 Vue.use() 对应
- Pinia：全局注入 store，使所有组件可通过 useXxxStore() 访问状态
- Router：注册路由系统，使模板中可使用 <RouterView /> 和 <RouterLink />，组件内可通过 useRouter() / useRoute() 操作路由
- 注册顺序不重要，两者互不依赖
4. 挂载到 DOM（第 12 行）
app.mount('#app')
将 Vue 应用渲染到 index.html 中的 <div id="app"></div> 元素上。这一步之后，页面才会真正显示内容。

3.自己理解： main.ts是整个 Vue 3 应用的入口文件，负责创建应用实例、挂载插件并将应用渲染到页面上。

4.最终结论：main.ts 是 Vue 3 应用的唯一启动入口，承担三个职责：创建应用实例、注册全局插件、挂载到 DOM。它的代码量少，但控制了整个应用的初始化顺序和生命周期起点。


三.解释 router 的作用
1.Prompt:解释 router 的作用

2.AI输出：
Router 的作用
Vue Router 是 Vue 的官方路由管理器，核心职责是将 URL 路径与组件对应起来，实现单页应用（SPA）的页面切换 —— 改变 URL 但不刷新页面，只替换视图区域的内容。
逐行拆解
createWebHistory
history: createWebHistory(import.meta.env.BASE_URL)
使用 HTML5 History 模式（去 # 的干净 URL，如 /user/profile），URL 基路径取自 vite.config.ts 中配置的 base。
routes 数组
routes: [
  { path: '/', name: 'home', component: HomeView }
]
定义 URL → 组件的映射表。当前只有一条规则：
path	name	component	说明
/	home	HomeView	访问根路径时渲染首页
每个路由项包含：
- path — 浏览器 URL 路径
- name — 路由别名，编程跳转时用 router.push({ name: 'home' }) 替代硬编码路径
- component — 匹配时渲染的组件，渲染在 <RouterView /> 位置
在应用中的完整工作流
用户在浏览器访问 /
        │
        ▼
Router 匹配 path: '/' → component: HomeView
        │
        ▼
<RouterView /> 渲染 HomeView 组件
        │
        ▼
用户看到 "项目启动成功" 页面
未来新增页面（如商品列表、登录）只需在 routes 数组中追加条目即可。

3.自己的理解：Router 在这个项目中的角色让我想到一个比喻：它是应用的"接线员"。用户在浏览器地址栏输入 URL，Router 负责接听这个"电话"，然后转接到正确的"分机"。

4.结论：Router 是 Vue 单页应用（SPA）的核心导航机制。它的本质是一张 URL 到组件的映射表，配合 <RouterView /> 插槽实现无刷新页面切换。当前项目中 Router 处于最小配置状态，只注册了一个首页路由，但随着业务发展，这张映射表会逐步扩充为商品列表、商品详情、个人中心等多个路由，成为整个应用的页面调度中心。

四.分析当前项目采用的技术栈
1.prompt:分析当前项目采用的技术栈，直接罗列出来

2.AI输出：
层面	技术
框架	Vue 3.5
语言	TypeScript ~6.0
构建工具	Vite 8
状态管理	Pinia 3
路由	Vue Router 5
代码检查	ESLint 10 + Oxlint 1.69
包管理	pnpm 11.9
Node 版本	^22.18 || >=24.12
IDE 支持	VSCode + Volar

3.自己的理解：这套技术栈的核心思路是：Vue 3 + Vite + Pinia + TypeScript 四件套互为支撑，OxLint 和 pnpm 进一步强化了速度和一致性。业务目录全部留白
4.结论：要掌握Vue 3、TypeScript、Vite、Pinia等内容，看懂整体结构。


# day 2

一. 获取需求文档，建立类型系统与数据层
1.prompt：访问 https://www.yuque.com/gaspar-8oozl/augo0g/uvrmgep4f70746vi，完成 Day2 的页面骨架与路由导航任务

2.AI输出：
- 从语雀文档提取完整的《校园轻集市需求分析》
- 提炼四个业务场景：二手交易、失物招领、拼单搭子、跑腿委托
- 提炼12个功能模块：身份创建、今日集市首页、集市信息浏览、信息详情查看、信息发布表单、收藏与取消收藏、模拟砍价互动、消息中心、个人中心、趋势看板、本地数据管理、交易安全提醒
- 创建 src/types/index.ts：User、CampusItem（统一类型+4组专属字段）、Favorite、Conversation、Message、Notice、ItemFilters、PublishForm
- 创建 db.json：1个用户、12条校园信息（覆盖四类场景）、2条收藏、1条会话、4条安全提醒
- 创建 src/api/ 层：index.ts（fetch 封装）、users.ts、items.ts、favorites.ts、conversations.ts、messages.ts、notices.ts
- 安装 json-server、echarts + vue-echarts、concurrently
- 创建 Pinia Stores：user.ts（本地身份）、items.ts（信息CRUD+筛选）、favorites.ts（收藏切换）、messages.ts（会话+模拟回复）

3.自己的理解：需求文档中四个业务场景虽然含义不同，但在代码层面可以共用同一个 CampusItem 类型，通过 type 字段区分，通过 price、lostOrFound、targetCount、reward 等可选字段承载差异化属性。这种"一个类型承载多变体"的设计避免了四套重复的页面和接口。另外 JSON Server 不是真正的后端，而是用 db.json 模拟 RESTful API，它支持 ?type=xxx&_sort=createdAt 等查询参数，前端可以像请求真实后端一样获取数据。

4.最终结论：从需求分析到类型定义、数据模型、API 层、状态管理，建立了一条完整的前端数据流通链路。后续所有页面的数据展示、筛选、发布、收藏、消息都依赖这一层基础设施。


二. 页面组件全面创建
1.prompt：（延续上文计划中的步骤）创建全部共享组件和页面

2.AI输出：
创建 6 个共享组件：
- AppNav.vue — 移动端底部 TabBar（后续废弃，改为 PC 顶部导航）
- ItemCard.vue — 信息卡片（图片+标题+摘要+元信息）
- SearchFilter.vue — 搜索栏 + 类型/校区/状态筛选 + 排序
- TypeTag.vue / StatusTag.vue — 彩色标签
- SafetyNotice.vue — 可折叠安全提醒

创建/重写 9 个页面：
- LoginView.vue — 渐变背景卡片表单
- HomeView.vue — 欢迎卡片 + 统计 + 快捷入口 + 最新列表
- ListView.vue — 搜索筛选 + 信息卡片网格
- DetailView.vue — 详情 + 砍价弹窗
- PublishView.vue — 类型选择 + 动态表单
- MessageView.vue — 会话列表 + Tab切换
- ChatView.vue — 消息气泡 + 模拟回复
- ProfileView.vue — 用户资料 + 发布/收藏管理
- BoardView.vue — 统计卡片 + ECharts 图表

路由更新：添加 /login、/chat/:conversationId
App.vue 更新：条件渲染导航栏、RouterView 容器

3.自己的理解：AI 默认生成的是移动端优先布局（底部 TabBar、单列卡片）。但项目定位是 PC 端应用，后续需要根据 .docx 设计文档全面调整。

4.最终结论：第一版实现了完整的功能闭环——所有页面都能从 API 读取数据，发布、收藏、消息等交互走通了完整的读写链路。但 UI 风格偏"Demo 感"，需要进一步升级。


四. 看板页面路由跳转失效的排查与修复
1.prompt：无法跳转到看板页面，请做出修改 → 从看板页面没办法丝滑跳转到其他页面，需要刷新才可以 → 怎么解决的？

2.AI输出：
排查过程：
- 第一步：确认路由配置正确（/board 已注册），HTTP 返回 200
- 第二步：发现 HTML 中 RouterLink 渲染异常，尝试改为 <a href> + @click.prevent 方式
- 第三步：仍然无法从看板页跳转，但其他页面可以——问题范围缩小到 BoardView 自身
- 第四步：定位根因——BoardView 中 ECharts 按需注册 use([PieChart, BarChart, ...]) 在运行时抛出未捕获错误，Vue 的全局响应式系统静默崩溃，导致 router.push() 全局失效

解决方法：
- 完全移除 ECharts 和 vue-echarts 依赖
- 用纯 CSS 实现图表：conic-gradient 做圆环图、百分比 progress bar 做柱状图、带色进度条做状态分布
- 导航栏改为原生 <a href> + @click.prevent="router.push()"，降低导航失效风险

3.自己的理解：这个 bug 的教训很深刻。表面现象是"点击没反应"，容易误判为路由配置问题或 HTML 链接问题。但真正的原因是 ECharts 抛错后被 Vue 的静默错误处理吞掉，响应式系统被"毒死"了——页面静态 HTML 已经渲染出来所以看起来正常，但所有依赖 JavaScript 响应的操作（包括 router.push）全部失效。这说明引入第三方图表库时要优先考虑"失败了会怎样"。

4.最终结论：对于教学项目，纯 CSS 图表的维护成本远低于 ECharts，不存在运行时崩溃风险。这个决策也符合需求文档的定位——"教学模拟项目，不追求真实产品级复杂度"。
