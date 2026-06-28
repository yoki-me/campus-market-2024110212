<script setup lang="ts">
import { ref } from 'vue'
import type { ItemType, ItemStatus, ItemFilters } from '@/types'
import { ItemTypeLabels, ItemStatusLabels } from '@/types'

const emit = defineEmits<{
  search: [filters: Partial<ItemFilters>]
}>()

const keyword = ref('')
const selectedType = ref<ItemType | ''>('')
const selectedCampus = ref('')
const selectedStatus = ref<ItemStatus | ''>('')
const sortBy = ref<'createdAt' | 'viewCount' | 'price'>('createdAt')

const types = Object.entries(ItemTypeLabels) as [ItemType, string][]
const statuses = Object.entries(ItemStatusLabels) as [ItemStatus, string][]
const campuses = ['主校区', '东校区', '西校区']

function emitSearch() {
  emit('search', {
    keyword: keyword.value,
    type: selectedType.value,
    campus: selectedCampus.value,
    status: selectedStatus.value,
    sortBy: sortBy.value,
    sortOrder: 'desc',
  })
}

function clearFilters() {
  keyword.value = ''
  selectedType.value = ''
  selectedCampus.value = ''
  selectedStatus.value = ''
  sortBy.value = 'createdAt'
  emitSearch()
}
</script>

<template>
  <div class="search-filter">
    <div class="search-row">
      <input
        v-model="keyword"
        type="text"
        placeholder="🔍 搜索关键词..."
        class="search-input"
        @input="emitSearch"
      />
    </div>
    <div class="filter-row">
      <select v-model="selectedType" class="filter-select" @change="emitSearch">
        <option value="">📂 全部类型</option>
        <option v-for="[key, label] in types" :key="key" :value="key">
          {{ label }}
        </option>
      </select>
      <select v-model="selectedCampus" class="filter-select" @change="emitSearch">
        <option value="">📍 全部校区</option>
        <option v-for="c in campuses" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="selectedStatus" class="filter-select" @change="emitSearch">
        <option value="">📌 全部状态</option>
        <option v-for="[key, label] in statuses" :key="key" :value="key">
          {{ label }}
        </option>
      </select>
      <select v-model="sortBy" class="filter-select sort-select" @change="emitSearch">
        <option value="createdAt">🕐 最新</option>
        <option value="viewCount">🔥 最热</option>
        <option value="price">💰 价格</option>
      </select>
      <button class="clear-btn" @click="clearFilters">重置</button>
    </div>
  </div>
</template>

<style scoped>
.search-filter {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-row {
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  background: #fff;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-select {
  flex: 1;
  min-width: 80px;
  padding: 8px 6px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 12px;
  background: #fff;
  cursor: pointer;
  color: #333;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.sort-select {
  max-width: 70px;
}

.clear-btn {
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  color: #666;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #e8e8e8;
}
</style>
