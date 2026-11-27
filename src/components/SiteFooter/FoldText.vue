<script setup>
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { buildTokens, setupFold, HINGES, FOLD_STYLES } from './FoldText.js'
import './FoldText.css'

const props = defineProps({
  text: { type: String, default: 'Design unfolds' },
  splitBy: { type: String, default: 'char' },        // 'char' | 'word' | 'line'
  hinge: { type: String, default: 'top' },           // 'top' | 'bottom' | 'left' | 'right'
  foldStyle: { type: String, default: 'paper' },     // 'paper' | 'blinds' | 'flip'
  duration: { type: Number, default: 0.65 },
  stagger: { type: Number, default: 0.045 },
  staggerFrom: { type: String, default: 'start' },   // 'start' | 'center' | 'end' | 'edges' | 'random'
  foldAngle: { type: Number, default: 92 },
  ease: { type: String, default: 'power3.out' },
  perspective: { type: Number, default: 700 },
  creaseShading: { type: Number, default: 0.55 },
  trigger: { type: String, default: 'mount' },       // 'mount' | 'hover' | 'scroll' | 'loop'
  scrollStart: { type: String, default: 'top 82%' }, // ScrollTrigger start, used when trigger is 'scroll'
  loopDelay: { type: Number, default: 1.4 },
  hoverRefold: { type: Boolean, default: false },
  refoldRadius: { type: Number, default: 140 },
  refoldAngle: { type: Number, default: 45 },
  fontSize: { type: [String, Number], default: 80 },
  fontWeight: { type: [String, Number], default: 800 },
  color: { type: String, default: 'currentColor' },
})

const rootRef = ref(null)

const safeHinge = computed(() => (HINGES[props.hinge] ? props.hinge : 'top'))
const safeStyle = computed(() => (FOLD_STYLES.includes(props.foldStyle) ? props.foldStyle : 'paper'))
const startsFolded = computed(() => props.trigger !== 'hover')
const tokens = computed(() => buildTokens(props.text, props.splitBy))

const rootStyle = computed(() => ({
  '--fold-text-font-size': typeof props.fontSize === 'number' ? `${props.fontSize}px` : props.fontSize,
  '--fold-text-font-weight': props.fontWeight,
  '--fold-text-color': props.color,
  '--fold-perspective': `${Math.max(120, props.perspective)}px`,
}))

let cleanup = null
const init = () => {
  cleanup?.()
  cleanup = rootRef.value
    ? setupFold(rootRef.value, { ...props, hinge: safeHinge.value, foldStyle: safeStyle.value })
    : null
}

onMounted(init)
onBeforeUnmount(() => cleanup?.())

watch(
  () => [
    tokens.value, safeHinge.value, safeStyle.value, props.trigger, props.scrollStart,
    props.duration, props.stagger, props.staggerFrom, props.foldAngle, props.ease,
    props.creaseShading, props.loopDelay, props.hoverRefold, props.refoldRadius, props.refoldAngle,
  ],
  () => nextTick(init),
)
</script>

<template>
  <span ref="rootRef" class="fold-text" :style="rootStyle">
    <span class="fold-text-sr-only">{{ text }}</span>
    <span class="fold-text-visual" aria-hidden="true">
      <template v-for="(tok, i) in tokens" :key="i">
        <br v-if="tok.type === 'br'" />
        <template v-else-if="tok.type === 'space'">{{ tok.text }}</template>
        <span v-else :class="tok.wrap ? 'fold-text-word' : 'fold-text-group'">
          <span
            v-for="(p, j) in tok.pieces"
            :key="j"
            class="fold-text-segment"
            :data-fold-split="p.isLine ? 'line' : undefined"
          >
            <span
              v-if="safeStyle === 'blinds'"
              class="fold-text-piece"
              :data-fold-hinge="safeHinge"
              data-fold-style="blinds"
              :style="startsFolded ? { opacity: 0 } : undefined"
            >
              <span class="fold-text-slat" :data-fold-text="p.content">{{ p.content }}</span>
              <span class="fold-text-slat" data-fold-slat="b" :data-fold-text="p.content">{{ p.content }}</span>
            </span>
            <span
              v-else
              class="fold-text-piece"
              :data-fold-hinge="safeHinge"
              :data-fold-style="safeStyle"
              :data-fold-text="p.content"
              :style="startsFolded ? { opacity: 0 } : undefined"
            >{{ p.content }}</span>
          </span>
        </span>
      </template>
    </span>
  </span>
</template>