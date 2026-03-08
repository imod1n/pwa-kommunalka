<template>
  <div class="stats-table">

    <!-- Toggle -->
    <div class="view-toggle">
      <button :class="{ active: view === 'categories' }" @click="view = 'categories'">
        По категориям
      </button>
      <button :class="{ active: view === 'objects' }" @click="view = 'objects'">
        По объектам
      </button>
    </div>

    <!-- ── BY CATEGORIES ── -->
    <template v-if="view === 'categories'">
      <div v-if="catRows.length === 0" class="empty">Нет платежей за этот период</div>
      <div v-else class="cat-list">
        <div
          v-for="row in catRows"
          :key="row.name"
          class="cat-row"
        >
          <div class="cat-icon" :style="{ background: row.color + '22', color: row.color }">
            {{ row.icon }}
          </div>
          <div class="cat-info">
            <div class="cat-name">{{ row.name }}</div>
          </div>
          <div class="cat-amount">{{ fmt(row.amount) }}</div>
        </div>
      </div>
    </template>

    <!-- ── BY OBJECTS ── -->
    <template v-else>
      <div v-if="objKeys.length === 0" class="empty">Нет платежей за этот период</div>
      <div v-else>
        <div
          v-for="obj in objKeys"
          :key="obj"
          class="obj-block"
        >
          <!-- Object header -->
          <div class="obj-header" @click="toggleObj(obj)">
            <span class="obj-icon">{{ getObjMeta(obj).icon }}</span>
            <span class="obj-name">{{ obj }}</span>
            <span class="obj-total">{{ fmt(objTotal(obj)) }}</span>
            <span class="obj-arrow" :class="{ open: openObjs.has(obj) }">›</span>
          </div>

          <!-- Payment rows for this object -->
          <transition name="slide">
            <div v-if="openObjs.has(obj)" class="obj-rows">
              <div class="obj-row-head">
                <span>Категория</span>
                <span>Дата платежа</span>
                <span>За период</span>
                <span class="right">Сумма</span>
              </div>
              <div
                v-for="(row, i) in byObject[obj]"
                :key="i"
                class="obj-row"
              >
                <div class="cat-badge">
                  <span
                    class="dot"
                    :style="{ background: getCatMeta(row.category).color }"
                  ></span>
                  {{ row.category }}
                </div>
                <div class="date-val">{{ fmtDate(row.date) }}</div>
                <div class="period-val">{{ fmtPeriod(row.period) }}</div>
                <div class="amount-val right">{{ fmt(row.amount) }}</div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePaymentsStore, getCatMeta, getObjMeta, OBJECTS } from '../stores/payments'

const store = usePaymentsStore()
const view  = ref('categories')

// Which object blocks are expanded
const openObjs = ref(new Set())
function toggleObj(name) {
  if (openObjs.value.has(name)) openObjs.value.delete(name)
  else openObjs.value.add(name)
  openObjs.value = new Set(openObjs.value) // trigger reactivity
}

// Auto-expand objects that have rows when data loads
import { watch } from 'vue'
watch(() => store.stats, (s) => {
  if (!s) return
  openObjs.value = new Set(Object.keys(s.by_object || {}))
}, { immediate: true })

// ── By categories ────────────────────────────────────────────
const catRows = computed(() => {
  const bc = store.stats?.by_category || {}
  return Object.entries(bc)
    .map(([name, amount]) => ({ name, amount, ...getCatMeta(name) }))
    .sort((a, b) => b.amount - a.amount)
})

// ── By objects ───────────────────────────────────────────────
const byObject = computed(() => store.stats?.by_object || {})

// Show all 4 objects in canonical order; empty ones at the bottom
const objKeys = computed(() => {
  const bo = byObject.value
  const withData    = OBJECTS.map(o => o.name).filter(n => bo[n]?.length)
  const withoutData = OBJECTS.map(o => o.name).filter(n => !bo[n]?.length)
  return [...withData, ...withoutData]
})

function objTotal(name) {
  return (byObject.value[name] || []).reduce((s, r) => s + r.amount, 0)
}

// ── Formatters ───────────────────────────────────────────────
const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь',
                   'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']

function fmt(n) {
  return Number(n).toLocaleString('ru-RU') + ' ₽'
}
function fmtDate(d) {
  if (!d) return '—'
  const [y, m, dd] = d.split('-')
  return `${dd}.${m}.${y}`
}
function fmtPeriod(p) {
  if (!p) return '—'
  const [y, m] = p.split('-')
  return MONTHS_RU[parseInt(m) - 1] + ' ' + y
}
</script>

<style scoped>
.stats-table { padding: 0 16px 24px; }

/* Toggle */
.view-toggle {
  display: flex; gap: 4px;
  background: var(--bg-card);
  border-radius: 10px; padding: 4px;
  margin-bottom: 16px;
}
.view-toggle button {
  flex: 1; padding: 8px 10px; border: none;
  background: transparent; color: var(--text-secondary);
  border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all .2s; font-family: inherit;
}
.view-toggle button.active {
  background: var(--bg-secondary); color: var(--text-primary);
  box-shadow: 0 1px 4px rgba(0,0,0,.5);
}

.empty { color: var(--text-secondary); font-size: 14px; text-align: center; padding: 32px 0; }

/* Category rows */
.cat-list { display: flex; flex-direction: column; gap: 8px; }
.cat-row {
  display: flex; align-items: center; gap: 12px;
  background: var(--bg-card); border-radius: 12px; padding: 12px 14px;
}
.cat-icon {
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
}
.cat-info { flex: 1; }
.cat-name { font-size: 14px; font-weight: 600; }
.cat-amount { font-size: 15px; font-weight: 700; color: var(--accent-green); }

/* Object blocks */
.obj-block {
  background: var(--bg-card); border-radius: 14px;
  margin-bottom: 10px; overflow: hidden;
  border: 1px solid var(--border);
}
.obj-header {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; cursor: pointer; user-select: none;
  transition: background .15s;
}
.obj-header:active { background: var(--bg-input); }
.obj-icon { font-size: 18px; }
.obj-name { flex: 1; font-size: 14px; font-weight: 700; }
.obj-total { font-size: 14px; font-weight: 700; color: var(--accent-green); }
.obj-arrow {
  color: var(--text-secondary); font-size: 16px;
  transition: transform .2s; display: inline-block;
}
.obj-arrow.open { transform: rotate(90deg); }

.obj-rows { border-top: 1px solid var(--border); }
.obj-row-head {
  display: grid;
  grid-template-columns: 1fr 90px 80px 80px;
  gap: 6px;
  padding: 7px 16px;
  font-size: 10px; font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: .7px;
  background: var(--bg-secondary);
}
.obj-row {
  display: grid;
  grid-template-columns: 1fr 90px 80px 80px;
  gap: 6px;
  padding: 10px 16px;
  font-size: 12px;
  border-top: 1px solid var(--border);
  align-items: center;
}
.cat-badge { display: flex; align-items: center; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.date-val { color: var(--text-secondary); }
.period-val { color: var(--accent-blue); font-size: 11px; }
.amount-val { font-weight: 700; font-size: 12px; }
.right { text-align: right; }

/* Slide transition */
.slide-enter-active, .slide-leave-active { transition: all .2s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; }
.slide-enter-to, .slide-leave-from { max-height: 600px; opacity: 1; }
</style>
