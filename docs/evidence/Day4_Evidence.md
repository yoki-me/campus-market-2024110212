# Day4 Evidence - 发布表单与数据新增

## 1. 今日完成内容
今天完成了校园轻集市的发布表单开发，实现了前端表单界面、基础表单校验、Axios POST 数据提交、提交后路由跳转到对应列表页，以及列表页的筛选搜索功能。具体包括：
- 在 PublishView.vue 中实现四种类型（二手交易、失物招领、拼单搭子、跑腿委托）共用的发布表单
- 根据发布类型动态显示不同字段（如二手交易显示价格和成色，失物招领显示事件时间和物品特征）
- 实现了表单校验逻辑（标题、描述、价格、目标人数、任务路线等必填项校验）
- 使用 Axios 向 json-server 发送 POST 请求，数据成功写入 db.json
- 提交成功后自动跳转到对应的列表页面
- 解决了 json-server POST 忽略请求体 id 导致详情页白屏的问题，通过修改路由为 /detail/:type/:id 并在 API 层显式传入 type
- 实现了列表页的关键词搜索（客户端多字段匹配）和标签组合筛选（类型/校区/状态三维度独立切换）

## 2. 发布类型与字段设计
| 发布类型 | 对应数据集合 | 关键字段 | 设计理由 |
| 二手交易 | trades | title、campus、location、description、price、originalPrice、condition、allowBargain | 价格是二手商品的核心信息，成色帮助买家判断商品状况，允许砍价为交易提供灵活空间 |
| 失物招领 | lostFounds | title、campus、location、description、lostOrFound（lost/found）、eventTime、itemFeature | 需要区分"寻物启事"和"失物招领"两种场景，事件时间帮助确认丢失/拾获时间，物品特征帮助失主辨认 |
| 拼单搭子 | groupBuys | title、campus、location、description、targetCount、deadline | 目标人数和截止时间是拼单的核心约束条件，超过截止时间或满员后应自动结束 |
| 跑腿委托 | errands | title、campus、taskPlace、description、reward、expectedTime | 跑腿委托用 taskPlace 描述起止路线，酬劳用 reward 字段，区别于二手交易的 price |
全类型共享的基础字段：title、description、campus、location（跑腿除外）、tags、publisherId、publisherName、status。

## 3. 表单校验规则
校验入口统一为 PublishView.vue 中的 validate() 函数，按类型分层校验：
| 校验字段 | 适用类型 | 规则 | 错误提示 |
| title | 全部 | 不能为空 | "请输入标题" |
| description | 全部 | 不能为空 | "请输入描述" |
| location | trades / lostFounds / groupBuys | 不能为空 | "请输入地点" |
| price | trades | 必须大于 0 | "请输入有效价格" |
| eventTime | lostFounds | 不能为空 | "请选择事件时间" |
| targetCount | groupBuys | 至少为 2 | "目标人数至少为2" |
| deadline | groupBuys | 不能为空 | "请选择截止时间" |
| taskPlace | errands | 不能为空 | "请输入任务路线" |

校验不通过时显示红色错误提示，阻止表单提交。校验通过后进入 POST 请求流程。

## 4. 发布流程与数据新增
用户填写表单 -> validate() 校验 -> 调用类型对应的 create API 函数 -> Axios POST 到 json-server -> 数据写入 db.json -> router.push 跳转到对应列表页。
核心提交逻辑位于 PublishView.vue 的 submit() 函数中：校验通过后，根据当前选中的类型（sel.value），分别调用 createTrade、createLostFound、createGroupBuy 或 createErrand，将表单数据打包发送到对应的 json-server 端点。每个 create 函数内部通过 axios POST 将数据写入 db.json 对应的集合数组，同时自动生成 createdAt 和 updatedAt 时间戳。发布成功后通过 typeRoutes 映射跳转到 /trades、/lostfounds、/groupbuys 或 /errands 页面。

## 5. AI 协作记录

本次开发使用 Claude Code（Claude Opus 4.8）作为 AI 辅助工具。
**输入的核心提示词：**
- "在 PublishView.vue 中实现发布表单；支持发布二手交易、失物招领、拼单搭子、跑腿委托四类信息；根据发布类型显示不同字段；实现基础表单校验；使用 Axios 向 JSON Server 发送 POST 请求；提交成功后跳转到对应列表页面"
- "在发布类型切换时重置表单"
- "完善浏览页面的功能：当在搜索栏搜索关键词或者在筛选标签选择对应的关键词时，会刷新出符合信息的消息"
- "是两种方式筛选：一种为直接输入关键词筛选，一种是根据类型、校区、状态任意组合筛选"
**AI 生成的内容：**
- PublishView.vue 的完整表单模板和提交逻辑
- 四种类型的专属字段（price、originalPrice、condition、lostOrFound、eventTime、itemFeature、targetCount、deadline、reward、taskPlace、expectedTime）
- validate() 校验函数，按类型分层校验
- typeRoutes 跳转映射
- 列表页筛选功能（关键词防抖搜索 + 标签组合筛选）
- API 层从 id 前缀猜测集合改为显式传入 type 的方案
**AI 生成内容中需要调整的地方：**
- AI 最初将四个 API 文件合并为一个 items.ts，经用户指出后还原为 trade.ts、lostFound.ts、groupBuy.ts、errand.ts 四个独立文件
- AI 一度添加了照片上传占位区域（Upload 图标和 .upload-box CSS），用户要求删除以保持教学项目简洁
- AI 最初在模板中使用了 v-for="[k,v] in Object.entries(...) as ..." 的复杂类型断言写法，后改为 Vue 3 的原生对象迭代 v-for="(value, key) in ..." 并配合 script 中的独立函数调用

## 6. 测试记录

**测试 1：发布二手交易**
- 在发布页面选择"二手交易"，填写标题"马原"、售价 30 元、成色"几乎全新"、校区"成龙校区"、地点"一教"、标签"二手书"
- 点击"发布信息"，按钮显示"发布中..."
- 发布成功后自动跳转到 /trades 二手交易列表页
- 在列表页查看，确认新增的"马原"卡片出现在列表中
**测试 2：验证 db.json 数据写入**
- 打开项目根目录 db.json，查看 trades 数组
- 确认新增了一条记录，包含 title、price、condition、campus、location、tags、publisherId、status、createdAt 等完整字段
- createdAt 和 updatedAt 时间戳正确生成
**测试 3：点击详情验证**
- 在列表页点击新发布的条目，跳转到 /detail/trades/{id}
- 详情页正常显示标题、描述、价格、成色、校区、地点等完整信息
- 确认路由 /detail/:type/:id 方案解决了随机 id 无法定位集合的问题
**测试 4：用 Postman / curl 直接测试 json-server API**
- 向 http://localhost:3001/trades 发送 POST 请求
- 确认 json-server 返回 201 Created 状态码和新创建的记录
- 用 GET /trades 确认数据已持久化到 db.json

## 7. 遇到的问题与解决方法

**问题 1：发布后详情页白屏**

现象：发布一条失物招领信息后，列表页可以看到卡片，但点击进入详情页一片空白。
排查过程：通过检查 db.json 发现 json-server 生成的 id 是随机字符串（如 HXIxoLqiy0s），而旧的 getCollectionFromId() 函数靠 id 前缀（lf/gb/e/t）判断数据属于哪个集合。随机 id 没有前缀，永远 fallback 到 trades，导致非 trades 类型条目全部 404。
解决方案：将路由从 /detail/:id 改为 /detail/:type/:id，并在 getItem()、updateItem()、deleteItem()、incrementViewCount() 等函数中由调用方显式传入 type，不再依赖 id 前缀猜测。同时更新了所有视图中的导航链接（/detail/trades/id、/detail/lostFounds/id 等）和收藏 toggle 调用。

## 8. 今日反思
发布表单、表单校验和数据新增是完整 Web 应用中承上启下的关键环节。发布表单是将用户意图转化为结构化数据的入口，它决定了数据采集的完整性和准确性——今天设计的四种类型表单通过 v-if 动态字段切换，避免了单一大表单的信息冗余，让每种发布场景都有量身定制的输入界面。例如二手交易有价格和成色，拼单搭子有目标人数和截止时间，这些差异化字段反映了不同业务场景的真实需求。表单校验则是数据质量的守门人，它在前端拦截无效输入（空标题、负价格、人数不足等），减少了无效请求对服务器的压力，同时也提升了用户体验——用户无需等待服务器返回错误就能即时获得反馈。