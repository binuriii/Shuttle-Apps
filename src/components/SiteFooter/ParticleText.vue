<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from 'vue'

import { setupParticleText } from './ParticleText.js'
import './ParticleText.css'

const props = defineProps({
  text: {
    type: String,
    default: 'SHUTTLE',
  },

  particleSize: {
    type: Number,
    default: 2,
  },

  density: {
    type: Number,
    default: 3,
  },

  color: {
    type: String,
    default: 'currentColor',
  },

  highlightColor: {
    type: String,
    default: '#bcbcbc',
  },

  highlightMode: {
    type: String,
    default: 'motion',
  },

  shape: {
    type: String,
    default: 'circle',
  },

  intro: {
    type: String,
    default: 'gather',
  },

  scatter: {
    type: Number,
    default: 180,
  },

  gatherDuration: {
    type: Number,
    default: 1600,
  },

  stagger: {
    type: Number,
    default: 420,
  },

  trigger: {
    type: String,
    default: 'mount',
  },

  clickBurst: {
    type: Boolean,
    default: true,
  },

  burstStrength: {
    type: Number,
    default: 1,
  },

  pointerRepel: {
    type: Number,
    default: 40,
  },

  repelRadius: {
    type: Number,
    default: 120,
  },

  idleDrift: {
    type: Number,
    default: 0.7,
  },

  fontSize: {
    type: [Number, String],
    default: '21vw',
  },

  fontWeight: {
    type: [Number, String],
    default: 300,
  },

  fontFamily: {
    type: String,
    default: 'inherit',
  },

  glow: {
    type: Boolean,
    default: true,
  },

  replayOnScroll: {
    type: Boolean,
    default: true,
  },
})

const containerRef = ref(null)
const canvasRef = ref(null)

let cleanup = null
let mounted = false

function init() {
  cleanup?.()

  if (!mounted || !containerRef.value || !canvasRef.value) {
    return
  }

  cleanup = setupParticleText(
    containerRef.value,
    canvasRef.value,
    { ...props }
  )
}

onMounted(() => {
  mounted = true
  init()
})

watch(
  () => ({ ...props }),
  () => nextTick(init)
)

onBeforeUnmount(() => {
  mounted = false
  cleanup?.()
})
</script>

<template>
  <div ref="containerRef" class="particle-text">
    <canvas
      ref="canvasRef"
      class="particle-text__canvas"
      aria-hidden="true"
    />

    <span class="particle-text__sr">
      {{ text }}
    </span>
  </div>
</template>