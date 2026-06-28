import { get } from './index'
import type { Notice } from '@/types'

export function getNotices(): Promise<Notice[]> {
  return get<Notice[]>('/notices')
}
