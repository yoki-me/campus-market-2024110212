import http from './http'
import type { Conversation } from '@/types'

export async function getConversations(userId: string): Promise<Conversation[]> {
  const buyerPromise = http.get<Conversation[]>(`/conversations?buyerId=${userId}`)
    .then(res => Array.isArray(res.data) ? res.data : (res.data as any).value || [])
    .catch(() => [])

  const publisherPromise = http.get<Conversation[]>(`/conversations?publisherId=${userId}`)
    .then(res => Array.isArray(res.data) ? res.data : (res.data as any).value || [])
    .catch(() => [])

  const [buyerData, publisherData] = await Promise.all([buyerPromise, publisherPromise])

  const allConversations = [...buyerData, ...publisherData]
  const seen = new Set<string>()
  const result = allConversations.filter(c => {
    if (seen.has(c.id)) return false
    seen.add(c.id)
    return true
  })

  result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return result
}

export async function getConversation(id: string): Promise<Conversation> {
  const res = await http.get<Conversation>(`/conversations/${id}`)
  return res.data
}

export async function getConversationByItemAndUser(
  itemId: string,
  buyerId: string,
): Promise<Conversation[]> {
  const res = await http.get<Conversation[]>(
    `/conversations?itemId=${itemId}&buyerId=${buyerId}`,
  )
  return res.data
}

export async function createConversation(
  conversation: Omit<Conversation, 'id'>,
): Promise<Conversation> {
  const res = await http.post<Conversation>('/conversations', conversation)
  return res.data
}

export async function updateConversation(
  id: string,
  conversation: Partial<Conversation>,
): Promise<Conversation> {
  const res = await http.patch<Conversation>(`/conversations/${id}`, conversation)
  return res.data
}
