import { get, post, patch } from './index'
import type { Message } from '@/types'

export function getMessages(conversationId: string): Promise<Message[]> {
  return get<Message[]>(`/messages?conversationId=${conversationId}&_sort=createdAt&_order=asc`)
}

export function sendMessage(
  message: Omit<Message, 'id' | 'createdAt' | 'read'>,
): Promise<Message> {
  return post<Message>('/messages', {
    ...message,
    createdAt: new Date().toISOString(),
    read: false,
  })
}

export function markAsRead(id: string): Promise<Message> {
  return patch<Message>(`/messages/${id}`, { read: true })
}
