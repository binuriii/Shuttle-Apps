// FoldText.js - fold animation engine (port of React Bits <FoldText /> for Vue 3)
// Needs: npm i gsap
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const HINGES = {
  top: { origin: '50% 0%', axis: 'rotateX', sign: -1 },
  bottom: { origin: '50% 100%', axis: 'rotateX', sign: 1 },
  left: { origin: '0% 50%', axis: 'rotateY', sign: 1 },
  right: { origin: '100% 50%', axis: 'rotateY', sign: -1 },
}

const SLATS = {
  rotateX: {
    origins: ['50% 25%', '50% 75%'],
    clips: ['inset(-40% -20% 50% -20%)', 'inset(50% -20% -40% -20%)'],
  },
  rotateY: {
    origins: ['25% 50%', '75% 50%'],
    clips: ['inset(-40% 50% -40% -20%)', 'inset(-40% -20% -40% 50%)'],
  },
}

export const FOLD_STYLES = ['paper', 'blinds', 'flip']
const SLAT_DELAY = 0.24

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/* Splits the text into tokens the template renders:
   { type: 'group', wrap, pieces: [{ content, isLine }] } | { type: 'space', text } | { type: 'br' } */
export function buildTokens(text, splitBy) {
  const piece = (content, isLine = false) => ({ content, isLine })

  if (splitBy === 'line') {
    return text.split('\n').map((line) => ({
      type: 'group',
      wrap: false,
      pieces: [piece(line || '\u00A0', true)],
    }))
  }

  const out = []
  text.split(/(\s+)/).forEach((part) => {
    if (!part) return

    if (/^\s+$/.test(part)) {
      part.split('\n').forEach((spaces, lineIndex) => {
        if (lineIndex > 0) out.push({ type: 'br' })
        if (spaces) out.push({ type: 'space', text: spaces })
      })
      return
    }

    if (splitBy === 'word') {
      out.push({ type: 'group', wrap: false, pieces: [piece(part)] })
    } else {
      out.push({ type: 'group', wrap: true, pieces: Array.from(part).map((c) => piece(c)) })
    }
  })
  return out
}

/* Runs the animation on a rendered root element. Returns a cleanup function. */
export function setupFold(root, o) {
  const elements = Array.from(root.querySelectorAll('.fold-text-piece'))
  if (!elements.length) return () => {}

  const hingeConfig = HINGES[o.hinge] || HINGES.top
  const foldStyle = FOLD_STYLES.includes(o.foldStyle) ? o.foldStyle : 'paper'
  const crease0 = clamp(o.creaseShading, 0, 1)
  const angle0 = clamp(o.foldAngle, 0, 180)
  const safeStagger = Math.max(0, o.stagger)
  const safeDelay = Math.max(0, o.loopDelay)
  const safeRadius = Math.max(1, o.refoldRadius)
  const safeRefold = clamp(o.refoldAngle, 0, 180)
  const startsFolded = o.trigger !== 'hover'
  const trigger = o.trigger

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const { axis, sign, origin } = hingeConfig
  const slats = SLATS[axis]
  const unfoldEase = gsap.parseEase(reduceMotion ? 'power1.out' : o.ease) || gsap.parseEase('power3.out')
  const foldEase = gsap.parseEase(reduceMotion ? 'power1.in' : 'power2.in')
  const angle = reduceMotion ? 0 : foldStyle === 'flip' ? 180 : angle0
  const crease = reduceMotion ? 0 : crease0
  const refold = o.hoverRefold && !reduceMotion ? safeRefold : 0
  const lift = foldStyle === 'flip' && !reduceMotion ? 0.45 : 0
  const unfoldDuration = reduceMotion ? Math.min(o.duration, 0.22) : o.duration
  const staggerVars = { each: reduceMotion ? Math.min(safeStagger, 0.02) : safeStagger, from: o.staggerFrom }

  const pieces = elements.map((element) => {
    const parts = foldStyle === 'blinds' ? Array.from(element.children) : [element]
    if (foldStyle === 'blinds') {
      element.style.opacity = '1'
      parts.forEach((part, index) => {
        part.style.transformOrigin = slats.origins[index]
        if (index > 0) part.style.clipPath = slats.clips[index]
      })
    } else {
      element.style.transformOrigin = foldStyle === 'flip' ? '50% 50%' : origin
      element.style.backfaceVisibility = foldStyle === 'flip' ? 'visible' : ''
    }
    return { element, parts, t: startsFolded ? 0 : 1, f: 0, r: 0, aim: 0 }
  })

  const shade = (progress, tilt) => String(crease * clamp(1 - progress + tilt / 90, 0, 1))

  const render = () => {
    pieces.forEach((piece) => {
      const tilt = piece.r * refold

      if (foldStyle === 'blinds') {
        let resting = tilt < 0.05
        piece.parts.forEach((part, index) => {
          const offset = index * SLAT_DELAY
          const open = unfoldEase(clamp((piece.t - offset) / (1 - SLAT_DELAY), 0, 1))
          const close = foldEase(clamp((piece.f - offset) / (1 - SLAT_DELAY), 0, 1))
          const progress = open * (1 - close)
          if (Math.abs(1 - progress) > 0.002) resting = false
          part.style.transform = `${axis}(${sign * ((1 - progress) * angle + tilt)}deg)`
          part.style.opacity = String(clamp(progress, 0, 1))
          part.style.setProperty('--fold-crease', shade(progress, tilt))
        })
        piece.parts[0].style.clipPath = resting ? 'none' : slats.clips[0]
        piece.parts[1].style.visibility = resting ? 'hidden' : 'visible'
        return
      }

      const progress = unfoldEase(piece.t) * (1 - foldEase(piece.f))
      const rise = lift * Math.sin(Math.PI * clamp(progress, 0, 1))
      const turn = `${axis}(${sign * ((1 - progress) * angle + tilt)}deg)`
      piece.element.style.transform = rise > 0.001 ? `translateZ(${rise}em) ${turn}` : turn
      piece.element.style.opacity = String(clamp(progress, 0, 1))
      piece.element.style.setProperty('--fold-crease', shade(progress, tilt))
    })
  }

  let timeline = null
  let scrollTrigger = null

  const play = (loop) => {
    timeline?.kill()
    timeline = gsap.timeline({ onUpdate: render, ...(loop ? { repeat: -1, repeatDelay: 0.35 } : {}) })
    timeline.fromTo(pieces, { t: 0, f: 0 }, { t: 1, duration: unfoldDuration, ease: 'none', stagger: staggerVars })
    if (loop) {
      timeline.to(
        pieces,
        { f: 1, duration: unfoldDuration * 0.75, ease: 'none', stagger: staggerVars },
        `+=${safeDelay}`,
      )
    }
    render()
  }

  const handleEnter = () => play(false)

  if (trigger === 'hover') {
    render()
    root.addEventListener('mouseenter', handleEnter)
  } else if (trigger === 'scroll') {
    render()
    scrollTrigger = ScrollTrigger.create({
      trigger: root,
      start: o.scrollStart || 'top 82%',
      once: true,
      onEnter: handleEnter,
    })
  } else {
    play(trigger === 'loop')
  }

  /* ---- hover refold: panels near the cursor fold partly away ---- */
  let pointer = null
  let centers = null
  let measured = null
  let relaxing = false

  const measure = (box) => {
    centers = pieces.map((piece) => {
      const rect = piece.element.parentElement.getBoundingClientRect()
      return { x: rect.left - box.left + rect.width / 2, y: rect.top - box.top + rect.height / 2 }
    })
    measured = { width: box.width, height: box.height }
  }

  const relax = (time, deltaTime) => {
    const step = Math.min(deltaTime, 64) / 1000
    let moving = false
    pieces.forEach((piece) => {
      const rate = piece.aim > piece.r ? 14 : 6
      piece.r += (piece.aim - piece.r) * (1 - Math.exp(-rate * step))
      if (Math.abs(piece.aim - piece.r) > 0.001) moving = true
      else piece.r = piece.aim
    })
    render()
    if (!moving) {
      gsap.ticker.remove(relax)
      relaxing = false
    }
  }

  const aim = () => {
    const box = root.getBoundingClientRect()
    const near =
      pointer &&
      pointer.x > box.left - safeRadius &&
      pointer.x < box.right + safeRadius &&
      pointer.y > box.top - safeRadius &&
      pointer.y < box.bottom + safeRadius
    if (near && (!centers || Math.abs(box.width - measured.width) + Math.abs(box.height - measured.height) > 1)) {
      measure(box)
    }
    let changed = false
    pieces.forEach((piece, index) => {
      let value = 0
      if (near) {
        const center = centers[index]
        const distance = Math.hypot(box.left + center.x - pointer.x, box.top + center.y - pointer.y) / safeRadius
        if (distance < 1) value = 1 - distance * distance * (3 - 2 * distance)
      }
      if (value !== piece.aim) changed = true
      piece.aim = value
    })
    if (changed && !relaxing) {
      relaxing = true
      gsap.ticker.add(relax)
    }
  }

  const handleMove = (event) => {
    pointer = { x: event.clientX, y: event.clientY }
    aim()
  }
  const handleLeave = () => {
    pointer = null
    aim()
  }
  const handleScroll = () => {
    if (pointer) aim()
  }

  if (refold) {
    window.addEventListener('pointermove', handleMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true })
    document.documentElement.addEventListener('pointerleave', handleLeave)
  }

  return () => {
    root.removeEventListener('mouseenter', handleEnter)
    window.removeEventListener('pointermove', handleMove)
    window.removeEventListener('scroll', handleScroll, { capture: true })
    document.documentElement.removeEventListener('pointerleave', handleLeave)
    gsap.ticker.remove(relax)
    scrollTrigger?.kill()
    timeline?.kill()
    gsap.killTweensOf(pieces)
  }
}