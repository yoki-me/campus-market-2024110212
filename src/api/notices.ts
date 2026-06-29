import http from './http'
import type { Notice } from '@/types'

export async function getNotices(): Promise<Notice[]> {
  const res = await http.get<Notice[]>('/notices')
  return res.data
}
