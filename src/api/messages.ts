import http from './http'
import type { Message } from '@/types'

export async function getMessages(conversationId: string): Promise<Message[]> {
  const res = await http.get<Message[]>(
    `/messages?conversationId=${conversationId}&_sort=createdAt&_order=asc`,
  )
  return res.data
}

export async function sendMessage(
  message: Omit<Message, 'id' | 'createdAt' | 'read'>,
): Promise<Message> {
  const res = await http.post<Message>('/messages', {
    ...message,
    createdAt: new Date().toISOString(),
    read: false,
  })
  return res.data
}

export async function markAsRead(id: string): Promise<Message> {
  const res = await http.patch<Message>(`/messages/${id}`, { read: true })
  return res.data
}
