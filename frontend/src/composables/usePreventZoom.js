import { onMounted, onUnmounted } from 'vue'

export function usePreventZoom(elRef) {
  let lastTap = 0

  function onTouchStart(e) {
    if (e.touches.length > 1) e.preventDefault()
  }

  function onTouchEnd(e) {
    const now = Date.now()
    if (now - lastTap < 300) e.preventDefault()
    lastTap = now
  }

  onMounted(() => {
    const el = elRef.value
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchend',   onTouchEnd,   { passive: false })
  })

  onUnmounted(() => {
    const el = elRef.value
    if (!el) return
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchend',   onTouchEnd)
  })
}
