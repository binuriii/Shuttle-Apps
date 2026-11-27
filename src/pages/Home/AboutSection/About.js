// About.js — content + behaviour for the About section
import { onMounted, onBeforeUnmount } from 'vue'

/* ---------- Copy: edit freely ---------- */
export const aboutContent = {
  title: {
    strong: 'Boring apps?',
    muted: 'Not at Shuttle Apps.',
  },
  tagline: {
    strong: 'We design and build apps people open',
    muted: 'on purpose, not out of habit.',
  },
  caption: {
    label: 'Who we are /',
    text:
      'A small studio of designers and engineers shipping fast, honest products. ' +
      'We work with founders from first sketch to launch, and stay for the updates after.',
  },
}

/* ---------- Pointer tilt for the hand + phone image ----------
   Sets --tilt-x / --tilt-y (degrees) on the stage element, smoothed with rAF.
   Disabled for reduced-motion and touch-only devices. */
export function usePhoneTilt(stageRef, { max = 4, ease = 0.08 } = {}) {
  let raf = 0
  let tx = 0, ty = 0   // target
  let cx = 0, cy = 0   // current
  let el = null

  const onMove = (e) => {
    const r = el.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width - 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5
    tx = nx * max * 2
    ty = ny * max * 2
  }

  const onLeave = () => { tx = 0; ty = 0 }

  const tick = () => {
    cx += (tx - cx) * ease
    cy += (ty - cy) * ease
    el.style.setProperty('--tilt-x', `${(-cy).toFixed(2)}deg`)
    el.style.setProperty('--tilt-y', `${cx.toFixed(2)}deg`)
    raf = requestAnimationFrame(tick)
  }

  onMounted(() => {
    el = stageRef.value
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(pointer: fine)').matches
    if (reduce || !fine) return
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(tick)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    if (!el) return
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
  })
}

/* ---------- Scroll rise (parallax) ----------
   Writes --rise (0 → 1) on the section for the whole time it crosses the screen:
   0 = section's top edge just entering at the bottom of the viewport,
   1 = section's bottom edge just leaving at the top.
   The hand moves up as you scroll down and back down as you scroll up.
   Smoothed with rAF so the movement feels slow and soft. */
export function useScrollRise(rootRef, { ease = 0.07 } = {}) {
  let raf = 0
  let el = null
  let current = 0
  let target = 0
  let running = false

  const measure = () => {
    const r = el.getBoundingClientRect()
    const vh = window.innerHeight
    const p = (vh - r.top) / (vh + r.height)
    target = Math.min(1, Math.max(0, p))
  }

  const tick = () => {
    current += (target - current) * ease
    if (Math.abs(target - current) < 0.001) current = target
    el.style.setProperty('--rise', current.toFixed(4))
    if (current !== target) {
      raf = requestAnimationFrame(tick)
    } else {
      running = false
    }
  }

  const onScroll = () => {
    measure()
    if (!running) {
      running = true
      raf = requestAnimationFrame(tick)
    }
  }

  onMounted(() => {
    el = rootRef.value
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--rise', '0.54')
      return
    }
    measure()
    current = target
    el.style.setProperty('--rise', current.toFixed(4))
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })
}