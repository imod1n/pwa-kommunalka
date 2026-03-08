<template>
  <div class="pb-safe">

    <!-- Шапка -->
    <header class="sticky top-0 z-10 px-4 pt-3 pb-3 flex items-center justify-between" style="background: rgba(17,17,17,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border)">
      <div class="flex items-center gap-3">
        <span class="text-2xl">🏠</span>
        <div>
          <h1 class="text-base font-bold text-white leading-tight">Сводная доска расходов</h1>
          <!-- <p class="text-xs" style="color: var(--text-secondary)">семейный учёт</p> -->
        </div>
      </div>

      <!-- Переключатель месяца -->
      <div class="flex items-center gap-1 rounded-2xl px-1 py-1" style="background: var(--bg-card); border: 1px solid var(--border)">
        <button
          @click="store.changeMonth(-1)"
          class="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style="color: var(--text-secondary)"
          onmouseover="this.style.background='var(--bg-input)'; this.style.color='#fff'"
          onmouseout="this.style.background='transparent'; this.style.color='var(--text-secondary)'"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <span class="text-sm font-semibold px-3" style="color: #fff; min-width: 110px; text-align: center; letter-spacing: -0.2px">
          {{ store.currentPeriodLabel }}
        </span>

        <button
          @click="store.changeMonth(1)"
          class="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style="color: var(--text-secondary)"
          onmouseover="this.style.background='var(--bg-input)'; this.style.color='#fff'"
          onmouseout="this.style.background='transparent'; this.style.color='var(--text-secondary)'"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Контент -->
    <main class="px-4 pt-4 space-y-4 pb-8">

      <!-- ГЕРОЙ: итоговая сумма -->
      <div class="card fade-in text-center py-6">
        <div class="text-xs font-medium uppercase tracking-widest mb-2" style="color: var(--text-secondary)">
          ИТОГО {{ store.currentPeriodLabel.toUpperCase() }}
        </div>

        <div v-if="store.loading" class="flex items-center justify-center gap-2 py-4">
          <div class="w-6 h-6 border-2 rounded-full animate-spin" style="border-color: var(--accent-green); border-top-color: transparent"></div>
        </div>

        <div v-else>
          <div class="text-5xl font-black tracking-tight mb-2" style="color: var(--accent-green); font-variant-numeric: tabular-nums">
            {{ formatRub(store.stats?.total ?? 0) }}
          </div>
        </div>
      </div>

      <!-- Вкладки -->
      <div class="flex rounded-ios-sm overflow-hidden" style="background: var(--bg-card); border: 1px solid var(--border)">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="flex-1 py-2.5 text-sm font-semibold transition-all"
          :style="activeTab === tab.key
            ? 'background: var(--bg-input); color: #fff'
            : 'color: var(--text-secondary)'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Вкладка: Обзор -->
      <template v-if="activeTab === 'overview'">
        <StatsTable />
        <MonthlyChart :history="store.history" />
      </template>

      <!-- Вкладка: Добавить -->
      <template v-if="activeTab === 'add'">
        <PaymentForm @added="onPaymentAdded" />
      </template>

      <!-- Ошибка -->
      <div v-if="store.error" class="card text-center" style="background: rgba(255,69,58,0.1); border-color: var(--accent-red)">
        <p class="text-sm" style="color: var(--accent-red)">{{ store.error }}</p>
        <button @click="store.fetchStats()" class="mt-2 text-xs underline" style="color: var(--accent-blue)">Повторить</button>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePaymentsStore } from '../stores/payments'
import PaymentForm from '../components/PaymentForm.vue'
import StatsTable from '../components/StatsTable.vue'
import MonthlyChart from '../components/MonthlyChart.vue'

const store = usePaymentsStore()
const activeTab = ref('overview')

const tabs = [
  { key: 'overview', label: '📊 Обзор доски' },
  { key: 'add',      label: '➕ Добавить платеж' },
]

function formatRub(n) {
  return Number(n).toLocaleString('ru-RU') + ' ₽'
}

function onPaymentAdded() {
  activeTab.value = 'overview'
}

onMounted(() => store.init())
</script>

<style>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
