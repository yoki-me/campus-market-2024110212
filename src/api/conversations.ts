import http from './http'
import type { Conversation } from '@/types'

export async function getConversations(userId: string): Promise<Conversation[]> {
  const res = await http.get<Conversation[]>(
    `/conversations?buyerId=${userId}&_sort=updatedAt&_order=desc`,
  )
  return res.data
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
