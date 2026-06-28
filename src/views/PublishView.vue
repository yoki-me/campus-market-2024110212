<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { useUserStore } from '@/stores/user'
import type { ItemType } from '@/types'
import { Upload, InfoFilled } from '@element-plus/icons-vue'

const router = useRouter()
const itemsStore = useItemsStore()
const userStore = useUserStore()

const sel = ref<ItemType>('secondhand')
const title = ref('')
const desc = ref('')
const campus = ref('狮子山校区')
const location = ref('')
const tagsInput = ref('')
const price = ref<number | undefined>()
const condition = ref('9成新')
const allowBargain = ref(true)
const lostOrFound = ref<'lost'|'found'>('lost')
const eventTime = ref('')
const itemFeature = ref('')
const targetCount = ref<number | undefined>()
const deadline = ref('')
const reward = ref<number | undefined>()
const taskPlace = ref('')
const expectedTime = ref('')
const loading = ref(false)
const err = ref('')

const types: { key: ItemType; label: string }[] = [
  { key: 'secondhand', label: '二手交易' },
  { key: 'lostfound', label: '失物招领' },
  { key: 'groupbuy', label: '拼单搭子' },
  { key: 'errand', label: '跑腿委托' },
]

const tips: Record<ItemType, string[]> = {
  secondhand: ['如实描述商品成色和瑕疵','建议在校园公共场所交易','贵重物品当面验货','保留聊天记录作为凭证'],
  lostfound: ['详细描述物品特征','注明丢失/拾获的时间和地点','保护个人联系方式隐私','物品找回后及时更新状态'],
  groupbuy: ['明确目标人数和截止时间','注明集合地点','截止时间后自动结束','建议统一收费方式'],
  errand: ['详细描述任务内容和要求','合理设定酬劳金额','注明期望完成时间','贵重物品当面验收'],
}

async function submit() {
  err.value = ''
  if (!title.value.trim()) { err.value = '请输入标题'; return }
  if (!desc.value.trim()) { err.value = '请输入描述'; return }
  if (!location.value.trim()) { err.value = '请输入地点'; return }
  if (sel.value === 'secondhand' && (!price.value || price.value <= 0)) { err.value = '请输入有效价格'; return }
  if (sel.value === 'lostfound' && !eventTime.value) { err.value = '请选择事件时间'; return }
  if (sel.value === 'groupbuy') { if (!targetCount.value || targetCount.value < 2) { err.value = '目标人数至少为2'; return }; if (!deadline.value) { err.value = '请选择截止时间'; return } }
  loading.value = true
  const tags = tagsInput.value.split(/[,，\s]+/).filter(Boolean)
  try {
    const base = { type: sel.value, title: title.value.trim(), description: desc.value.trim(), campus: campus.value, location: location.value.trim(), tags, images: [], publisherId: userStore.userId, publisherName: userStore.currentUser?.nickname || '匿名用户', status: 'active' as const, viewCount: 0, favoriteCount: 0 }
    if (sel.value === 'secondhand') await itemsStore.publish({ ...base, price: price.value, condition: condition.value, allowBargain: allowBargain.value })
    else if (sel.value === 'lostfound') await itemsStore.publish({ ...base, lostOrFound: lostOrFound.value, eventTime: eventTime.value, itemFeature: itemFeature.value || undefined })
    else if (sel.value === 'groupbuy') await itemsStore.publish({ ...base, targetCount: targetCount.value, currentCount: 1, deadline: new Date(deadline.value).toISOString() })
    else await itemsStore.publish({ ...base, reward: reward.value, taskPlace: taskPlace.value || undefined, expectedTime: expectedTime.value || undefined })
    router.push('/list')
  } catch { err.value = '发布失败，请重试' }
  finally { loading.value = false }
}
</script>

<template>
  <div class="page anim-up">
    <div class="breadcrumb"><RouterLink to="/">首页</RouterLink> / <span>发布信息</span></div>

    <div class="pub-layout">
      <div class="pub-main">
        <!-- Type selector -->
        <div class="type-bar">
          <button v-for="t in types" :key="t.key" class="type-btn" :class="{ on: sel === t.key }" @click="sel = t.key">{{ t.label }}</button>
        </div>

        <form class="card" style="padding:var(--s-8)" @submit.prevent="submit">
          <div class="fg">
            <label class="lbl">标题 <span class="req">*</span></label>
            <input v-model="title" class="input" placeholder="简要描述你要发布的内容" maxlength="60" />
          </div>
          <div class="fg-row2">
            <div class="fg"><label class="lbl">校区</label><select v-model="campus" class="input"><option>狮子山校区</option><option>成龙校区</option><option>遂宁校区</option></select></div>
            <div class="fg"><label class="lbl">地点 <span class="req">*</span></label><input v-model="location" class="input" placeholder="如图书馆、食堂" /></div>
          </div>
          <div class="fg">
            <label class="lbl">详细描述 <span class="req">*</span></label>
            <textarea v-model="desc" class="input" rows="5" placeholder="详细说明，让他人更好地了解你的需求..." maxlength="500"></textarea>
          </div>
          <div class="fg"><label class="lbl">标签</label><input v-model="tagsInput" class="input" placeholder="用逗号或空格分隔" /></div>

          <!-- Upload placeholder -->
          <div class="fg"><label class="lbl">图片</label><div class="upload-box"><el-icon :size="20"><Upload /></el-icon><span>点击或拖拽上传图片</span><span style="font-size:var(--fs-xs);color:var(--c-text-3)">支持 JPG、PNG，单张不超过 5MB</span></div></div>

          <!-- Type-specific -->
          <template v-if="sel === 'secondhand'">
            <div class="fg-row2">
              <div class="fg"><label class="lbl">价格 <span class="req">*</span></label><div class="price-wrap"><span class="px">¥</span><input v-model.number="price" type="number" class="input" style="border-radius:0 var(--r-sm) var(--r-sm) 0" placeholder="0.00" min="0" step="0.01" /></div></div>
              <div class="fg"><label class="lbl">成色</label><select v-model="condition" class="input"><option>全新</option><option>几乎全新</option><option>9成新</option><option>8成新</option><option>7成新</option></select></div>
            </div>
            <label class="check-lbl"><input v-model="allowBargain" type="checkbox" /> 允许砍价</label>
          </template>
          <template v-if="sel === 'lostfound'">
            <div class="fg-row2">
              <div class="fg"><label class="lbl">类型 <span class="req">*</span></label><select v-model="lostOrFound" class="input"><option value="lost">寻物启事</option><option value="found">失物招领</option></select></div>
              <div class="fg"><label class="lbl">事件时间 <span class="req">*</span></label><input v-model="eventTime" type="date" class="input" /></div>
            </div>
            <div class="fg"><label class="lbl">物品特征</label><input v-model="itemFeature" class="input" placeholder="如：蓝色贴纸标记、品牌型号" /></div>
          </template>
          <template v-if="sel === 'groupbuy'">
            <div class="fg-row2">
              <div class="fg"><label class="lbl">目标人数 <span class="req">*</span></label><input v-model.number="targetCount" type="number" class="input" placeholder="最少2人" min="2" /></div>
              <div class="fg"><label class="lbl">截止时间 <span class="req">*</span></label><input v-model="deadline" type="datetime-local" class="input" /></div>
            </div>
          </template>
          <template v-if="sel === 'errand'">
            <div class="fg-row2">
              <div class="fg"><label class="lbl">酬劳</label><div class="price-wrap"><span class="px">¥</span><input v-model.number="reward" type="number" class="input" style="border-radius:0 var(--r-sm) var(--r-sm) 0" placeholder="0.00" min="0" /></div></div>
              <div class="fg"><label class="lbl">期望时间</label><input v-model="expectedTime" type="date" class="input" /></div>
            </div>
            <div class="fg"><label class="lbl">任务路线</label><input v-model="taskPlace" class="input" placeholder="如：菜鸟驿站 → 学生公寓3号楼" /></div>
          </template>

          <p v-if="err" style="color:var(--c-red);font-size:var(--fs-sm);margin:var(--s-3) 0 0">{{ err }}</p>
          <button type="submit" class="btn btn--primary btn--lg" style="width:100%;margin-top:var(--s-6)" :disabled="loading">{{ loading ? '发布中...' : '发布信息' }}</button>
        </form>
      </div>

      <!-- Sidebar tips -->
      <aside class="pub-side">
        <div class="card" style="padding:var(--s-5)">
          <h4 style="font-size:var(--fs-sm);font-weight:600;margin:0 0 var(--s-3);display:flex;align-items:center;gap:var(--s-1)"><el-icon :size="14"><InfoFilled /></el-icon> 发布须知</h4>
          <ul class="tip-list"><li v-for="(t,i) in tips[sel]" :key="i">{{ t }}</li></ul>
        </div>
        <div class="card" style="padding:var(--s-5);margin-top:var(--s-4)">
          <h4 style="font-size:var(--fs-sm);font-weight:600;margin:0 0 var(--s-3)">安全提醒</h4>
          <ul class="tip-list">
            <li>请选择校园公共场所进行交易</li>
            <li>贵重物品注意验真后再付款</li>
            <li>保护个人联系方式隐私</li>
            <li>警惕异常低价和提前转账要求</li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.pub-layout { display: grid; grid-template-columns: 1fr 260px; gap: var(--s-6); align-items: start; }
.pub-main { min-width: 0; }
.pub-side { position: sticky; top: 68px; display: flex; flex-direction: column; }

.type-bar { display: flex; gap: var(--s-2); margin-bottom: var(--s-5); }
.type-btn {
  flex: 1; padding: 10px 0; border: 1px solid var(--c-border); border-radius: var(--r-sm);
  background: var(--c-surface); font-family: var(--font); font-size: var(--fs-sm);
  color: var(--c-text-2); cursor: pointer; transition: all .15s; text-align: center; font-weight: 500;
}
.type-btn:hover { border-color: var(--c-text-3); }
.type-btn.on { background: var(--c-accent); color: #fff; border-color: var(--c-accent); }

.fg { display: flex; flex-direction: column; gap: var(--s-1); margin-bottom: var(--s-5); flex: 1; }
.fg-row2 { display: flex; gap: var(--s-4); }
.lbl { font-size: var(--fs-xs); font-weight: 600; color: var(--c-text-2); text-transform: uppercase; letter-spacing: .04em; }
.req { color: var(--c-red); }

.price-wrap { display: flex; }
.px { padding: 9px 14px; background: var(--c-bg); border: 1px solid var(--c-border); border-right: none; border-radius: var(--r-sm) 0 0 var(--r-sm); font-size: var(--fs-sm); color: var(--c-text-2); }

.upload-box {
  display: flex; flex-direction: column; align-items: center; gap: var(--s-2); padding: var(--s-8);
  border: 2px dashed var(--c-border); border-radius: var(--r-md); cursor: pointer;
  transition: all .15s; background: var(--c-bg); font-size: var(--fs-sm); color: var(--c-text-2);
}
.upload-box:hover { border-color: var(--c-text-3); }

.check-lbl { display: flex; align-items: center; gap: var(--s-2); font-size: var(--fs-sm); cursor: pointer; margin-bottom: var(--s-5); }

.tip-list { margin: 0; padding: 0 0 0 18px; display: flex; flex-direction: column; gap: var(--s-2); font-size: var(--fs-xs); color: var(--c-text-2); line-height: 1.6; }

@media (max-width: 900px) { .pub-layout { grid-template-columns: 1fr; } .pub-side { position: static; } }
</style>
