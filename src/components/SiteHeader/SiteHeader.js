// SiteHeader.js — content + scroll-spy / mobile menu logic
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

/* ---------- Copy: edit freely ----------
   Each nav item scrolls to the element whose id matches `id`.
   Make sure your sections have these ids:
     <section id="about">  <section id="apps">  <section id="special">
     <section id="faq">    <section id="careers"> */
export const siteHeaderContent = {
  brand: {
    label: 'Shuttle Apps',
    href: '#top',
    // Your logo file, placed in  public/assests/  (change the file name to match yours).
    // If the file is missing, the header falls back to the placeholder mark + label.
    logo: `${import.meta.env.BASE_URL}assests/Logo.png`,
    logoAlt: 'Shuttle Apps',
    showLabel: true,  // true = show "Shuttle Apps" next to the logo image
  },
  nav: [
    { label: 'About', id: 'about' },
    { label: 'What makes us special', id: 'special' },
    { label: 'Apps', id: 'showcase' },
    { label: 'FAQ', id: 'faq' },
    { label: 'Careers', id: 'careers' },
  ],
  cta: { label: 'Get in touch', href: '#' }, // set a real link (mailto:, contact page...)
}

const MOBILE_QUERY = '(max-width: 1100px)'

/**
 * @param getOpts () => ({ nav })
 */
export function useSiteHeader(getOpts) {
  const active = ref(null)     // id of the section currently in view
  const menuOpen = ref(false)  // mobile menu

  let mq = null
  let raf = 0
  const timers = []

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ----- Scroll spy -----
     Looks the sections up on every update (not once at mount), so sections that
     render later or are wrapped in other components are still found.
     A section is active while it covers the middle of the viewport. */
  const update = () => {
    raf = 0
    const mid = window.innerHeight * 0.5
    let best = null
    let bestTop = -Infinity
    getOpts().nav.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.top <= mid && r.bottom > mid && r.top > bestTop) {
        best = id
        bestTop = r.top
      }
    })
    active.value = best
  }

  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }

  /* ----- Smooth scroll to a section (falls back to the normal #hash jump) ----- */
  const goTo = (e, id) => {
    const el = id ? document.getElementById(id) : null
    menuOpen.value = false
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' })
    active.value = id
  }

  const goTop = (e) => {
    menuOpen.value = false
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' })
  }

  const toggleMenu = () => { menuOpen.value = !menuOpen.value }
  const closeMenu = () => { menuOpen.value = false }

  const onKey = (e) => { if (e.key === 'Escape') closeMenu() }
  const onMq = (e) => { if (!e.matches) closeMenu() }

  /* lock page scroll while the mobile menu is open */
  watch(menuOpen, (open) => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
  })

  onMounted(() => {
    update()
    // run again shortly after load, in case sections render late
    timers.push(setTimeout(update, 400), setTimeout(update, 1500))
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('load', onScroll)
    mq = window.matchMedia(MOBILE_QUERY)
    mq.addEventListener('change', onMq)
    window.addEventListener('keydown', onKey)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    timers.forEach(clearTimeout)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    window.removeEventListener('load', onScroll)
    mq?.removeEventListener('change', onMq)
    window.removeEventListener('keydown', onKey)
    document.documentElement.style.overflow = ''
  })

  return { active, menuOpen, goTo, goTop, toggleMenu, closeMenu }
}