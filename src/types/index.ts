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

// ============ 校园信息类型 ============
export type ItemType = 'secondhand' | 'lostfound' | 'groupbuy' | 'errand'

export const ItemTypeLabels: Record<ItemType, string> = {
  secondhand: '二手交易',
  lostfound: '失物招领',
  groupbuy: '拼单搭子',
  errand: '跑腿委托',
}

export type ItemStatus = 'active' | 'in_progress' | 'completed' | 'closed' | 'found' | 'claimed'

export const ItemStatusLabels: Record<ItemStatus, string> = {
  active: '进行中',
  in_progress: '处理中',
  completed: '已完成',
  closed: '已关闭',
  found: '已找回',
  claimed: '已认领',
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
  createdAt: string
  item?: CampusItem
}

// ============ 会话 ============
export interface Conversation {
  id: string
  itemId: string
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
