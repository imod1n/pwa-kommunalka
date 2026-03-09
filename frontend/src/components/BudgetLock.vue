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
        </div>

        <p v-else class="bl-no-users">Пользователи не настроены.<br>Добавьте VITE_BUDGET_USER1_NAME в GitHub Secrets.</p>
      </template>

      <!-- ── Шаг 2: Ввод PIN ── -->
      <template v-else>
        <div class="bl-icon-wrap">
          <span class="bl-avatar-lg">{{ selectedUser.name[0] }}</span>
        </div>

        <div class="bl-header">
          <p class="bl-title">{{ selectedUser.name }}</p>
          <button class="bl-back" @click="selectedUser = null; pin = ''; error = ''">← Назад</button>
        </div>

        <p v-if="error" class="bl-error">{{ error }}</p>

        <!-- Индикаторы -->
        <div class="bl-dots" :class="{ shake: shaking }">
          <div
            v-for="i in 4" :key="i"
            class="bl-dot"
            :class="{ filled: pin.length >= i, error: shaking }"
          />
        </div>

        <!-- Клавиатура -->
        <div class="bl-keyboard">
          <button
            v-for="key in KEYS" :key="key"
            class="bl-key"
            :class="{ ghost: key === '' }"
            :disabled="loading"
            @click="handleKey(key)"
          >
            <template v-if="key === 'del'">
              <svg width="20" height="15" viewBox="0 0 20 15" fill="none">
                <path d="M7 1H18C18.5523 1 19 1.44772 19 2V13C19 13.5523 18.5523 14 18 14H7L1 7.5L7 1Z" stroke="rgba(255,255,255,0.7)" stroke-width="1.4" stroke-linejoin="round"/>
                <path d="M11.5 5L8.5 10M8.5 5L11.5 10" stroke="rgba(255,255,255,0.7)" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
            </template>
            <template v-else>{{ key }}</template>
          </button>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBudgetStore } from '../stores/budget'

const emit = defineEmits(['unlocked'])
const store = useBudgetStore()

// Читаем имена пользователей из env (не хеши — они на сервере)
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

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del']

const selectedUser = ref(null)
const pin          = ref('')
const shaking      = ref(false)
const loading      = ref(false)
const error        = ref('')

function selectUser(user) {
  selectedUser.value = user
  pin.value   = ''
  error.value = ''
}

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function handleKey(key) {
  if (shaking.value || loading.value) return

  if (key === 'del') {
    pin.value = pin.value.slice(0, -1)
    return
  }
  if (key === '' || pin.value.length >= 4) return

  pin.value += key

  if (pin.value.length === 4) {
    loading.value = true
    error.value   = ''
    try {
      const hash = await sha256(pin.value)
      await store.login(selectedUser.value.id, hash)
      emit('unlocked')
    } catch {
      shaking.value = true
      error.value   = 'Неверный код'
      setTimeout(() => {
        shaking.value = false
        pin.value     = ''
        error.value   = ''
      }, 700)
    } finally {
      loading.value = false
    }
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
  gap: 28px;
  width: 100%;
  max-width: 320px;
  padding: 0 20px;
}

/* Icon */
.bl-icon-wrap {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
}
.bl-avatar-lg {
  font-size: 28px;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
}

/* Titles */
.bl-title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  margin: 0;
  margin-top: -8px;
}
.bl-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.4);
  margin: -16px 0 0;
}
.bl-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-top: -8px;
}
.bl-back {
  font-size: 13px;
  color: rgba(255,255,255,0.35);
  background: none; border: none; cursor: pointer;
  transition: color .15s;
}
.bl-back:hover { color: rgba(255,255,255,0.6); }

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
  gap: 14px;
  padding: 14px 18px;
  border-radius: 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  cursor: pointer;
  transition: background .15s, border-color .15s, transform .1s;
  -webkit-tap-highlight-color: transparent;
}
.bl-user-btn:active { background: rgba(255,255,255,0.1); transform: scale(0.97); }
.bl-user-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: rgba(10,132,255,0.2);
  border: 1px solid rgba(10,132,255,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 600; color: #0a84ff;
  flex-shrink: 0;
}
.bl-user-name {
  font-size: 16px;
  font-weight: 500;
  color: rgba(255,255,255,0.85);
}

.bl-no-users {
  font-size: 13px;
  color: rgba(255,255,255,0.35);
  text-align: center;
  line-height: 1.5;
}

/* Error */
.bl-error {
  font-size: 13px;
  color: #ff453a;
  margin: -12px 0 0;
}

/* PIN Dots */
.bl-dots {
  display: flex;
  gap: 18px;
}
.bl-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.3);
  background: transparent;
  transition: background .2s, border-color .2s, box-shadow .2s, transform .15s;
}
.bl-dot.filled {
  background: #ffffff;
  border-color: #ffffff;
  box-shadow: 0 0 10px rgba(255,255,255,0.35);
  transform: scale(1.1);
}
.bl-dot.error {
  background: #ff453a;
  border-color: #ff453a;
  box-shadow: 0 0 10px rgba(255,69,58,0.5);
}

@keyframes shake {
  0%,100% { transform: translateX(0); }
  18%      { transform: translateX(-9px); }
  36%      { transform: translateX(9px); }
  54%      { transform: translateX(-6px); }
  72%      { transform: translateX(6px); }
  90%      { transform: translateX(-3px); }
}
.shake { animation: shake .55s cubic-bezier(.36,.07,.19,.97); }

/* Keyboard */
.bl-keyboard {
  display: grid;
  grid-template-columns: repeat(3, 76px);
  gap: 12px;
}
.bl-key {
  width: 76px; height: 76px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.065);
  color: rgba(255,255,255,0.92);
  font-size: 28px; font-weight: 300;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .12s, transform .1s, border-color .12s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.bl-key:active {
  background: rgba(255,255,255,0.18);
  border-color: rgba(255,255,255,0.15);
  transform: scale(0.94);
}
.bl-key.ghost { visibility: hidden; pointer-events: none; }
.bl-key:disabled { opacity: 0.4; cursor: default; }
</style>
