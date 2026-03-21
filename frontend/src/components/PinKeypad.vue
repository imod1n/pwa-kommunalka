<template>
  <!-- Индикаторы -->
  <div class="pk-dots" :class="{ shake: shaking }">
    <div
      v-for="i in 4" :key="i"
      class="pk-dot"
      :class="{ filled: pin.length >= i, error: shaking }"
    />
  </div>

  <!-- Клавиатура -->
  <div class="pk-keyboard">
    <button
      v-for="(key, idx) in keys" :key="idx"
      class="pk-key"
      :class="{ ghost: key === '' }"
      :disabled="disabled"
      @click="handleKey(key)"
    >
      <template v-if="key === 'del'">
        <span class="mdi mdi-backspace-outline" style="font-size:22px;color:rgba(255,255,255,0.7)"></span>
      </template>
      <template v-else-if="key !== '' && key !== 'extra'">{{ key }}</template>
      <template v-else-if="key === 'extra'">
        <slot name="extra-key" />
      </template>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  // '' = ghost (невидимая), 'extra' = показывает слот #extra-key
  extraKey: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['complete', 'extra-key'])

const pin = ref('')
const shaking = ref(false)

const keys = computed(() => [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  props.extraKey, '0', 'del'
])

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function handleKey(key) {
  if (shaking.value || props.disabled) return

  if (key === 'del') {
    pin.value = pin.value.slice(0, -1)
    return
  }
  if (key === 'extra') {
    emit('extra-key')
    return
  }
  if (key === '') return
  if (pin.value.length >= 4) return

  pin.value += key

  if (pin.value.length === 4) {
    const hash = await sha256(pin.value)
    emit('complete', hash)
  }
}

function shake() {
  shaking.value = true
  setTimeout(() => {
    shaking.value = false
    pin.value = ''
  }, 650)
}

function reset() {
  pin.value = ''
  shaking.value = false
}

defineExpose({ shake, reset })
</script>

<style scoped>
/* PIN Dots */
.pk-dots {
  display: flex;
  gap: 18px;
}

.pk-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}

.pk-dot.filled {
  background: #ffffff;
  border-color: #ffffff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.35);
  transform: scale(1.1);
}

.pk-dot.error {
  background: #ff453a;
  border-color: #ff453a;
  box-shadow: 0 0 10px rgba(255, 69, 58, 0.5);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  18%       { transform: translateX(-9px); }
  36%       { transform: translateX(9px); }
  54%       { transform: translateX(-6px); }
  72%       { transform: translateX(6px); }
  90%       { transform: translateX(-3px); }
}

.shake { animation: shake 0.55s cubic-bezier(.36, .07, .19, .97); }

/* Keyboard */
.pk-keyboard {
  display: grid;
  grid-template-columns: repeat(3, 76px);
  gap: 12px;
}

.pk-key {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.065);
  color: rgba(255, 255, 255, 0.92);
  font-size: 28px;
  font-weight: 300;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s, transform 0.1s, border-color 0.12s;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
  user-select: none;
  letter-spacing: -0.5px;
}

.pk-key:active {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.15);
  transform: scale(0.94);
}

.pk-key.ghost {
  visibility: hidden;
  pointer-events: none;
}

.pk-key:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>
