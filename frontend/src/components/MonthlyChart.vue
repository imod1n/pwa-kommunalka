<template>
  <div class="card">
    <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <span>📈</span> График расходов
    </h2>

    <div v-if="!hasData" class="text-center py-8" style="color: var(--text-secondary)">
      Недостаточно данных для графика
    </div>

    <div v-else>
      <!-- Переключатель режима -->
      <div class="flex gap-2 mb-4">
        <button
          v-for="mode in modes"
          :key="mode.key"
          @click="activeMode = mode.key"
          class="btn-ios flex-1 text-xs py-2 font-semibold"
          :style="activeMode === mode.key
            ? 'background: var(--accent-blue); color: #fff'
            : 'background: var(--bg-input); color: var(--text-secondary)'"
        >
          {{ mode.label }}
        </button>
      </div>

      <!-- График суммы по месяцам -->
      <div v-if="activeMode === 'total'" class="relative h-48">
        <canvas ref="totalCanvas"></canvas>
      </div>

      <!-- График по категориям -->
      <div v-if="activeMode === 'breakdown'" class="relative h-48">
        <canvas ref="breakdownCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  Chart,
  BarController, LineController,
  BarElement, LineElement, PointElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler
} from 'chart.js'

Chart.register(
  BarController, LineController,
  BarElement, LineElement, PointElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler
)

const props = defineProps({
  history: { type: Array, default: () => [] },
})

const totalCanvas = ref(null)
const breakdownCanvas = ref(null)
const activeMode = ref('total')
const modes = [
  { key: 'total', label: '📊 Итого' },
  { key: 'breakdown', label: '🗂️ По категориям' },
]

let totalChart = null
let breakdownChart = null

const hasData = computed(() => props.history.length >= 1)

const labels = computed(() => props.history.map(h => h.label || h.month))

const allCategories = ['Электричество', 'Вода', 'Газ', 'Отопление', 'Интернет', 'Мусор']
const catColors = {
  'Электричество': '#ffd60a',
  'Вода': '#0a84ff',
  'Газ': '#ff9f0a',
  'Отопление': '#ff453a',
  'Интернет': '#bf5af2',
  'Мусор': '#636366',
}

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#2c2c2e',
      titleColor: '#8e8e93',
      bodyColor: '#fff',
      borderColor: '#38383a',
      borderWidth: 1,
      padding: 12,
      callbacks: {
        label: (ctx) => ` ${Math.round(ctx.parsed.y).toLocaleString('ru')} ₽`
      }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#8e8e93', font: { size: 11 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: {
        color: '#8e8e93',
        font: { size: 11 },
        callback: (v) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v
      },
      border: { dash: [4, 4] },
    }
  }
}

function buildTotalChart() {
  if (!totalCanvas.value) return
  if (totalChart) { totalChart.destroy(); totalChart = null }

  const totals = props.history.map(h => h.total)
  const maxVal = Math.max(...totals)

  totalChart = new Chart(totalCanvas.value, {
    type: 'bar',
    data: {
      labels: labels.value,
      datasets: [
        {
          type: 'bar',
          label: 'Итого',
          data: totals,
          backgroundColor: totals.map((v, i) =>
            i === totals.length - 1
              ? 'rgba(48,209,88,0.8)'
              : `rgba(10,132,255,${0.4 + 0.4 * (v / (maxVal || 1))})`
          ),
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          type: 'line',
          label: 'Тренд',
          data: totals,
          borderColor: 'rgba(48,209,88,0.6)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#30d158',
          tension: 0.4,
          fill: false,
        }
      ]
    },
    options: chartDefaults
  })
}

function buildBreakdownChart() {
  if (!breakdownCanvas.value) return
  if (breakdownChart) { breakdownChart.destroy(); breakdownChart = null }

  const usedCats = allCategories.filter(cat =>
    props.history.some(h => h.categories[cat])
  )

  breakdownChart = new Chart(breakdownCanvas.value, {
    type: 'bar',
    data: {
      labels: labels.value,
      datasets: usedCats.map(cat => ({
        label: cat,
        data: props.history.map(h => h.categories[cat] || 0),
        backgroundColor: catColors[cat] + 'cc',
        borderRadius: 4,
        borderSkipped: false,
      }))
    },
    options: {
      ...chartDefaults,
      plugins: {
        ...chartDefaults.plugins,
        legend: {
          display: true,
          labels: {
            color: '#8e8e93',
            font: { size: 10 },
            boxWidth: 12,
            padding: 8,
          }
        }
      },
      scales: {
        ...chartDefaults.scales,
        x: { ...chartDefaults.scales.x, stacked: true },
        y: { ...chartDefaults.scales.y, stacked: true },
      }
    }
  })
}

watch(() => props.history, async () => {
  await nextTick()
  if (activeMode.value === 'total') buildTotalChart()
  else buildBreakdownChart()
}, { deep: true, immediate: true })

watch(activeMode, async (mode) => {
  await nextTick()
  if (mode === 'total') buildTotalChart()
  else buildBreakdownChart()
})

onUnmounted(() => {
  totalChart?.destroy()
  breakdownChart?.destroy()
})
</script>
