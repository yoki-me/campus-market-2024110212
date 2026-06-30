<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { ItemType } from '@/types'
import { createTrade } from '@/api/trade'
import { createLostFound } from '@/api/lostFound'
import { createGroupBuy } from '@/api/groupBuy'
import { createErrand } from '@/api/errand'
import { InfoFilled } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// ==================== 类型选择 ====================
const sel = ref<ItemType>('trades')

const types: { key: ItemType; label: string }[] = [
  { key: 'trades', label: '二手交易' },
  { key: 'lostFounds', label: '失物招领' },
  { key: 'groupBuys', label: '拼单搭子' },
  { key: 'errands', label: '跑腿委托' },
]

/** 发布成功后跳转到对应列表页 */
const typeRoutes: Record<ItemType, string> = {
  trades: '/trades',
  lostFounds: '/lostfounds',
  groupBuys: '/groupbuys',
  errands: '/errands',
}

// ==================== 通用字段 ====================
const title = ref('')
const desc = ref('')
const campus = ref('狮子山校区')
const location = ref('')
const tagsInput = ref('')

// ==================== 二手交易字段 ====================
const price = ref<number | undefined>()
const originalPrice = ref<number | undefined>()
const condition = ref('9成新')
const allowBargain = ref(true)

// ==================== 失物招领字段 ====================
const lostOrFound = ref<'lost' | 'found'>('lost')
const eventTime = ref('')
const itemFeature = ref('')

// ==================== 拼单搭子字段 ====================
const targetCount = ref<number | undefined>()
const deadline = ref('')

// ==================== 跑腿委托字段 ====================
const reward = ref<number | undefined>()
const taskPlace = ref('')
const expectedTime = ref('')

// ==================== 状态 ====================
const loading = ref(false)
const err = ref('')

// ==================== 类型切换时重置表单 ====================
function resetForm() {
  err.value = ''
  title.value = ''
  desc.value = ''
  campus.value = '狮子山校区'
  location.value = ''
  tagsInput.value = ''
  // 二手
  price.value = undefined
  originalPrice.value = undefined
  condition.value = '9成新'
  allowBargain.value = true
  // 失物招领
  lostOrFound.value = 'lost'
  eventTime.value = ''
  itemFeature.value = ''
  // 拼单
  targetCount.value = undefined
  deadline.value = ''
  // 跑腿
  reward.value = undefined
  taskPlace.value = ''
  expectedTime.value = ''
}

watch(sel, resetForm)

// ==================== 发布须知 ====================
const tips: Record<ItemType, string[]> = {
  trades: ['如实描述商品成色和瑕疵', '建议在校园公共场所交易', '贵重物品当面验货', '保留聊天记录作为凭证'],
  lostFounds: ['详细描述物品特征', '注明丢失/拾获的时间和地点', '保护个人联系方式隐私', '物品找回后及时更新状态'],
  groupBuys: ['明确目标人数和截止时间', '注明集合地点', '截止时间后自动结束', '建议统一收费方式'],
  errands: ['详细描述任务内容和要求', '合理设定酬劳金额', '注明期望完成时间', '贵重物品当面验收'],
}

// ==================== 表单校验 ====================
function validate(): boolean {
  if (!title.value.trim()) {
    err.value = '请输入标题'
    return false
  }
  if (!desc.value.trim()) {
    err.value = '请输入描述'
    return false
  }

  // 跑腿委托用 taskPlace 代替 location
  if (sel.value !== 'errands' && !location.value.trim()) {
    err.value = '请输入地点'
    return false
  }

  if (sel.value === 'trades') {
    if (!price.value || price.value <= 0) {
      err.value = '请输入有效价格'
      return false
    }
  }

  if (sel.value === 'lostFounds') {
    if (!eventTime.value) {
      err.value = '请选择事件时间'
      return false
    }
  }

  if (sel.value === 'groupBuys') {
    if (!targetCount.value || targetCount.value < 2) {
      err.value = '目标人数至少为2'
      return false
    }
    if (!deadline.value) {
      err.value = '请选择截止时间'
      return false
    }
  }

  if (sel.value === 'errands') {
    if (!taskPlace.value.trim()) {
      err.value = '请输入任务路线'
      return false
    }
  }

  return true
}

// ==================== 提交 ====================
async function submit() {
  err.value = ''
  if (!validate()) return

  loading.value = true
  const tags = tagsInput.value.split(/[,，\s]+/).filter(Boolean)
  const pubId = userStore.userId
  const pubName = userStore.currentUser?.nickname || '匿名用户'

  try {
    if (sel.value === 'trades') {
      await createTrade({
        title: title.value.trim(),
        description: desc.value.trim(),
        price: price.value!,
        originalPrice: originalPrice.value || 0,
        condition: condition.value,
        campus: campus.value,
        location: location.value.trim(),
        tags,
        images: [],
        publisherId: pubId,
        publisherName: pubName,
        status: 'open',
        allowBargain: allowBargain.value,
        viewCount: 0,
        favoriteCount: 0,
      })
    } else if (sel.value === 'lostFounds') {
      await createLostFound({
        title: title.value.trim(),
        description: desc.value.trim(),
        type: lostOrFound.value,
        campus: campus.value,
        location: location.value.trim(),
        eventTime: eventTime.value,
        itemFeature: itemFeature.value.trim(),
        tags,
        images: [],
        publisherId: pubId,
        publisherName: pubName,
        status: 'open',
        viewCount: 0,
        favoriteCount: 0,
      })
    } else if (sel.value === 'groupBuys') {
      await createGroupBuy({
        title: title.value.trim(),
        description: desc.value.trim(),
        targetCount: targetCount.value!,
        currentCount: 1,
        campus: campus.value,
        location: location.value.trim(),
        deadline: new Date(deadline.value).toISOString(),
        tags,
        images: [],
        publisherId: pubId,
        publisherName: pubName,
        status: 'open',
        viewCount: 0,
        favoriteCount: 0,
      })
    } else {
      await createErrand({
        title: title.value.trim(),
        description: desc.value.trim(),
        reward: reward.value || 0,
        taskPlace: taskPlace.value.trim(),
        campus: campus.value,
        expectedTime: expectedTime.value,
        tags,
        images: [],
        publisherId: pubId,
        publisherName: pubName,
        status: 'open',
        viewCount: 0,
        favoriteCount: 0,
      })
    }
    // 跳转到对应列表页
    router.push(typeRoutes[sel.value])
  } catch {
    err.value = '发布失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page anim-up">
    <div class="breadcrumb"><RouterLink to="/">首页</RouterLink> / <span>发布信息</span></div>

    <div class="pub-layout">
      <div class="pub-main">
        <!-- ====== 类型选择器 ====== -->
        <div class="type-bar">
          <button
            v-for="t in types"
            :key="t.key"
            class="type-btn"
            :class="{ on: sel === t.key }"
            @click="sel = t.key"
          >
            {{ t.label }}
          </button>
        </div>

        <!-- ====== 发布表单 ====== -->
        <form class="card" style="padding:var(--s-8)" @submit.prevent="submit">
          <!-- 标题 -->
          <div class="fg">
            <label class="lbl">标题 <span class="req">*</span></label>
            <input v-model="title" class="input" placeholder="简要描述你要发布的内容" maxlength="60" />
          </div>

          <!-- 校区 / 地点 -->
          <div class="fg-row2">
            <div class="fg">
              <label class="lbl">校区</label>
              <select v-model="campus" class="input">
                <option>狮子山校区</option>
                <option>成龙校区</option>
                <option>遂宁校区</option>
              </select>
            </div>
            <!-- 跑腿委托用 taskPlace 替代 location -->
            <div class="fg" v-if="sel !== 'errands'">
              <label class="lbl">地点 <span class="req">*</span></label>
              <input v-model="location" class="input" placeholder="如图书馆、食堂" />
            </div>
          </div>

          <!-- 详细描述 -->
          <div class="fg">
            <label class="lbl">详细描述 <span class="req">*</span></label>
            <textarea
              v-model="desc"
              class="input"
              rows="5"
              placeholder="详细说明，让他人更好地了解你的需求..."
              maxlength="500"
            ></textarea>
          </div>

          <!-- 标签 -->
          <div class="fg">
            <label class="lbl">标签</label>
            <input v-model="tagsInput" class="input" placeholder="用逗号或空格分隔" />
          </div>

          <!-- ====== 二手交易专属字段 ====== -->
          <template v-if="sel === 'trades'">
            <div class="fg-row2">
              <div class="fg">
                <label class="lbl">售价 <span class="req">*</span></label>
                <div class="price-wrap">
                  <span class="px">¥</span>
                  <input
                    v-model.number="price"
                    type="number"
                    class="input"
                    style="border-radius:0 var(--r-sm) var(--r-sm) 0"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div class="fg">
                <label class="lbl">原价</label>
                <div class="price-wrap">
                  <span class="px">¥</span>
                  <input
                    v-model.number="originalPrice"
                    type="number"
                    class="input"
                    style="border-radius:0 var(--r-sm) var(--r-sm) 0"
                    placeholder="选填"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            <div class="fg-row2">
              <div class="fg">
                <label class="lbl">成色</label>
                <select v-model="condition" class="input">
                  <option>全新</option>
                  <option>几乎全新</option>
                  <option>9成新</option>
                  <option>8成新</option>
                  <option>7成新</option>
                </select>
              </div>
              <div class="fg" style="justify-content:flex-end">
                <label class="check-lbl">
                  <input v-model="allowBargain" type="checkbox" /> 允许砍价
                </label>
              </div>
            </div>
          </template>

          <!-- ====== 失物招领专属字段 ====== -->
          <template v-if="sel === 'lostFounds'">
            <div class="fg-row2">
              <div class="fg">
                <label class="lbl">类型 <span class="req">*</span></label>
                <select v-model="lostOrFound" class="input">
                  <option value="lost">寻物启事</option>
                  <option value="found">失物招领</option>
                </select>
              </div>
              <div class="fg">
                <label class="lbl">事件时间 <span class="req">*</span></label>
                <input v-model="eventTime" type="date" class="input" />
              </div>
            </div>
            <div class="fg">
              <label class="lbl">物品特征</label>
              <input
                v-model="itemFeature"
                class="input"
                placeholder="如：蓝色贴纸标记、品牌型号"
              />
            </div>
          </template>

          <!-- ====== 拼单搭子专属字段 ====== -->
          <template v-if="sel === 'groupBuys'">
            <div class="fg-row2">
              <div class="fg">
                <label class="lbl">目标人数 <span class="req">*</span></label>
                <input
                  v-model.number="targetCount"
                  type="number"
                  class="input"
                  placeholder="最少2人"
                  min="2"
                />
              </div>
              <div class="fg">
                <label class="lbl">截止时间 <span class="req">*</span></label>
                <input v-model="deadline" type="datetime-local" class="input" />
              </div>
            </div>
          </template>

          <!-- ====== 跑腿委托专属字段 ====== -->
          <template v-if="sel === 'errands'">
            <div class="fg-row2">
              <div class="fg">
                <label class="lbl">酬劳</label>
                <div class="price-wrap">
                  <span class="px">¥</span>
                  <input
                    v-model.number="reward"
                    type="number"
                    class="input"
                    style="border-radius:0 var(--r-sm) var(--r-sm) 0"
                    placeholder="0.00"
                    min="0"
                  />
                </div>
              </div>
              <div class="fg">
                <label class="lbl">期望时间</label>
                <input v-model="expectedTime" type="date" class="input" />
              </div>
            </div>
            <div class="fg">
              <label class="lbl">任务路线 <span class="req">*</span></label>
              <input
                v-model="taskPlace"
                class="input"
                placeholder="如：菜鸟驿站 → 学生公寓3号楼"
              />
            </div>
          </template>

          <!-- 错误提示 -->
          <p v-if="err" style="color:var(--c-red);font-size:var(--fs-sm);margin:var(--s-3) 0 0">
            {{ err }}
          </p>

          <!-- 提交按钮 -->
          <button
            type="submit"
            class="btn btn--primary btn--lg"
            style="width:100%;margin-top:var(--s-6)"
            :disabled="loading"
          >
            {{ loading ? '发布中...' : '发布信息' }}
          </button>
        </form>
      </div>

      <!-- ====== 侧边栏 ====== -->
      <aside class="pub-side">
        <div class="card" style="padding:var(--s-5)">
          <h4 style="font-size:var(--fs-sm);font-weight:600;margin:0 0 var(--s-3);display:flex;align-items:center;gap:var(--s-1)">
            <el-icon :size="14"><InfoFilled /></el-icon> 发布须知
          </h4>
          <ul class="tip-list">
            <li v-for="(t, i) in tips[sel]" :key="i">{{ t }}</li>
          </ul>
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
.pub-layout {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: var(--s-6);
  align-items: start;
}
.pub-main {
  min-width: 0;
}
.pub-side {
  position: sticky;
  top: 68px;
  display: flex;
  flex-direction: column;
}

.type-bar {
  display: flex;
  gap: var(--s-2);
  margin-bottom: var(--s-5);
}
.type-btn {
  flex: 1;
  padding: 10px 0;
  border: 1px solid var(--c-border);
  border-radius: var(--r-sm);
  background: var(--c-surface);
  font-family: var(--font);
  font-size: var(--fs-sm);
  color: var(--c-text-2);
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
  font-weight: 500;
}
.type-btn:hover {
  border-color: var(--c-text-3);
}
.type-btn.on {
  background: var(--c-accent);
  color: #fff;
  border-color: var(--c-accent);
}

.fg {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
  margin-bottom: var(--s-5);
  flex: 1;
}
.fg-row2 {
  display: flex;
  gap: var(--s-4);
}
.lbl {
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.req {
  color: var(--c-red);
}

.price-wrap {
  display: flex;
}
.px {
  padding: 9px 14px;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-right: none;
  border-radius: var(--r-sm) 0 0 var(--r-sm);
  font-size: var(--fs-sm);
  color: var(--c-text-2);
}

.check-lbl {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  font-size: var(--fs-sm);
  cursor: pointer;
  margin-bottom: var(--s-5);
}

.tip-list {
  margin: 0;
  padding: 0 0 0 18px;
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  font-size: var(--fs-xs);
  color: var(--c-text-2);
  line-height: 1.6;
}

@media (max-width: 900px) {
  .pub-layout {
    grid-template-columns: 1fr;
  }
  .pub-side {
    position: static;
  }
}
</style>
