# Day5 Evidence - 状态管理与用户中心

## 1. 今日完成内容
今天完成了校园轻集市的 Pinia 状态管理层与用户中心模块。引入 Pinia 作为全局状态管理方案，创建了 `userStore`（用户状态）和 `favoritesStore`（收藏状态）两个 Store，并完成以下落地工作：
- 改造 `AppNav.vue` 导航栏，从 `userStore` 动态读取用户昵称和头像，不再写死"我的"标签
- 改造 `PublishView.vue` 发布页，`publisherId` 和 `publisherName` 从 `userStore` 动态获取，新帖子自动关联当前登录用户
- 改造 `ProfileView.vue` 个人中心，从 `userStore` 读取用户资料（昵称、学院、校区、角色、信用分）展示，从 `favoritesStore` 读取收藏列表展示
- 为"我的发布"模块实现数据表格展示，按用户 ID 过滤并支持状态切换
- 为 `MessageView.vue` 消息中心补充静态系统消息卡片（欢迎语、功能提示、安全须知、平台公告），为 Day6 即时聊天做 UI 铺垫

## 2. Store 设计说明
| Store 文件 | 管理内容 | 主要状态 | 主要方法 |
| src/stores/user.ts | 当前用户身份信息 | `currentUser`（User｜null）、`loading`（boolean）、`isLoggedIn`（computed）、`userId`（computed） | `loadUser()` 从 localStorage 恢复并请求 API、`register()` 创建本地用户身份、`updateProfile()` 更新用户信息、`logout()` 清除状态和 localStorage |
| src/stores/favorites.ts | 收藏状态 | `favorites`（Favorite[]）、`favoriteItems`（带完整帖子的收藏列表）、`loading`（boolean）、`favoriteIds`（computed Set）、`favoriteCount`（computed） | `fetchFavorites()` 拉取收藏列表、`fetchFavoritesWithItems()` 拉取带帖子详情的收藏、`toggleFavorite(itemId, collection)` 切换收藏/取消收藏并返回最终状态（true=已收藏）、`isFavorited(itemId)` O(1) 判断是否已收藏 |

**userStore 设计要点：**
- 用户 ID 持久化到 `localStorage`（key: `campus-market-user-id`），页面刷新后通过 `loadUser()` 自动恢复
- `isLoggedIn` 和 `userId` 是 computed 派生状态，避免冗余数据
- `register()` 方法创建本地用户身份（调用 `createUser` API），不涉及复杂认证流程

**favoritesStore 设计要点：**
- `toggleFavorite()` 采用"先查后操作"模式：调用 `getFavoriteByUserAndItem()` 检查是否已收藏，已收藏则 `removeFavorite()`，未收藏则 `addFavorite()`，返回 boolean 供调用方更新 UI
- `favoriteIds` 使用 `computed(() => new Set(...))` 实现，`isFavorited()` 只需 O(1) Set.has() 查找
- 内部直接调用 `useUserStore()` 获取当前用户 ID，外部使用时无需手动传入

## 3. 状态边界说明
**放入 Store 的数据（跨组件/跨页面共享）：**
- 当前用户信息（`currentUser`）放入 `userStore`——因为导航栏 `AppNav`、发布页面 `PublishView`、个人中心 `ProfileView`、首页 `HomeView`、聊天页面 `ChatView`、登录页面 `LoginView`、详情页 `DetailView` 等共 7+ 个页面/组件都需要读取
- 收藏列表（`favorites` / `favoriteItems`）放入 `favoritesStore`——因为列表页 `ListView` 需要判断收藏状态、个人中心 `ProfileView` 需要展示收藏列表

**未放入 Store 的数据（页面局部状态）：**
- 发布表单的输入字段（`title`、`desc`、`price`、`condition` 等）——这些是 `PublishView.vue` 内部的 `ref` 局部状态，表单填写过程中不需要跨页面共享，提交后即写入后端
- 表单校验错误（`err`）——只属于发布页面的瞬时 UI 反馈，不需要其他页面感知
- 消息页面的系统消息卡片（`systemMessages`）——当前为静态演示数据，存放在 `MessageView.vue` 局部常量中，Day6 引入动态系统消息时再考虑是否抽入 Store
- 个人中心的 Tab 切换状态（`tab: 'published' | 'favorites'`）——纯 UI 交互状态，仅在 `ProfileView.vue` 内部使用

## 4. 页面使用记录

| 页面/组件 | 使用的 Store | 使用方式 |
| AppNav.vue（底部导航栏） | userStore、messagesStore | `tabs` 改为 `computed`，"我的" tab 的 label 从 `userStore.currentUser?.nickname` 动态读取，有头像时显示 `<img>` 替代 emoji |
| PublishView.vue（发布页面） | userStore | `submit()` 中取 `userStore.userId` 作为 `publisherId`，`userStore.currentUser?.nickname` 作为 `publisherName`，注入到四种帖子类型（trades / lostFounds / groupBuys / errands）的 create API 调用中 |
| ProfileView.vue（个人中心） | userStore、favoritesStore、itemsStore | Banner 区域展示 `currentUser.nickname`、`college`、`campus`、`role`、`creditScore`；"我的发布" tab 按 `publisherId` 过滤 itemsStore 数据；"我的收藏" tab 渲染 `favoritesStore.favoriteItems`；退出登录调用 `userStore.logout()` |
| HomeView.vue（首页） | userStore | 欢迎区域显示当前用户昵称 |
| DetailView.vue（详情页） | userStore、favoritesStore | 收藏按钮通过 `favoritesStore.toggleFavorite()` 切换，`isFavorited()` 判断按钮文案 |
| LoginView.vue（登录页） | userStore | 注册后调用 `userStore.register()` 保存用户身份 |
| ChatView.vue（聊天页） | userStore | 获取当前用户身份用于消息发送 |
| MessageView.vue（消息中心） | messagesStore（已有） | 静态系统消息为局部数据，不依赖 Store |

## 5. AI 协作记录
本次开发使用 **Claude Code（Claude Opus 4.8）** 作为 AI 辅助工具。
**输入的核心提示词：**
- "检查一下我的功能是否实现了：在导航栏中显示用户信息，让它不再写死用户名，而是从 userStore 中动态读取并显示"
- "检查一下我的功能是否实现了：发布页面的逻辑是让新发布的帖子自动关联到当前登录用户，而不是写死一个字符串"
- "检查一下我的功能是否实现了：创建收藏状态，创建另一个专门管理'用户收藏'的仓库，用来存储、添加、删除收藏项，并提供一个判断是否已收藏的方法"
- "检查一下我的功能是否实现了：改造个人中心页面，让它从 userStore 读取用户资料展示，并从 favoriteStore 读取收藏列表展示"
- "检查'我的发布'模块的基础数据展示"
- "补充消息中心基础状态，展示静态系统消息卡片"

**AI 生成的内容：**
- `AppNav.vue` 改造方案：导入 `useUserStore`，将 `tabs` 从静态数组改为 `computed` 响应式，Profile tab 的 label 动态读取 `userStore.currentUser?.nickname`，有头像时渲染 `<img>`
- `PublishView.vue` 改造检查：确认 `submit()` 中 `pubId` 取自 `userStore.userId`，`pubName` 取自 `userStore.currentUser?.nickname`，四种帖子类型全部关联当前用户
- `favoritesStore` 设计检查：确认 `isFavorited()` 使用 computed Set 实现 O(1) 查找，`toggleFavorite()` 内部自动调用 `useUserStore()` 获取 userId
- `ProfileView.vue` 改造检查：确认 Banner 区域、我的发布、我的收藏三个模块全部从 Store 动态读取，无写死数据
- `MessageView.vue` 静态系统消息实现：5 条消息卡片（欢迎/提示/安全/公告），四种配色方案，左侧彩色边框 + 圆形图标 + tag 标签

**AI 生成内容中需要调整的地方：**
- 初期检查时 AI 多次发现功能"已实现"（如 PublishView 早已完成用户关联、ProfileView 早已接入 Store），说明原始代码设计已较完善，AI 主要用于验证和补充缺失部分
- AI 在检查 `MessageView.vue` 时确认"尚未实现"系统消息，随后按用户指令补充了完整的静态消息卡片模块
- 无需要删除的过度设计内容——本次实现保持了教学项目的简洁性，未引入 JWT 登录、OAuth 等复杂认证逻辑

## 6. 人工调整内容

Day5 的实现模式为"先由 AI 检查功能完整性，再按需修改"：

| 调整项 | 说明 |
|---|---|
| AppNav.vue 导航栏改造 | 确认原代码 tabs 为静态数组、未导入 userStore，由 AI 执行修改：导入 useUserStore、tabs 改为 computed、Profile tab 动态读取用户昵称和头像 |
| PublishView.vue 发布页验证 | AI 检查后确认已实现：publisherId 和 publisherName 均从 userStore 动态获取，四种帖子类型全部关联 |
| favoritesStore 验证 | AI 检查后确认已实现：isFavorited() O(1) 方法、toggleFavorite() 先查后操作模式、内部自动获取 userId |
| ProfileView.vue 验证 | AI 检查后确认已实现：Banner 展示用户资料、我的发布过滤、我的收藏渲染、空状态引导、登录守卫 |
| MessageView 静态消息 | AI 检查后确认"尚未实现"，按用户指令补充 5 条系统消息卡片，四种类型配色，不引入任何 Store |
| 未引入复杂登录系统 | 刻意保持 userStore.register() 的简易注册模式，仅创建本地用户并存储 ID 到 localStorage，不涉及 JWT、OAuth、密码验证等 |

## 7. 测试记录

**测试 1：导航栏动态显示用户名**
- 在登录页面注册用户（昵称"张三"，学院"计算机科学学院"，校区"狮子山校区"，角色"买家"）
- 注册成功后跳转首页
- 查看底部导航栏，最后一个 tab 的 label 从默认的"我的"变为"张三"
- 刷新页面后，导航栏 label 仍显示"张三"（localStorage 恢复生效）

**测试 2：发布页面关联当前用户**
- 以注册用户身份进入发布页面
- 选择"二手交易"，填写标题"测试商品"、售价 10 元、其他必填项
- 点击发布，成功后进入二手交易列表页
- 打开 db.json，查看 trades 数组中新增的记录，`publisherId` 为当前用户 ID，`publisherName` 为"张三"
- 选择"失物招领"类型再次发布，确认 `publisherId` 和 `publisherName` 同样正确关联

**测试 3：收藏功能完整流程**
- 在列表页点击某帖子的收藏按钮，按钮文字从"收藏"变为"已收藏"
- 切换到另一个帖子，点击收藏
- 进入个人中心 →"我的收藏"tab，确认两个收藏的帖子都在列表中显示（标题、类型、状态）
- 点击其中一条的"取消收藏"按钮，该条目从收藏列表消失
- 返回列表页，确认该帖子的按钮已恢复为"收藏"

**测试 4：消息中心静态卡片**
- 从导航栏进入消息中心
- 右侧面板显示 5 条系统消息卡片（欢迎语、发布功能上线、安全须知、即时聊天预告、更多功能预告）
- 确认四种类型卡片左侧彩色边框颜色正确（紫/绿/橙/灰）
- 确认圆形图标和 tag 标签与类型匹配

## 8. 遇到的问题与解决方法

**问题：导航栏用户名写死，未被公共组件读取**

现象：`AppNav.vue` 中导航标签 `tabs` 是一个静态数组，最后一个 tab 的 label 写死为字符串 `'我的'`，icon 写死为 emoji `'👤'`。即使用户已登录并设置了昵称，导航栏仍然显示"我的"。
原因：`AppNav.vue` 未导入 `useUserStore`，`tabs` 不是响应式计算属性，用户状态的变化无法触发导航栏重新渲染。
解决方案：
1. 在 `AppNav.vue` 中导入 `useUserStore` 并创建实例
2. 将 `tabs` 从静态数组改为 `computed(() => [...])`，Profile tab 的 `label` 改为 `userStore.currentUser?.nickname || '我的'`
3. 在模板中为 Profile tab 添加头像渲染逻辑：有头像时显示 `<img>`，无头像时回退 emoji
4. 添加 `.nav-avatar` 样式（22px 圆形头像，object-fit: cover）
修改后登录用户看到导航栏显示自己的昵称而非写死的"我的"，未登录用户仍显示默认的"我的"作为兜底。

## 9. 今日反思
Pinia 状态管理对多页面前端应用的作用在于：它提供了一层独立于组件树的响应式数据层，让原本散落在各个页面 ref 中的共享数据有了统一的控制中心。以校园集市为例，用户身份（当前是谁、昵称是什么、ID 是什么）在导航栏、发布页、个人中心、聊天页、详情页等至少七个位置被使用——如果没有 `userStore`，每个页面都需要独立获取和管理用户数据，要么通过路由参数逐层传递（prop drilling），要么各自请求 API（重复请求）。**Pinia** 的 `defineStore` 将这块逻辑收敛到一个模块中：`currentUser` 作为唯一数据源（single source of truth），`isLoggedIn` 和 `userId` 作为派生状态自动计算，`loadUser()` 提供一致的初始化策略。这使得**状态管理**不再散落各处，而是有了清晰的生命周期。
AI 协作方面，本次采用"先检查后修改"的模式：先让 AI 逐一检查各功能是否已实现，确认缺失项后再精准修改。这避免了盲目生成冗余代码，也让人对 AI 的判断保持主导权。
