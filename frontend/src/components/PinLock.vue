<template>
  <div class="pin-overlay" ref="overlayEl">

    <!-- Фоновый градиент -->
    <div class="pin-bg-glow" />

    <div class="pin-container">

      <!-- Иконка-замок -->
      <div class="pin-icon-wrap">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="rgba(255,255,255,0.9)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="3" y="11" width="18" height="11" rx="3" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
          <circle cx="12" cy="16.5" r="1.5" fill="rgba(255,255,255,0.7)"/>
        </svg>
      </div>

      <!-- Заголовок -->
      <p class="pin-title">Введите код доступа</p>

      <!-- Клавиатура с dots -->
      <PinKeypad ref="keypad" @complete="onComplete" />

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PinKeypad from './PinKeypad.vue'
import { usePreventZoom } from '../composables/usePreventZoom'

const emit = defineEmits(['unlocked'])

const PIN_HASH = import.meta.env.VITE_PIN_HASH
const keypad = ref()
const overlayEl = ref()
usePreventZoom(overlayEl)

async function onComplete(hash) {
  if (hash === PIN_HASH) {
    emit('unlocked')
  } else {
    keypad.value.shake()
  }
}
</script>

<style scoped>
.pin-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #0d0d0f;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  touch-action: none;
}

.pin-bg-glow {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(48, 209, 88, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.pin-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
  width: 100%;
  max-width: 300px;
  padding: 0 16px;
}

.pin-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.pin-title {
  font-size: 16px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.55);
  margin: -12px 0 0;
  letter-spacing: 0.1px;
}
</style>
