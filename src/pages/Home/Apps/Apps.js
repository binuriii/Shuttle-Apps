// Apps.js — content + 3D ring carousel logic (Vue 3 port of the React Bits
// "CircularCarousel", cylinder preset, tuned for portrait phone screenshots)
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

/* ---------- Copy: edit freely ---------- */
export const appsContent = {
  title: {
    strong: 'Apps we’ve built.',
    muted: 'Designed for iOS.',
  },
  tagline: {
    strong: 'Grab the ring and spin it.',
    muted: 'Each screen is one of our apps.',
  },
}

/* ---------- Your apps ----------
   Put portrait iPhone screenshots in  public/assests/apps/  and list them here.
   If an image is missing, the card shows a colour gradient instead. */
const shot = (n) => `/assests/MobileUI${n}.png`
export const appsItems = [
  { src: shot(1), alt: 'Screenshot of app 1', title: 'App name 1', subtitle: 'Category' },
  { src: shot(2), alt: 'Screenshot of app 2', title: 'App name 2', subtitle: 'Category' },
  { src: shot(3), alt: 'Screenshot of app 3', title: 'App name 3', subtitle: 'Category' },
  { src: shot(4), alt: 'Screenshot of app 4', title: 'App name 4', subtitle: 'Category' },
  { src: shot(5), alt: 'Screenshot of app 5', title: 'App name 5', subtitle: 'Category' },
  { src: shot(6), alt: 'Screenshot of app 6', title: 'App name 6', subtitle: 'Category' },
  { src: shot(7), alt: 'Screenshot of app 7', title: 'App name 7', subtitle: 'Category' },
  { src: shot(8), alt: 'Screenshot of app 8', title: 'App name 8', subtitle: 'Category' },
]

/* ---------- Engine ---------- */
const SPRING = 118
const SETTLE_SPEED = 9
const DRAG_THRESHOLD = 5
const INTRO_MS = 1400
const CAPTION_SPACE = 84
const TO_RAD = Math.PI / 180

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const wrap = (d) => ((((d + 180) % 360) + 360) % 360) - 180
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5)

/**
 * @param refs    { root, stage, camera, ring, cards }  (cards is a plain array)
 * @param getOpts () => { items, cardWidth, aspectRatio, gap, spread, tilt, perspective,
 *                        speed, autoplay, captions, depthFade, parallax }
 */
export function useAppsCarousel(refs, getOpts) {
  const active = ref(0)
  const ready = ref(false)
  const dragging = ref(false)

  const state = {
    angle: 0, velocity: 0, target: null, dir: -1,
    press: null, drag: false, hover: false,
    pointer: { inside: false, x: 0, y: 0 },
    yaw: 0, pitch: 0,
    intro: null, introDone: false, holdUntil: 0,
    suppressClick: false, wheelTimer: 0,
    fit: 1, shift: 0, drop: 0, last: 0, narrow: false,
  }

  let disposed = false
  const undo = []

  onMounted(() => {
    const root = refs.root.value
    const stage = refs.stage.value
    const camera = refs.camera.value
    const ring = refs.ring.value
    if (!root || !stage || !camera || !ring) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let visible = true

    const geo = () => {
      const o = getOpts()
      const n = Math.max(o.items.length, 1)
      const step = 360 / n
      const W = Math.max(60, o.cardWidth)
      const H = W / clamp(o.aspectRatio, 0.2, 5)
      // spread > 1 pushes the cards further apart on a bigger ring (capped on small screens)
      const spread = state.narrow ? Math.min(o.spread, 1.1) : o.spread
      const R = Math.max(((W + o.gap) / (2 * Math.sin(Math.PI / Math.max(n, 3)))) * spread, W * 0.6)
      return { o, n, step, W, H, R }
    }

    const nearest = (angle, step) => Math.round(angle / step) * step

    /* Size the ring to its container */
    const measure = () => {
      const rect = root.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      state.narrow = rect.width < 700
      const { o, W, H, R } = geo()
      root.style.setProperty('--card-w', `${W}px`)
      root.style.setProperty('--card-h', `${H}px`)
      root.style.setProperty('--card-r', `${Math.round(W * 0.15)}px`)

      const P = o.perspective
      const room = o.captions ? CAPTION_SPACE : 0
      const spanX = (2 * R * P) / (P + R) + W
      const spanY = H * 1.15 + R * Math.sin(Math.abs(o.tilt) * TO_RAD) * 1.2
      const fit = Math.min(1, (rect.width * 0.94) / spanX, ((rect.height - room) * 0.92) / spanY)

      state.fit = fit
      state.shift = -room / 2
      state.drop = (rect.height / fit) * 0.55 + H
      stage.style.perspective = `${P}px`
      stage.style.transform = `translate3d(0, ${state.shift}px, 0) scale(${fit})`
    }

    const advance = (g, dt, now) => {
      const { o, step } = g

      // intro: cards slide up one by one once images are loaded
      if (!state.introDone && ready.value) {
        if (!state.intro) {
          if (reduced) state.introDone = true
          else state.intro = { start: now }
        }
        if (state.intro && now - state.intro.start >= INTRO_MS) {
          state.intro = null
          state.introDone = true
        }
      }

      const paused = state.hover || state.drag || now < state.holdUntil
      const cruise = o.autoplay && !reduced && !paused && !state.intro ? o.speed * state.dir : 0
      let busy = Boolean(state.intro) || state.drag

      if (state.drag || state.intro) {
        state.velocity = state.drag ? state.velocity : 0
      } else if (state.target !== null) {
        // spring toward the card we are settling on
        let remaining = dt
        const damping = 2 * Math.sqrt(SPRING)
        while (remaining > 0) {
          const h = Math.min(remaining, 1 / 240)
          const accel = SPRING * (state.target - state.angle) - damping * state.velocity
          state.velocity += accel * h
          state.angle += state.velocity * h
          remaining -= h
        }
        if (Math.abs(state.target - state.angle) < 0.004 && Math.abs(state.velocity) < 0.03) {
          state.angle = state.target
          state.velocity = 0
          state.target = null
        }
        busy = true
      } else {
        // glide back to the drift speed
        const tau = 0.18 + 0.6 * 1.5
        state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / tau))
        state.angle += state.velocity * dt
        if (cruise === 0 && Math.abs(state.velocity) < SETTLE_SPEED) {
          state.target = nearest(state.angle, step)
        }
        busy = busy || cruise !== 0 || Math.abs(state.velocity) > 0.01 || state.target !== null
      }

      if (now < state.holdUntil) busy = true

      // camera leans toward the pointer
      const ease = 1 - Math.exp(-dt / 0.35)
      const k = reduced ? 0 : o.parallax
      const aimYaw = state.pointer.inside ? state.pointer.x * k * 9 : 0
      const aimPitch = state.pointer.inside ? -state.pointer.y * k * 6 : 0
      state.yaw += (aimYaw - state.yaw) * ease
      state.pitch += (aimPitch - state.pitch) * ease
      if (Math.abs(aimYaw - state.yaw) > 0.01 || Math.abs(aimPitch - state.pitch) > 0.01) busy = true

      return busy
    }

    const render = (g, now) => {
      const { o, n, step, R } = g
      const elapsed = state.intro ? now - state.intro.start : 0
      const swell = 1 + (reduced ? 0 : 0.5 * 0.12 * Math.min(1, Math.abs(state.velocity) / 420))
      const r = R * swell

      camera.style.transform = `translate3d(0, 0, ${-r}px) rotateX(${o.tilt + state.pitch}deg) rotateY(${state.yaw}deg)`
      ring.style.transform = `rotateY(${state.angle}deg)`

      for (let i = 0; i < n; i++) {
        const card = refs.cards[i]
        if (!card) continue
        const base = i * step
        let lift = 0
        if (state.intro) {
          const reach = Math.abs(wrap(base + state.angle))
          const delay = (reach / 180) * 480
          lift = (1 - easeOutQuint(clamp((elapsed - delay) / 900, 0, 1))) * state.drop
        }
        card.style.transform =
          `rotateY(${base}deg) translateZ(${r}px)` + (lift ? ` translateY(${lift}px)` : '')

        const facing = Math.cos(wrap(base + state.angle) * TO_RAD)
        const fade = o.depthFade * Math.pow((1 - facing) / 2, 1.25)
        card.style.setProperty('--depth', fade.toFixed(3))
      }

      const idx = ((Math.round(-state.angle / step) % n) + n) % n || 0
      if (idx !== active.value) active.value = idx
    }

    const frame = (now) => {
      raf = 0
      const g = geo()
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.05) : 1 / 60
      state.last = now
      const busy = advance(g, dt, now)
      render(g, now)
      if (busy && visible && !document.hidden) raf = requestAnimationFrame(frame)
      else state.last = 0
    }

    const wake = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame)
    }

    /* ----- Interaction ----- */
    const focusIndex = (index) => {
      const { step } = geo()
      let target = -index * step
      target += 360 * Math.round((state.angle - target) / 360)
      state.target = target
      state.holdUntil = performance.now() + 2800
      wake()
    }

    const stepBy = (delta) => {
      const { step } = geo()
      const base = state.target ?? nearest(state.angle, step)
      state.target = base - delta * step
      state.holdUntil = performance.now() + 2800
      wake()
    }

    const updatePointer = (e) => {
      const rect = root.getBoundingClientRect()
      state.pointer.x = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1)
      state.pointer.y = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1)
    }

    const onPointerDown = (e) => {
      state.suppressClick = false
      if (e.button !== 0) return
      state.press = {
        id: e.pointerId, x: e.clientX, y: e.clientY,
        angle: state.angle, moved: false, origin: 0,
        samples: [{ time: performance.now(), angle: state.angle }],
      }
    }

    const onPointerMove = (e) => {
      if (e.pointerType === 'mouse') {
        state.pointer.inside = true
        updatePointer(e)
      }
      const press = state.press
      if (!press || press.id !== e.pointerId) {
        wake()
        return
      }
      const { R } = geo()
      const dx = e.clientX - press.x
      const dy = e.clientY - press.y
      if (!press.moved) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return
        // on touch, let vertical gestures scroll the page
        if (Math.abs(dy) > Math.abs(dx) * 1.2 && e.pointerType !== 'mouse') {
          state.press = null
          return
        }
        press.moved = true
        press.origin = dx
        state.drag = true
        state.target = null
        state.velocity = 0
        dragging.value = true
        try { root.setPointerCapture(e.pointerId) } catch {}
      }
      const perPixel = 180 / (Math.PI * R * state.fit)
      state.angle = press.angle + (dx - press.origin) * perPixel
      const now = performance.now()
      press.samples.push({ time: now, angle: state.angle })
      while (press.samples.length > 2 && now - press.samples[0].time > 110) press.samples.shift()
      wake()
    }

    const onPointerUp = (e) => {
      const press = state.press
      if (!press || press.id !== e.pointerId) return
      state.press = null
      if (!press.moved) return
      state.drag = false
      dragging.value = false
      state.suppressClick = true

      const { o, step } = geo()
      const first = press.samples[0]
      const last = press.samples[press.samples.length - 1]
      const span = (last.time - first.time) / 1000
      const velocity = span > 0.008 ? clamp((last.angle - first.angle) / span, -1400, 1400) : 0
      state.velocity = velocity
      if (Math.abs(velocity) > 60) state.dir = Math.sign(velocity)

      const coasting = o.autoplay && !reduced && !(state.hover && e.pointerType === 'mouse')
      if (!coasting) {
        const tau = 0.18 + 0.6 * 1.5
        state.target = Math.round((state.angle + velocity * tau * 0.55) / step) * step
      }
      wake()
    }

    const onPointerEnter = (e) => {
      if (e.pointerType !== 'mouse') return
      state.hover = true
      wake()
    }

    const onPointerLeave = (e) => {
      if (e.pointerType === 'mouse') {
        state.hover = false
        state.pointer.inside = false
      }
      wake()
    }

    const onClick = (e) => {
      if (state.suppressClick) {
        state.suppressClick = false
        return
      }
      const card = e.target.closest?.('[data-index]')
      if (card) focusIndex(Number(card.getAttribute('data-index')))
    }

    const onKeyDown = (e) => {
      const { n } = geo()
      if (e.key === 'ArrowRight') stepBy(1)
      else if (e.key === 'ArrowLeft') stepBy(-1)
      else if (e.key === 'Home') focusIndex(0)
      else if (e.key === 'End') focusIndex(n - 1)
      else return
      e.preventDefault()
    }

    // horizontal trackpad scroll spins the ring
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      const { R, step } = geo()
      const perPixel = 180 / (Math.PI * R * state.fit)
      state.target = null
      state.angle -= e.deltaX * perPixel
      state.velocity = -e.deltaX * perPixel * 30
      state.holdUntil = performance.now() + 1600
      clearTimeout(state.wheelTimer)
      state.wheelTimer = setTimeout(() => {
        state.target = nearest(state.angle + state.velocity * 0.12, step)
        wake()
      }, 140)
      wake()
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
        state.last = 0
      } else wake()
    }

    const listen = (type, fn, opts) => {
      root.addEventListener(type, fn, opts)
      undo.push(() => root.removeEventListener(type, fn, opts))
    }
    listen('pointerdown', onPointerDown)
    listen('pointermove', onPointerMove)
    listen('pointerup', onPointerUp)
    listen('pointercancel', onPointerUp)
    listen('pointerenter', onPointerEnter)
    listen('pointerleave', onPointerLeave)
    listen('click', onClick)
    listen('keydown', onKeyDown)
    listen('wheel', onWheel, { passive: false })
    document.addEventListener('visibilitychange', onVisibility)
    undo.push(() => document.removeEventListener('visibilitychange', onVisibility))

    /* ----- Observers ----- */
    const resize = new ResizeObserver(() => { measure(); wake() })
    resize.observe(root)
    undo.push(() => resize.disconnect())

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) wake()
      else {
        cancelAnimationFrame(raf)
        raf = 0
        state.last = 0
      }
    })
    io.observe(root)
    undo.push(() => io.disconnect())

    undo.push(() => {
      cancelAnimationFrame(raf)
      clearTimeout(state.wheelTimer)
    })

    // re-measure when sizing options or the item list change
    const stopWatch = watch(
      () => {
        const o = getOpts()
        return [o.items.length, o.cardWidth, o.aspectRatio, o.gap, o.tilt, o.perspective, o.captions, o.spread].join()
      },
      () => nextTick(() => { measure(); wake() }),
    )
    undo.push(stopWatch)

    /* ----- Start: wait for images (or 2.4s), then play the intro ----- */
    measure()
    render(geo(), performance.now())

    const load = (src) =>
      new Promise((resolve) => {
        const img = new Image()
        img.decoding = 'async'
        img.onload = () => (img.decode ? img.decode().then(resolve, resolve) : resolve())
        img.onerror = resolve
        img.src = src
      })
    const sources = getOpts().items.slice(0, 16).map((item) => item.src)
    Promise.race([
      Promise.all(sources.map(load)),
      new Promise((resolve) => setTimeout(resolve, 2400)),
    ]).then(() => {
      if (disposed) return
      state.introDone = false
      state.intro = null
      ready.value = true
      measure()
      wake()
    })
  })

  onBeforeUnmount(() => {
    disposed = true
    undo.forEach((fn) => fn())
    undo.length = 0
  })

  return { active, ready, dragging }
}