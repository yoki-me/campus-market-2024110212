import { get, post, put } from './index'
import type { User } from '@/types'

export function getUsers(): Promise<User[]> {
  return get<User[]>('/users')
}

export function getUser(id: string): Promise<User> {
  return get<User>(`/users/${id}`)
}

export function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  return post<User>('/users', {
    ...user,
    createdAt: new Date().toISOString(),
  })
}

export function updateUser(id: string, user: Partial<User>): Promise<User> {
  return put<User>(`/users/${id}`, user)
}
