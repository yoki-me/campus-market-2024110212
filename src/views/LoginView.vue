<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const nickname = ref('')
const college = ref('')
const campus = ref('狮子山校区')
const role = ref('学生')
const loading = ref(false)
const err = ref('')

const colleges = ['计算机学院','电子信息学院','经济管理学院','外国语学院','理学院','机械工程学院','人文学院','医学院','马克思主义学院']

onMounted(async () => { await userStore.loadUser(); if (userStore.isLoggedIn) router.push('/') })

async function submit() {
  if (!nickname.value.trim()) { err.value = '请输入昵称'; return }
  if (!college.value) { err.value = '请选择学院'; return }
  loading.value = true; err.value = ''
  try { await userStore.register({ nickname: nickname.value.trim(), college: college.value, campus: campus.value, role: role.value }); router.push('/') }
  catch { err.value = '创建失败，请检查网络连接' }
  finally { loading.value = false }
}
</script>

<template>
  <div class="login">
    <div class="split-left">
      <div class="left-bg" style="background-image:url(https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1000&q=85)"></div>
      <div class="left-ov"></div>
      <div class="left-content">
        <div class="lc-tag">CAMPUS MARKET</div>
        <h1>校园轻集市</h1>
        <p class="lc-p">四川师范大学 · 校园生活一站式平台</p>
        <div class="lc-feats">
          <div class="lc-feat"><span class="lc-fn">二手交易</span><span class="lc-fs">闲置流转，物尽其用</span></div>
          <div class="lc-feat"><span class="lc-fn">失物招领</span><span class="lc-fs">遗失拾获，互帮互助</span></div>
          <div class="lc-feat"><span class="lc-fn">拼单搭子</span><span class="lc-fs">找人一起，不再孤单</span></div>
          <div class="lc-feat"><span class="lc-fn">跑腿委托</span><span class="lc-fs">代取代办，校园互助</span></div>
        </div>
      </div>
    </div>
    <div class="split-right">
      <div class="form-wrap">
        <div class="form-head">
          <h2>创建校园身份</h2>
          <p>无需真实账户，填写信息即可体验完整功能</p>
        </div>
        <form @submit.prevent="submit">
          <div class="fg">
            <label class="lbl">昵称 <span class="req">*</span></label>
            <input v-model="nickname" class="input" placeholder="给自己起个名字" maxlength="20" />
          </div>
          <div class="fg">
            <label class="lbl">学院 <span class="req">*</span></label>
            <select v-model="college" class="input">
              <option value="" disabled>请选择学院</option>
              <option v-for="c in colleges" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="fg-row">
            <div class="fg">
              <label class="lbl">校区</label>
              <select v-model="campus" class="input">
                <option>狮子山校区</option><option>成龙校区</option><option>遂宁校区</option>
              </select>
            </div>
            <div class="fg">
              <label class="lbl">角色</label>
              <select v-model="role" class="input">
                <option>学生</option><option>研究生</option><option>教职工</option>
              </select>
            </div>
          </div>
          <p v-if="err" class="err">{{ err }}</p>
          <button type="submit" class="btn btn--primary btn--lg" style="width:100%;margin-top:8px" :disabled="loading">
            {{ loading ? '创建中...' : '开始使用' }}
            <el-icon v-if="!loading" :size="14"><ArrowRight /></el-icon>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login { display: flex; min-height: 100vh; }
.split-left { flex: 1; position: relative; min-width: 0; display: flex; align-items: center; justify-content: center; }
.left-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
.left-ov { position: absolute; inset: 0; background: linear-gradient(160deg, rgba(28,28,28,.88) 0%, rgba(28,28,28,.72) 100%); }
.left-content { position: relative; z-index: 2; padding: var(--s-10); color: #fff; max-width: 460px; }
.lc-tag { font-size: 10px; letter-spacing: 3px; opacity: .5; margin-bottom: var(--s-4); font-weight: 600; }
.left-content h1 { font-size: var(--fs-3xl); font-weight: 700; margin: 0 0 var(--s-3); letter-spacing: -.04em; }
.lc-p { font-size: var(--fs-base); opacity: .65; margin: 0 0 var(--s-10); }
.lc-feats { display: flex; flex-direction: column; gap: var(--s-3); }
.lc-feat { display: flex; gap: var(--s-4); font-size: var(--fs-sm); }
.lc-fn { width: 70px; font-weight: 600; opacity: .9; }
.lc-fs { opacity: .5; }
.split-right { width: 460px; display: flex; align-items: center; justify-content: center; padding: var(--s-10); background: var(--c-surface); flex-shrink: 0; }
.form-wrap { width: 100%; max-width: 360px; }
.form-head { margin-bottom: var(--s-8); }
.form-head h2 { font-size: var(--fs-xl); font-weight: 700; margin: 0 0 var(--s-1); letter-spacing: -.03em; }
.form-head p { font-size: var(--fs-sm); color: var(--c-text-3); margin: 0; }
.fg { display: flex; flex-direction: column; gap: var(--s-1); margin-bottom: var(--s-5); flex: 1; }
.fg-row { display: flex; gap: var(--s-4); }
.lbl { font-size: var(--fs-xs); font-weight: 600; color: var(--c-text-2); text-transform: uppercase; letter-spacing: .04em; }
.req { color: var(--c-red); }
.err { color: var(--c-red); font-size: var(--fs-sm); margin: 0 0 var(--s-3); }

@media (max-width: 768px) {
  .split-left { display: none; }
  .split-right { width: 100%; padding: var(--s-6); }
}
</style>
