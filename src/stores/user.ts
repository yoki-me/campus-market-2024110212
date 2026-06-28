import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { getUser, createUser, updateUser } from '@/api/users'

const USER_ID_KEY = 'campus-market-user-id'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!currentUser.value)
  const userId = computed(() => currentUser.value?.id || '')

  // 从 localStorage 恢复
  function getSavedUserId(): string | null {
    return localStorage.getItem(USER_ID_KEY)
  }

  // 加载用户
  async function loadUser() {
    const savedId = getSavedUserId()
    if (!savedId) return

    loading.value = true
    try {
      const user = await getUser(savedId)
      currentUser.value = user
    } catch {
      localStorage.removeItem(USER_ID_KEY)
    } finally {
      loading.value = false
    }
  }

  // 创建本地身份
  async function register(userData: {
    nickname: string
    college: string
    campus: string
    role: string
  }): Promise<User> {
    loading.value = true
    try {
      const user = await createUser({
        ...userData,
        creditScore: 100,
        avatar: '',
      })
      currentUser.value = user
      localStorage.setItem(USER_ID_KEY, user.id)
      return user
    } finally {
      loading.value = false
    }
  }

  // 更新用户信息
  async function updateProfile(data: Partial<User>) {
    if (!currentUser.value) return
    const updated = await updateUser(currentUser.value.id, data)
    currentUser.value = updated
  }

  // 退出
  function logout() {
    currentUser.value = null
    localStorage.removeItem(USER_ID_KEY)
  }

  return {
    currentUser,
    loading,
    isLoggedIn,
    userId,
    loadUser,
    register,
    updateProfile,
    logout,
  }
})
