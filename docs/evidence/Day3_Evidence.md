# Day3 Evidence — Mock 数据建模与列表渲染

## 1. 今日完成内容

今天将项目从静态页面骨架推进到动态数据驱动阶段。
具体工作包括：
- 在 `db.json` 中设计四个核心集合（trades / lostFounds / groupBuys / errands）
- 创建 `src/api/http.ts`（axios 实例，baseURL 指向 `http://localhost:3001`）
- 为四个业务领域分别编写 API 模块：`trade.ts`、`lostFound.ts`、`groupBuy.ts`、`errand.ts`，每个包含完整的 interface 定义和 CRUD 函数
- 创建四个独立列表页：`TradeView.vue`、`LostFoundView.vue`、`GroupBuyView.vue`、`ErrandView.vue`，各自调用领域 API 获取数据，通过 `ItemCard` 组件渲染
- 抽取 `EmptyState.vue` 空状态组件，替换四个页面中重复的「暂无数据」模板
- 添加 `mock` 命令

## 2. Mock 数据结构说明

| 数据集合  | 对应业务 | 核心字段 | 状态 |
| trades   | 二手交易 | title, price, originalPrice, condition, allowBargain, campus, location, tags, images, publisherId, status | 5 open / 1 closed |
|lostFounds| 失物招领 | title, type(lost/found), eventTime, itemFeature, campus, location, tags, images, publisherId, status | 5 open / 1 closed |
| groupBuys| 拼单搭子 | title, targetCount, currentCount, deadline, campus, location, tags, images, publisherId, status | 5 open / 1 closed |
| errands  | 跑腿委托 | title, reward, taskPlace, expectedTime, campus, location, tags, images, publisherId, status | 4 open / 2 closed |

## 3. 我的设计

**为什么二手交易需要 price、originalPrice、condition 和 allowBargain？**

price 是商品售价，originalPrice 是原价——两个字段并存让买家能直观看到折扣力度。condition（成色）是二手交易的核心信息，买家需要据此判断值不值。allowBargain 是一个布尔开关，让发布者自主选择是否接受砍价，对应 DetailView.vue 中的砍价弹窗功能。

**为什么失物招领需要 type 字段（数据库端）/ lostOrFound 字段（前端）？**

失物招领实际上包含两种方向：有人丢东西（寻物），有人捡到东西（招领）。用 type: "lost" | "found" 区分两者。但在数据库中 type 与集合的 type 概念冲突，所以前端用 lostOrFound 接收展示，数据库写入时再转换回去。

**为什么拼单搭子需要 targetCount 和 currentCount？**

targetCount 是目标成团人数，currentCount 是当前已加入人数。两个数字并存，前端可以直接展示进度条（currentCount / targetCount），让浏览者快速判断还差几人成团。deadline 防止无限期等待。

**为什么跑腿委托需要 reward 和 taskPlace？**

reward 是委托酬劳，taskPlace 是任务路线（如「菜鸟驿站 -> 学生公寓3号楼」）。这两者是跑腿任务的核心决策信息——接单者需要知道去哪儿、做什么、能赚多少。跟二手交易不同，跑腿卖的是服务而非物品，所以不需要 price 和 condition。

## 4. AI 设计

AI 在本阶段主要协助完成了以下工作：

1. **生成四个集合的种子数据**：AI 根据我指定的字段结构，为四个集合各编写了 6 条贴近四川师范大学校园生活的 Mock 数据，包括具体的商品描述、价格、校区位置等信息。例如 trades 中有一条「宿舍用小冰箱 50L」定价 280 元——这是典型的大学毕业季场景。

2. **生成四个领域 API 模块**：AI 为 trade.ts、lostFound.ts、groupBuy.ts、errand.ts 分别编写了完整的 interface 定义和 5 个 CRUD 函数（getAll / getById / create / update / delete），每个模块结构一致、命名规范统一。

3. **生成四个列表页**：AI 创建了 TradeView.vue、LostFoundView.vue、GroupBuyView.vue、ErrandView.vue，每个页面在 onMounted 中调用对应 API，将返回数据映射为 CampusItem 格式，通过 ItemCard 组件渲染。

4. **AI 生成内容中的不合理之处**：AI 最初生成的 API 模块使用了 fetch 而非 axios，后来我要求统一为 axios。AI 在生成视图时每个页面都内联了相同的 empty-box 样式，我指出后 AI 抽取了 EmptyState.vue 组件。AI 在生成 data 字段名时用了 db.json 里的 type（lost/found），与前端 CampusItem 的 lostOrFound 字段不一致，需要手动映射。

## 5. 最终调整

我在 AI 生成的基础上做了以下修改：


1. **修改了校区名称为真实校区**：AI 生成的 Mock 数据中校区包括「主校区」「东校区」「西校区」，我将其改为四川师范大学实际校区名称（狮子山校区、成龙校区、遂宁校区），使数据更贴合真实场景。

2. **删除了旧的 fetch 封装文件**：创建 http.ts 后，旧的 src/api/index.ts（基于 fetch）不再有引用。我确认无依赖后将其删除，避免团队困惑。

3. **补全 main.ts 的 Pinia 和 Router**：AI 修改 main.ts 时只保留了 ElementPlus，漏掉了 createPinia() 和 router。我手动补充了这两行，否则整个应用的 store 和路由无法工作。

4. **手动修复 TypeScript 类型错误**：切换数据结构后出现 6 个编译错误，包括可选属性未判空、类型字面量不匹配等。我逐一修复后才通过编译。

## 6. 遇到的问题与解决方法

**问题一：切换四集合结构后 TypeScript 编译报 6 个错误**

修改 types/index.ts 将 ItemType 从 'secondhand' 改为 'trades' 后，所有引用旧 type 值的组件和 API 文件全部报类型错误。例如 DetailView.vue 中 `item.type === 'secondhand'` 不再通过类型检查，HomeView.vue 中 `entries` 数组的 key 值已经不存在。

解决方法：使用全局搜索 `'secondhand'|'lostfound'|'groupbuy'|'errand'` 找到所有引用点，逐一替换为新的 type 值。同时用 grep 搜索 `'active'|'in_progress'|'completed'` 确认所有旧 status 值已清除。

**问题二：http.ts 与 index.ts 并存导致混淆**

新的 http.ts 创建后，旧的 index.ts（fetch 封装）仍然存在。虽然最终 API 模块全部改为 import http.ts，但两个请求层的存在会造成维护困惑。

解决方法：用 grep 搜索 `from './index'` 确认无引用后，手动删除 src/api/index.ts。


## 7. 今日反思

Mock 数据是前端独立开发的基石。在没有真实后端之前，JSON Server 将 db.json 暴露为 RESTful API，让前端可以「像调用真实接口一样」收发数据——这意味着列表渲染、状态筛选、详情跳转等交互逻辑可以在 Day3 就完成闭环验证，而不是等到后端就绪后才开始联调。
列表渲染看似简单，但 ItemCard 组件的 summary() 函数需要根据四种 type 展示不同的摘要信息（价格 / 寻物-招领 / 人数 / 赏金）。如果数据类型本身不统一，这个函数会变得非常脆弱。正是因为我在 Mock 数据阶段就明确了每个集合的字段结构，summary() 函数才能用简单的 switch 语句覆盖所有场景。
今天最大的收获是：先设计数据、再写 API、最后渲染页面——这个顺序让每一步都有明确的输入和输出，避免了「边写页面边改数据格式」的反复。
