// 端到端 API 数据流测试 — 模拟浏览器中页面的数据请求链路
import axios from 'axios'

const http = axios.create({ baseURL: 'http://localhost:3001' })
let pass = 0
let fail = 0

function check(name, ok, detail = '') {
  if (ok) { pass++; console.log(`  ✅ ${name}${detail ? ' — ' + detail : ''}`) }
  else    { fail++; console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`) }
}

// ═══ 模拟 HomeView / ListView 数据流 ═══
console.log('\n━━━ HomeView / ListView — getItems() 跨集合查询 ━━━')
const collections = ['trades','lostFounds','groupBuys','errands']
const allResults = await Promise.all(collections.map(c => http.get(`/${c}`).then(r => ({ col: c, data: r.data }))))
const merged = allResults.flatMap(({ col, data }) => data.map(item => ({ ...item, type: col })))

check('四个集合全部返回', allResults.every(r => r.data.length >= 6))
check('合并后总数 = 24', merged.length === 24, `${merged.length} 条`)
check('每条都有 type 字段', merged.every(i => i.type))
check('每条都有 title 字段', merged.every(i => i.title))
check('每条都有 status 字段 (open/closed)', merged.every(i => i.status === 'open' || i.status === 'closed'))

// 按 status 统计
const openCount = merged.filter(i => i.status === 'open').length
const closedCount = merged.filter(i => i.status === 'closed').length
check('status 分布合理', openCount > 0 && closedCount > 0, `open: ${openCount}, closed: ${closedCount}`)

// ═══ 模拟 TradeView 数据流 ═══
console.log('\n━━━ TradeView — getTrades() ━━━')
const tradesRes = await http.get('/trades')
const trades = tradesRes.data.map(t => ({ ...t, type: 'trades' }))
check('trades 返回 6 条', trades.length === 6)
check('每条有 price', trades.every(t => typeof t.price === 'number'), trades.map(t => `¥${t.price}`).join(', '))
check('每条有 allowBargain', trades.every(t => 'allowBargain' in t))
check('每条有 condition', trades.every(t => 'condition' in t))

// ═══ 模拟 LostFoundView 数据流 ═══
console.log('\n━━━ LostFoundView — getLostFounds() ━━━')
const lfRes = await http.get('/lostFounds')
const lfItems = lfRes.data.map(lf => ({ ...lf, type: 'lostFounds', lostOrFound: lf.type }))
check('lostFounds 返回 6 条', lfItems.length === 6)
check('lost/found 映射正确', lfItems.every(i => i.lostOrFound === 'lost' || i.lostOrFound === 'found'),
  lfItems.map(i => i.lostOrFound).join(', '))
check('每条有 eventTime', lfItems.every(i => 'eventTime' in i))
check('每条有 itemFeature', lfItems.every(i => 'itemFeature' in i))

// ═══ 模拟 GroupBuyView 数据流 ═══
console.log('\n━━━ GroupBuyView — getGroupBuys() ━━━')
const gbRes = await http.get('/groupBuys')
const gbItems = gbRes.data.map(gb => ({ ...gb, type: 'groupBuys' }))
check('groupBuys 返回 6 条', gbItems.length === 6)
check('每条有 targetCount/currentCount', gbItems.every(i => typeof i.targetCount === 'number' && typeof i.currentCount === 'number'))
check('每条有 deadline', gbItems.every(i => 'deadline' in i))

// ═══ 模拟 ErrandView 数据流 ═══
console.log('\n━━━ ErrandView — getErrands() ━━━')
const erRes = await http.get('/errands')
const erItems = erRes.data.map(e => ({ ...e, type: 'errands' }))
check('errands 返回 6 条', erItems.length === 6)
check('每条有 reward', erItems.every(i => typeof i.reward === 'number'), erItems.map(i => `¥${i.reward}`).join(', '))
check('每条有 taskPlace', erItems.every(i => 'taskPlace' in i))

// ═══ 模拟 DetailView 数据流 ═══
console.log('\n━━━ DetailView — getItem() 单条详情 ━━━')
const ids = [
  { id: 't1', col: 'trades' },
  { id: 'lf1', col: 'lostFounds' },
  { id: 'gb2', col: 'groupBuys' },
  { id: 'e5', col: 'errands' },
]
for (const { id, col } of ids) {
  const r = await http.get(`/${col}/${id}`)
  check(`GET /${col}/${id}`, r.data && r.data.id === id, r.data.title)
}

// ═══ ItemCard 渲染所需字段检查 ═══
console.log('\n━━━ ItemCard 组件渲染字段 ━━━')
const cardFields = ['id','title','description','type','campus','status','viewCount','favoriteCount','createdAt','tags','images']
for (const col of collections) {
  const sample = merged.find(i => i.type === col)
  if (!sample) { check(`${col} 有样本数据`, false); continue }
  const missing = cardFields.filter(f => !(f in sample))
  check(`${col} ItemCard 字段完整`, missing.length === 0, missing.length ? `缺少: ${missing.join(',')}` : '全部就绪')
}

// ═══ summary() 函数测试 (ItemCard 摘要) ═══
console.log('\n━━━ ItemCard summary() 摘要 ━━━')
const tSample = trades[0]; check('trades summary', typeof tSample.price === 'number', `¥${tSample.price}`)
const lfSample = lfItems[0]; check('lostFounds summary', lfSample.lostOrFound === 'lost' || lfSample.lostOrFound === 'found', lfSample.lostOrFound === 'lost' ? '寻物' : '招领')
const gbSample = gbItems[0]; check('groupBuys summary', typeof gbSample.currentCount === 'number' && typeof gbSample.targetCount === 'number', `${gbSample.currentCount}/${gbSample.targetCount}人`)
const erSample = erItems[0]; check('errands summary', typeof erSample.reward === 'number', `¥${erSample.reward}`)

// ═══ 辅助数据 ═══
console.log('\n━━━ 辅助端点 ━━━')
const favRes = await http.get('/favorites')
check('favorites', favRes.data.length === 4, `${favRes.data.length} 条`)

const convRes = await http.get('/conversations')
check('conversations', convRes.data.length >= 1, `${convRes.data.length} 条`)

const msgRes = await http.get('/messages')
check('messages', msgRes.data.length >= 1, `${msgRes.data.length} 条`)

const userRes = await http.get('/users')
check('users', userRes.data.length >= 3, `${userRes.data.length} 条`)

const noticeRes = await http.get('/notices')
check('notices', noticeRes.data.length === 4, `${noticeRes.data.length} 条`)

// ═══ 总结 ═══
console.log(`\n${'═'.repeat(50)}`)
console.log(`  通过: ${pass}  |  失败: ${fail}  |  总计: ${pass + fail}`)
console.log(`${'═'.repeat(50)}`)
if (fail > 0) process.exit(1)
