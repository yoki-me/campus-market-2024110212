// ============ 用户 ============
export interface User {
  id: string
  nickname: string
  college: string
  campus: string
  role: string
  creditScore: number
  avatar: string
  createdAt: string
}

// ============ 校园信息类型（对应 db.json 中的四个集合） ============
export type ItemType = 'trades' | 'lostFounds' | 'groupBuys' | 'errands'

export const ItemTypeLabels: Record<ItemType, string> = {
  trades: '二手交易',
  lostFounds: '失物招领',
  groupBuys: '拼单搭子',
  errands: '跑腿委托',
}

/** 映射 ItemType 到 db.json 中的集合名（二者一致） */
export const CollectionNames: Record<ItemType, string> = {
  trades: 'trades',
  lostFounds: 'lostFounds',
  groupBuys: 'groupBuys',
  errands: 'errands',
}

/** 根据 id 前缀推断所属集合 */
export function getCollectionFromId(id: string): ItemType {
  if (id.startsWith('lf')) return 'lostFounds'
  if (id.startsWith('gb')) return 'groupBuys'
  if (id.startsWith('e')) return 'errands'
  return 'trades' // 't' 前缀或未知回退
}

export type ItemStatus = 'open' | 'closed'

export const ItemStatusLabels: Record<ItemStatus, string> = {
  open: '进行中',
  closed: '已关闭',
}

export interface CampusItem {
  id: string
  type: ItemType
  title: string
  description: string
  campus: string
  location: string
  tags: string[]
  images: string[]
  publisherId: string
  publisherName?: string
  status: ItemStatus
  viewCount: number
  favoriteCount: number
  createdAt: string
  updatedAt: string
  // 二手交易专属
  price?: number
  originalPrice?: number
  condition?: string
  allowBargain?: boolean
  // 失物招领专属
  lostOrFound?: 'lost' | 'found'
  eventTime?: string
  itemFeature?: string
  // 拼单搭子专属
  targetCount?: number
  currentCount?: number
  deadline?: string
  // 跑腿委托专属
  reward?: number
  taskPlace?: string
  expectedTime?: string
}

// ============ 收藏 ============
export interface Favorite {
  id: string
  userId: string
  itemId: string
  collection: ItemType
  createdAt: string
  item?: CampusItem
}

// ============ 会话 ============
export interface Conversation {
  id: string
  itemId: string
  collection: ItemType
  buyerId: string
  publisherId: string
  lastMessage: string
  unreadCount: number
  updatedAt: string
  itemTitle?: string
  otherUserName?: string
}

// ============ 消息 ============
export interface Message {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  messageType: 'text' | 'bargain' | 'system'
  createdAt: string
  read: boolean
}

// ============ 安全提醒 ============
export interface Notice {
  id: string
  title: string
  content: string
  type: 'safety' | 'system'
  createdAt: string
}

// ============ 筛选条件 ============
export interface ItemFilters {
  keyword: string
  type: ItemType | ''
  campus: string
  status: ItemStatus | ''
  sortBy: 'createdAt' | 'viewCount' | 'price'
  sortOrder: 'asc' | 'desc'
}

// ============ 发布表单 ============
export interface PublishForm {
  type: ItemType
  title: string
  description: string
  campus: string
  location: string
  tags: string[]
  images: string[]
  // 二手
  price?: number
  condition?: string
  allowBargain?: boolean
  // 失物招领
  lostOrFound?: 'lost' | 'found'
  eventTime?: string
  itemFeature?: string
  // 拼单
  targetCount?: number
  deadline?: string
  // 跑腿
  reward?: number
  taskPlace?: string
  expectedTime?: string
}
