<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { TypeWriterContent as c } from './TypeWriter.js'
import './TypeWriter.css'

const root = ref(null)
const typed = ref(0)
const finished = ref(false)

const fullText = c.segments.map((s) => s.text).join('')
const total = fullText.length
const reduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// slice each segment so the serif styling is kept while typing
const liveSegments = computed(() => {
  let left = typed.value
  return c.segments.map((s) => {
    const text = s.text.slice(0, Math.max(left, 0))
    left -= s.text.length
    return { ...s, text }
  })
})

let ticking = false

function update() {
  ticking = false
  if (reduced) {
    typed.value = total
    finished.value = true
    return
  }
  const el = root.value
  if (!el) return
  const vh = window.innerHeight
  const rect = el.getBoundingClientRect()

  // starts when the section top reaches mid-screen, ends when the pin releases
  const range = rect.height - vh * 0.5
  const progress = Math.min(Math.max((vh * 0.5 - rect.top) / range, 0), 1)

  // typing completes at 75% so the finished text rests on screen for a moment
  const typing = Math.min(progress / 0.75, 1)
  typed.value = Math.round(typing * total)
  finished.value = typing >= 1
}

function onScroll() {
  if (!ticking) {
    ticking = true
    requestAnimationFrame(update)
  }
}

onMounted(() => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <section ref="root" class="typewriter-section" id="typewriter">
    <p class="sr-only">{{ fullText }}</p>

    <div class="pin">
      <div class="typewriter" aria-hidden="true">
        <!-- invisible full text reserves the final height, so nothing jumps -->
        <p class="ghost">
          <span v-for="(s, i) in c.segments" :key="i" :class="s.cls">{{ s.text }}</span>
        </p>

        <!-- visible typed text sits on top -->
        <p class="live">
          <span v-for="(s, i) in liveSegments" :key="i" :class="s.cls">{{ s.text }}</span><span class="caret" :class="{ finished }"></span>
        </p>
      </div>
    </div>
  </section>
</template>