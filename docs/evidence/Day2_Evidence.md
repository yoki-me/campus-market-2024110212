# Day2 Evidence - 页面骨架与路由导航

## 1. 今日完成内容

LoginView.vue — 身份创建页，左右分栏（校园照片 + 表单）
HomeView.vue — 首页，Hero 横幅轮播 + 统计卡片 + 快捷入口 + 最新发布 + 安全提醒
ListView.vue — 集市浏览，左侧筛选栏 + 右侧卡片网格
DetailView.vue — 信息详情，主内容 + 右侧信息栏 + 砍价弹窗
PublishView.vue — 信息发布，类型切换 + 动态表单 + 右侧提示栏
MessageView.vue — 消息中心，左侧会话列表 + 右侧占位
ChatView.vue — 聊天详情，消息气泡 + 模拟回复
ProfileView.vue — 个人中心，用户横幅 + 左侧菜单 + 表格（我的发布/收藏 + 状态更新）
BoardView.vue — 趋势看板，统计卡片 + CSS 圆环图 + 柱状条 + 状态进度条 + 热门 TOP5

## 2. 页面与路由清单

页面名称	路由路径	文件位置
身份创建页	/login	src/views/LoginView.vue
今日集市首页	/	src/views/HomeView.vue
集市信息浏览	/list	src/views/ListView.vue
信息详情	/detail/:id	src/views/DetailView.vue
信息发布	/publish	src/views/PublishView.vue
消息中心	/message	src/views/MessageView.vue
聊天详情	/chat/:conversationId	src/views/ChatView.vue
个人中心	/profile	src/views/ProfileView.vue
趋势看板	/board	src/views/BoardView.vue
路由配置文件：src/router/index.ts

## 3. AI 协作记录

请说明：
- 使用了什么 AI 工具： Claude Code（Claude Opus 4.8）
- 输入了什么核心提示词；
    访问语雀需求文档 → 提取完整需求（四类校园场景、12个功能模块）
    路由/页面命名对齐 + 导航点击跳转修复
    上传 .docx 文件：按照 PC 端高保真原型设计规范，要求面包屑导航、双栏布局、Element Plus Icons 替换 emoji、瑞士极简风格
- AI 生成了哪些内容：
    类型定义 src/types/index.ts（7组接口）
    API 层 6 个文件（fetch 封装 + CRUD）
    Pinia Stores 4 个（user/items/favorites/messages）
    共享组件 6 个（TypeTag/StatusTag/ItemCard/SearchFilter/SafetyNotice/AppNav）
    页面 9 个（全部 views）
    路由配置 src/router/index.ts
    全局样式系统 App.vue（CSS 变量、4px 网格、响应式断点）
    种子数据 db.json（12条信息 + Unplash 真实图片）
- 自己修改、删除或确认了哪些内容：
    确认需求文档中的四个业务场景抽象为统一 ItemType 类型
    确认校区名称改为四川师范大学实际校区（狮子山/成龙/遂宁）
    确认 /login 作为入口，首次访问重定向

## 4. 遇到的问题与解决方法

问题：看板页面无法跳转，而其他页面可以正常跳转
解决：先检查路由是否正确建立，没问题后询问ai，按照他的提示知道该调用在运行时抛出了未捕获的错误，导致 Vue 的响应式系统静默崩溃。表现上看板页面本身能渲染，但 router.push() 等所有响应式操作全部失效，提出解决方案改用纯 CSS 实现数据可视化，实现了正确跳转。

## 5. 今日反思
页面骨架、路由导航和公共布局为后续开发提供了统一的基础框架：路由系统让页面之间的跳转关系一次性确立，后续新增页面只需添加路由即可接入；App.vue 中的全局 CSS 变量（颜色、间距、字体、圆角、阴影）保证了所有页面的视觉一致性，后续页面无需重复定义样式规范；顶部的导航栏和面包屑作为公共布局组件复用于所有页面，减少了重复代码，也让用户在任何页面都能快捷切换。这三点构成了项目的"基础设施层"，后续的业务功能开发可以直接在此基础上展开，不必关心导航跳转和基础样式。