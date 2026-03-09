<template>
  <div class="bl-overlay">
    <div class="bl-glow" />

    <div class="bl-container">

      <!-- ── Шаг 1: Выбор пользователя ── -->
      <template v-if="!selectedUser">
        <div class="bl-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
            <path d="M3 21c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>

        <p class="bl-title">Личный бюджет</p>
        <p class="bl-subtitle">Выберите пользователя</p>

        <div v-if="BUDGET_USERS.length" class="bl-users">
          <button
            v-for="user in BUDGET_USERS"
            :key="user.id"
            class="bl-user-btn"
            @click="selectUser(user)"
          >
            <span class="bl-user-avatar">{{ user.name[0] }}</span>
            <span class="bl-user-name">{{ user.name }}</span>
          </button>
          <button class="bl-user-btn bl-back-btn" @click="emit('back')">
            <span class="bl-back-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="bl-user-name bl-back-label">Назад</span>
          </button>
        </div>

        <p v-else class="bl-no-users">Пользователи не настроены.<br>Добавьте VITE_BUDGET_USER1_NAME в GitHub Secrets.</p>
      </template>

      <!-- ── Шаг 2: Ввод PIN ── -->
      <template v-else>
        <div class="bl-icon-wrap">
          <span class="bl-avatar-lg">{{ selectedUser.name[0] }}</span>
        </div>

        <p class="bl-pin-label">{{ selectedUser.name }}</p>

        <p v-if="error" class="bl-error">{{ error }}</p>

        <PinKeypad
          ref="keypad"
          extra-key="extra"
          :disabled="loading"
          @complete="onComplete"
          @extra-key="goBack"
        >
          <template #extra-key>
            <span class="mdi mdi-account-box-multiple" style="font-size:22px;color:rgba(255,255,255,0.7)"></span>
          </template>
        </PinKeypad>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBudgetStore } from '../stores/budget'
import PinKeypad from './PinKeypad.vue'

const emit = defineEmits(['unlocked', 'back'])
const store = useBudgetStore()

const BUDGET_USERS = (() => {
  const users = []
  let i = 1
  while (true) {
    const name = import.meta.env[`VITE_BUDGET_USER${i}_NAME`]
    if (!name) break
    users.push({ id: name.toLowerCase(), name })
    i++
  }
  return users
})()

const selectedUser = ref(null)
const loading      = ref(false)
const error        = ref('')
const keypad       = ref()

function selectUser(user) {
  selectedUser.value = user
  error.value = ''
}

function goBack() {
  selectedUser.value = null
  error.value = ''
}

async function onComplete(hash) {
  loading.value = true
  error.value   = ''
  try {
    await store.login(selectedUser.value.id, hash)
    emit('unlocked')
  } catch {
    error.value = 'Неверный код'
    keypad.value.shake()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.bl-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: #0d0d0f;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.bl-glow {
  position: absolute;
  top: 30%; left: 50%;
  transform: translate(-50%, -50%);
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(10, 132, 255, 0.07) 0%, transparent 70%);
  pointer-events: none;
}

.bl-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
  width: 100%;
  max-width: 300px;
  padding: 0 16px;
}

/* Icon */
.bl-icon-wrap {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex; align-items: center; justify-content: center;
}

.bl-avatar-lg {
  font-size: 28px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

/* Titles */
.bl-title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: -12px 0 0;
}

.bl-pin-label {
  font-size: 16px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.55);
  margin: -12px 0 0;
  letter-spacing: 0.1px;
}

.bl-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  margin: -20px 0 0;
}

/* Users list */
.bl-users {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.bl-user-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.bl-user-btn:active { background: rgba(255, 255, 255, 0.1); transform: scale(0.97); }

.bl-user-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: rgba(10, 132, 255, 0.2);
  border: 1px solid rgba(10, 132, 255, 0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 600; color: #0a84ff;
  flex-shrink: 0;
}

.bl-user-name {
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
}

.bl-back-btn {
  margin-top: 4px;
  background: transparent;
  border-color: rgba(255, 255, 255, 0.06);
}

.bl-back-btn:active { background: rgba(255, 255, 255, 0.06); transform: scale(0.97); }

.bl-back-icon {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.bl-back-label {
  color: rgba(255, 255, 255, 0.45);
}

.bl-no-users {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  text-align: center;
  line-height: 1.5;
}

/* Error */
.bl-error {
  font-size: 13px;
  color: #ff453a;
  margin: -12px 0 0;
}
</style>
