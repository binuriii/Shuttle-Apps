// AppShowcase.js - content + selection logic + simple scroll reveal for the app showcase strip
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/* ---------- Copy: edit freely ---------- */
export const showcaseContent = {
  heading: 'Every app, one tap away.',
  subheading: 'Pick a screen to open the app.',
}

/* ---------- Your apps ----------
   src  : image in public/assests/ (MobileUI1.png … MobileUI8.png)
   href : link opened by the "View app" button (App Store, website, case study...)
   Titles are matched to the screens seen in your screenshots; rename freely. */
const shot = (n) => `${import.meta.env.BASE_URL}assests/MobileUI${n}.png`

export const showcaseItems = [
  { src: shot(2), title: 'WaveMusic',        subtitle: 'Music',        href: '#' },
  { src: shot(3), title: 'Explore Thailand', subtitle: 'Travel',       href: '#' },
  { src: shot(4), title: 'Mindora',          subtitle: 'Wellness',     href: '#' },
  { src: shot(5), title: 'ShopDeals',        subtitle: 'Shopping',     href: '#' },
  { src: shot(6), title: 'FocusPlan',        subtitle: 'Productivity', href: '#' },
  { src: shot(7), title: 'PetPals',          subtitle: 'Community',    href: '#' },
  { src: shot(8), title: 'SaveWise',         subtitle: 'Finance',      href: '#' },
]

/* ---------- Layout tuning ----------
   Index = distance from the center card (0 = center). */
const X = [0, 330, 520, 660]        // px from center (scaled by --k on small screens)
const SCALE = [1, 0.62, 0.5, 0.4]   // card size
const BRIGHT = [1, 0.6, 0.45, 0.35] // dimming of side cards
const SHOWN = 3                     // how many cards to show on each side
const SWIPE_DISTANCE = 50           // px needed to count as a swipe

/* ---------- Scroll reveal ----------
   Adds the class "is-visible" to the section once it scrolls into view.
   The CSS fades and lifts the heading, phones and info in, one after another. */
export function useReveal(elRef) {
  let observer = null

  onMounted(() => {
    const el = elRef.value
    if (!el) return
    const show = () => el.classList.add('is-visible')

    // no observer support: just show it
    if (!('IntersectionObserver' in window)) {
      show()
      return
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        show()
        observer.disconnect() // play once
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
  })

  onBeforeUnmount(() => observer?.disconnect())
}

/**
 * @param getOpts () => ({ items, start })
 */
export function useShowcase(getOpts) {
  const active = ref(getOpts().start || 0)
  const n = computed(() => getOpts().items.length)
  const current = computed(() => getOpts().items[active.value])

  /* Position of a card relative to the active one: 0 = center, ±1 = next to it ... */
  const offsetOf = (i) => {
    let d = (((i - active.value) % n.value) + n.value) % n.value
    if (d > n.value / 2) d -= n.value
    return d
  }

  const styleOf = (i) => {
    const d = offsetOf(i)
    const a = Math.abs(d)
    const k = Math.min(a, SHOWN)
    return {
      '--x': `${Math.sign(d) * X[k]}px`,
      '--s': SCALE[k],
      '--b': BRIGHT[k],
      '--o': a <= SHOWN ? 1 : 0,
      zIndex: 10 - a,
    }
  }

  const go = (i) => { active.value = ((i % n.value) + n.value) % n.value }
  const step = (d) => go(active.value + d)

  /* Swipe / drag on the stage */
  let startX = 0
  let suppress = false

  const onDown = (e) => {
    startX = e.clientX
    suppress = false
  }

  const onUp = (e) => {
    const dx = e.clientX - startX
    if (Math.abs(dx) > SWIPE_DISTANCE) {
      step(dx < 0 ? 1 : -1)
      suppress = true
      setTimeout(() => { suppress = false }, 0)
    }
  }

  const onItemClick = (i) => {
    if (!suppress) go(i)
  }

  const onKey = (e) => {
    if (e.key === 'ArrowRight') step(1)
    else if (e.key === 'ArrowLeft') step(-1)
    else return
    e.preventDefault()
  }

  return { active, current, styleOf, go, step, onDown, onUp, onItemClick, onKey }
}