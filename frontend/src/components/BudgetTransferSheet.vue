<template>
  <Teleport to="body">
    <div class="bts-backdrop" @click.self="$emit('close')">
      <div class="bts-sheet">

        <!-- Header -->
        <div class="bts-header">
          <span class="bts-title">Перевод между счетами</span>
          <button class="bts-close" @click="$emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- From account -->
        <div class="bts-field">
          <label class="bts-label">Со счёта</label>
          <div class="bts-select-group">
            <button
              v-for="acc in accounts"
              :key="acc.id"
              class="bts-acc-btn"
              :class="{ active: fromId === acc.id, disabled: acc.id === toId }"
              @click="fromId = acc.id"
            >
              <span>{{ typeMeta(acc.type).icon }}</span>
              <span>{{ acc.name }}</span>
            </button>
          </div>
        </div>

        <!-- Arrow -->
        <div class="bts-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
          </svg>
        </div>

        <!-- To account -->
        <div class="bts-field">
          <label class="bts-label">На счёт</label>
          <div class="bts-select-group">
            <button
              v-for="acc in accounts"
              :key="acc.id"
              class="bts-acc-btn"
              :class="{ active: toId === acc.id, disabled: acc.id === fromId }"
              @click="toId = acc.id"
            >
              <span>{{ typeMeta(acc.type).icon }}</span>
              <span>{{ acc.name }}</span>
            </button>
          </div>
        </div>

        <!-- Amount -->
        <div class="bts-field">
          <label class="bts-label">Сумма</label>
          <div class="bts-input-wrap">
            <input
              v-model="amount"
              type="number"
              inputmode="decimal"
              class="bts-input"
              placeholder="0"
              step="0.01"
              ref="amountInput"
            />
            <span class="bts-currency">₽</span>
          </div>
        </div>

        <!-- Error -->
        <p v-if="error" class="bts-error">{{ error }}</p>

        <!-- Save -->
        <button class="bts-save" :disabled="saving || !canSave" @click="save">
          {{ saving ? 'Переводю...' : 'Перевести' }}
        </button>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useBudgetStore } from '../stores/budget'

const props = defineProps({
  accounts:    { type: Array, required: true },
  preselected: { type: String, default: null },
})
const emit = defineEmits(['close', 'saved'])
const store = useBudgetStore()

const TYPE_META = {
  card:    { icon: '💳' },
  cash:    { icon: '💵' },
  savings: { icon: '🏦' },
  other:   { icon: '📂' },
}
const typeMeta = type => TYPE_META[type] ?? { icon: '💰' }

const fromId = ref(props.preselected ?? props.accounts[0]?.id ?? '')
const toId   = ref(props.accounts.find(a => a.id !== fromId.value)?.id ?? '')
const amount = ref('')
const saving = ref(false)
const error  = ref('')
const amountInput = ref(null)

const canSave = computed(() =>
  fromId.value && toId.value && fromId.value !== toId.value && Number(amount.value) > 0
)

async function save() {
  if (!canSave.value) return
  saving.value = true
  error.value  = ''
  try {
    await store.addTransferEntry({
      from_account_id: fromId.value,
      to_account_id:   toId.value,
      amount:          Number(amount.value),
    })
    emit('saved')
    emit('close')
  } catch (e) {
    error.value = e.response?.data?.detail || 'Ошибка при переводе'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await nextTick()
  amountInput.value?.focus()
})
</script>

<style scoped>
.bts-backdrop {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: flex-end;
}

.bts-sheet {
  width: 100%;
  background: var(--bg-secondary);
  border-radius: 20px 20px 0 0;
  border-top: 1px solid var(--border);
  padding: 20px 20px calc(24px + env(safe-area-inset-bottom, 0px));
  animation: slideUp .25s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 85vh;
  overflow-y: auto;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.bts-header {
  display: flex; align-items: center; justify-content: space-between;
}
.bts-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }
.bts-close {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--bg-input); border: none;
  color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.bts-close:hover { background: var(--border); color: #fff; }

.bts-field { display: flex; flex-direction: column; gap: 8px; }
.bts-label {
  font-size: 11px; font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: .4px;
}

.bts-select-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.bts-acc-btn {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 14px; font-weight: 500;
  cursor: pointer;
  transition: background .12s, border-color .12s, color .12s;
  text-align: left;
  font-family: inherit;
}
.bts-acc-btn.active {
  background: rgba(10,132,255,0.15);
  border-color: #0a84ff;
  color: #fff;
}
.bts-acc-btn.disabled { opacity: 0.35; cursor: default; pointer-events: none; }

.bts-arrow {
  display: flex; justify-content: center;
  margin: -4px 0;
}

.bts-input-wrap {
  display: flex; align-items: center; gap: 8px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0 14px;
}
.bts-input {
  flex: 1;
  background: transparent; border: none; outline: none;
  font-size: 20px; font-weight: 600;
  color: var(--text-primary);
  font-family: inherit;
  padding: 14px 0;
  font-variant-numeric: tabular-nums;
  -moz-appearance: textfield;
}
.bts-input::-webkit-inner-spin-button,
.bts-input::-webkit-outer-spin-button { -webkit-appearance: none; }
.bts-currency { font-size: 18px; font-weight: 600; color: var(--text-secondary); }

.bts-error { font-size: 13px; color: #ff453a; margin: 0; }

.bts-save {
  width: 100%;
  padding: 16px;
  border-radius: 14px;
  background: #0a84ff;
  color: #fff;
  font-size: 16px; font-weight: 700;
  border: none; cursor: pointer;
  transition: opacity .15s, transform .1s;
}
.bts-save:active { transform: scale(0.98); }
.bts-save:disabled { opacity: 0.4; cursor: default; }
</style>
