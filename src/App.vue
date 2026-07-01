<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMessagesStore } from '@/stores/messages'
import {
  ChatDotRound, User, ArrowLeft,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const messagesStore = useMessagesStore()

const isAuthPage = computed(() => route.path === '/login')
const isChatPage = computed(() => route.path.startsWith('/chat'))

onMounted(async () => {
  await userStore.loadUser()
  if (userStore.isLoggedIn) {
    await messagesStore.fetchConversations()
  }
})

const navLinks = [
  { path: '/', label: '首页' },
  { path: '/list', label: '浏览' },
  { path: '/publish', label: '发布' },
  { path: '/board', label: '看板' },
]
</script>

<template>
  <div class="app-shell">
    <header v-if="!isAuthPage && !isChatPage" class="topbar">
      <div class="topbar-inner">
        <RouterLink to="/" class="logo">
          <span class="logo-mark">C</span>
          <span class="logo-text">校园轻集市</span>
        </RouterLink>

        <nav class="nav-center">
          <a
            v-for="link in navLinks"
            :key="link.path"
            :href="link.path"
            class="nav-link"
            :class="{ active: link.path === '/' ? route.path === '/' : route.path.startsWith(link.path) }"
            @click.prevent="router.push(link.path)"
          >
            {{ link.label }}
          </a>
        </nav>

        <div class="nav-right">
          <RouterLink to="/message" class="icon-btn" title="消息">
            <el-icon :size="18"><ChatDotRound /></el-icon>
            <span v-if="messagesStore.totalUnreadCount" class="badge">
              {{ messagesStore.totalUnreadCount > 99 ? '99+' : messagesStore.totalUnreadCount }}
            </span>
          </RouterLink>
          <RouterLink to="/profile" class="user-chip">
            <el-icon :size="16"><User /></el-icon>
            <span>{{ userStore.currentUser?.nickname || '用户' }}</span>
          </RouterLink>
        </div>
      </div>
    </header>

    <header v-else-if="isChatPage" class="topbar chat-topbar">
      <div class="topbar-inner">
        <button class="back-link" @click="router.push('/message')">
          <el-icon :size="16"><ArrowLeft /></el-icon>
          <span>返回</span>
        </button>
        <span class="chat-topbar-title">对话详情</span>
      </div>
    </header>

    <main :class="['main', { 'main--full': isAuthPage, 'main--chat': isChatPage }]">
      <RouterView :key="route.path" />
    </main>
  </div>
</template>

<style>
/* ========================================
   DESIGN SYSTEM — Swiss Minimalist
   ======================================== */

:root {
  /* Palette */
  --c-bg:        #f8f7f4;
  --c-surface:   #ffffff;
  --c-text:      #1c1c1c;
  --c-text-2:    #5c5c5c;
  --c-text-3:    #8c8c8c;
  --c-border:    #e8e6e1;
  --c-border-2:  #f0eee9;
  --c-accent:    #1c1c1c;
  --c-accent-h:  #3d3d3d;
  /* Functional — used sparingly */
  --c-green:     #2d5a27;
  --c-amber:     #8b6914;
  --c-red:       #8b2117;

  /* Spacing (4px grid) */
  --s-1:   4px;
  --s-2:   8px;
  --s-3:  12px;
  --s-4:  16px;
  --s-5:  20px;
  --s-6:  24px;
  --s-8:  32px;
  --s-10: 40px;
  --s-12: 48px;
  --s-16: 64px;

  /* Type */
  --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
           'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
  --fs-xs: 11px;
  --fs-sm: 12px;
  --fs-base: 14px;
  --fs-md: 16px;
  --fs-lg: 20px;
  --fs-xl: 24px;
  --fs-2xl: 32px;
  --fs-3xl: 40px;

  /* Radii */
  --r-sm: 6px;
  --r-md: 10px;
  --r-lg: 14px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0,0,0,.04);
  --shadow-sm: 0 1px 3px rgba(0,0,0,.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,.05);
  --shadow-lg: 0 8px 30px rgba(0,0,0,.06);
}

*,
*::before,
*::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  font-family: var(--font);
  font-size: var(--fs-base);
  color: var(--c-text);
  background: var(--c-bg);
  line-height: 1.6;
  letter-spacing: -.01em;
}

/* ============ Topbar ============ */
.topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--c-border);
  height: 52px;
}
.topbar-inner {
  max-width: 1200px; margin: 0 auto; padding: 0 var(--s-6);
  height: 100%; display: flex; align-items: center; gap: var(--s-8);
}
.chat-topbar { height: 48px; }
.chat-topbar .topbar-inner { gap: var(--s-4); }

.logo {
  display: flex; align-items: center; gap: var(--s-2); text-decoration: none; flex-shrink: 0;
}
.logo-mark {
  width: 28px; height: 28px; background: var(--c-accent); color: #fff;
  border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; letter-spacing: 0;
}
.logo-text { font-size: var(--fs-md); font-weight: 600; color: var(--c-text); letter-spacing: -.02em; }

.nav-center { display: flex; gap: 2px; flex: 1; justify-content: center; }
.nav-link {
  padding: 6px 16px; border-radius: var(--r-sm); text-decoration: none;
  font-size: var(--fs-sm); font-weight: 500; color: var(--c-text-2);
  transition: all .15s ease; letter-spacing: -.01em;
}
.nav-link:hover { background: var(--c-border-2); color: var(--c-text); }
.nav-link.active { background: var(--c-accent); color: #fff; }

.nav-right { display: flex; align-items: center; gap: var(--s-3); flex-shrink: 0; }

.icon-btn {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: var(--r-sm); color: var(--c-text-2);
  text-decoration: none; transition: all .15s ease;
}
.icon-btn:hover { background: var(--c-border-2); color: var(--c-text); }
.icon-btn .el-icon { display: flex; }

.badge {
  position: absolute; top: 0; right: -2px;
  min-width: 16px; height: 16px; padding: 0 4px;
  background: var(--c-red); color: #fff; border-radius: 8px;
  font-size: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center;
  letter-spacing: 0;
}

.user-chip {
  display: flex; align-items: center; gap: 6px; padding: 5px 12px;
  border-radius: var(--r-md); text-decoration: none; font-size: var(--fs-sm);
  color: var(--c-text-2); transition: all .15s ease; font-weight: 500;
}
.user-chip:hover { background: var(--c-border-2); color: var(--c-text); }
.user-chip .el-icon { display: flex; }

.back-link {
  display: flex; align-items: center; gap: 4px; padding: 4px 8px;
  border: none; background: none; border-radius: var(--r-sm);
  font-size: var(--fs-sm); color: var(--c-text-2); cursor: pointer;
  font-family: var(--font); transition: all .15s ease;
}
.back-link:hover { background: var(--c-border-2); color: var(--c-text); }
.back-link .el-icon { display: flex; }
.chat-topbar-title { font-weight: 600; font-size: var(--fs-base); color: var(--c-text); }

/* ============ Main ============ */
.main { min-height: calc(100vh - 52px); }
.main--full { min-height: 100vh; }
.main--chat { min-height: calc(100vh - 48px); display: flex; flex-direction: column; }

/* ============ Scrollbar ============ */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: #b8b4b0; }

/* ============ Selection ============ */
::selection { background: rgba(28,28,28,.1); }

/* ============ Shared utilities ============ */
.page { max-width: 1200px; margin: 0 auto; padding: var(--s-8) var(--s-6); }
.page-header { margin-bottom: var(--s-8); }
.page-title { font-size: var(--fs-xl); font-weight: 700; letter-spacing: -.03em; margin: 0; }
.page-sub { font-size: var(--fs-sm); color: var(--c-text-3); margin: var(--s-1) 0 0; }

/* Breadcrumb */
.breadcrumb { font-size: var(--fs-sm); color: var(--c-text-3); margin-bottom: var(--s-6); }
.breadcrumb a { color: var(--c-text-3); text-decoration: none; }
.breadcrumb a:hover { color: var(--c-text); }
.breadcrumb span { color: var(--c-text-2); }

/* Cards */
.card {
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-lg); overflow: hidden;
}

/* Spinner */
.spinner {
  width: 20px; height: 20px; border: 2px solid var(--c-border);
  border-top-color: var(--c-text-3); border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.loading-box {
  display: flex; flex-direction: column; align-items: center; gap: var(--s-3);
  padding: var(--s-16) var(--s-6); color: var(--c-text-3); font-size: var(--fs-sm);
}

.empty-box {
  display: flex; flex-direction: column; align-items: center; gap: var(--s-2);
  padding: var(--s-16) var(--s-6); color: var(--c-text-3); font-size: var(--fs-sm);
}

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--s-2);
  padding: 10px 20px; border: none; border-radius: var(--r-sm);
  font-family: var(--font); font-size: var(--fs-sm); font-weight: 600;
  cursor: pointer; transition: all .15s ease; letter-spacing: -.01em;
  text-decoration: none; line-height: 1;
}
.btn--primary { background: var(--c-accent); color: #fff; }
.btn--primary:hover { background: var(--c-accent-h); }
.btn--ghost { background: var(--c-surface); color: var(--c-text); border: 1px solid var(--c-border); }
.btn--ghost:hover { background: var(--c-bg); border-color: var(--c-text-3); }
.btn--danger { background: var(--c-surface); color: var(--c-red); border: 1px solid #e8d8d6; }
.btn--danger:hover { background: #f8f6f6; }
.btn--sm { padding: 5px 12px; font-size: var(--fs-xs); }
.btn--lg { padding: 13px 28px; font-size: var(--fs-base); }

.btn:disabled { opacity: .4; cursor: not-allowed; }

/* Input / Select / Textarea */
.input {
  width: 100%; padding: 9px 12px; border: 1px solid var(--c-border);
  border-radius: var(--r-sm); font-family: var(--font); font-size: var(--fs-sm);
  color: var(--c-text); background: var(--c-surface); transition: all .15s ease;
  letter-spacing: -.01em;
}
.input:focus { outline: none; border-color: var(--c-text-3); box-shadow: 0 0 0 3px rgba(0,0,0,.04); }
.input::placeholder { color: var(--c-text-3); }
select.input { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' fill='none' stroke='%238c8c8c' stroke-width='1.5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px; }

textarea.input { resize: vertical; min-height: 100px; }

/* Tags & Badges */
.tag {
  display: inline-flex; align-items: center; padding: 2px 10px;
  border-radius: 999px; font-size: var(--fs-xs); font-weight: 500;
  letter-spacing: -.01em; white-space: nowrap;
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.anim-up { animation: fadeUp .35s ease both; }

/* ============ Responsive ============ */
@media (max-width: 768px) {
  :root {
    --fs-3xl: 28px; --fs-2xl: 24px; --fs-xl: 20px; --fs-lg: 18px;
  }
  .topbar-inner { padding: 0 var(--s-4); }
  .nav-center { gap: 0; }
  .nav-link { padding: 6px 10px; font-size: var(--fs-xs); }
  .logo-text { display: none; }
  .user-chip span { display: none; }
  .page { padding: var(--s-5) var(--s-4); }
}
</style>
