import http from './http'
import type { User } from '@/types'

export async function getUsers(): Promise<User[]> {
  const res = await http.get<User[]>('/users')
  return res.data
}

export async function getUser(id: string): Promise<User> {
  const res = await http.get<User>(`/users/${id}`)
  return res.data
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const res = await http.post<User>('/users', {
    ...user,
    createdAt: new Date().toISOString(),
  })
  return res.data
}

export async function updateUser(id: string, user: Partial<User>): Promise<User> {
  const res = await http.put<User>(`/users/${id}`, user)
  return res.data
}
