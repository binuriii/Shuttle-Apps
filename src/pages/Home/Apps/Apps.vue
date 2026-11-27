<script setup>
import { ref, computed } from 'vue'
import { appsContent, appsItems, useAppsCarousel } from './Apps.js'
import './Apps.css'

const props = defineProps({
  items: { type: Array, default: () => appsItems },
  content: { type: Object, default: () => appsContent },
  cardWidth: { type: Number, default: 190 },       // px, one phone screen
  aspectRatio: { type: Number, default: 9 / 19.5 }, // width / height of a screenshot
  gap: { type: Number, default: 28 },              // px between neighbouring screens
  spread: { type: Number, default: 1.8 },          // ring size multiplier: higher = cards further apart
  tilt: { type: Number, default: -6 },             // camera angle, negative looks down
  perspective: { type: Number, default: 2200 },    // lower = more depth
  speed: { type: Number, default: 10 },            // drift speed, degrees per second
  autoplay: { type: Boolean, default: true },
  captions: { type: Boolean, default: true },
  depthFade: { type: Number, default: 0.55 },      // how much far cards fade into the background
  parallax: { type: Number, default: 0.3 },        // how much the ring leans toward the pointer
})

const root = ref(null)
const stage = ref(null)
const camera = ref(null)
const ring = ref(null)
const cards = []

const { active, ready, dragging } = useAppsCarousel(
  { root, stage, camera, ring, cards },
  () => ({
    items: props.items,
    cardWidth: props.cardWidth,
    aspectRatio: props.aspectRatio,
    gap: props.gap,
    spread: props.spread,
    tilt: props.tilt,
    perspective: props.perspective,
    speed: props.speed,
    autoplay: props.autoplay,
    captions: props.captions,
    depthFade: props.depthFade,
    parallax: props.parallax,
  }),
)

const current = computed(() => props.items[active.value] || props.items[0])
const pad = (n) => String(n).padStart(2, '0')
const hide = (e) => { e.target.style.visibility = 'hidden' }
</script>

<template>
  <section class="apps" id="apps" aria-labelledby="apps-title">
    <header class="apps-head">
      <h2 id="apps-title" class="apps-title">
        <span class="apps-line">{{ content.title.strong }}</span>
        <span class="apps-line apps-muted">{{ content.title.muted }}</span>
      </h2>

      <p class="apps-tagline">
        <span class="apps-line">{{ content.tagline.strong }}</span>
        <span class="apps-line apps-muted">{{ content.tagline.muted }}</span>
      </p>
    </header>

    <div
      ref="root"
      class="apps-carousel"
      :data-ready="ready ? '' : null"
      :data-dragging="dragging ? '' : null"
      role="region"
      aria-roledescription="carousel"
      aria-label="iOS apps we have built"
      tabindex="0"
    >
      <div ref="stage" class="apps-stage">
        <div ref="camera" class="apps-camera">
          <div ref="ring" class="apps-ring">
            <div
              v-for="(item, i) in items"
              :key="i"
              :ref="(el) => (cards[i] = el)"
              class="apps-card"
              :data-index="i"
              :style="{ '--hue': item.hue ?? (i * 47 + 18) }"
              role="group"
              aria-roledescription="slide"
              :aria-label="`${item.title}, ${i + 1} of ${items.length}`"
            >
              <div class="apps-face">
                <img :src="item.src" alt="" draggable="false" decoding="async" @error="hide" />
                <span class="apps-shade"></span>
              </div>
              <!-- inside of the card, seen through the back of the ring -->
              <div class="apps-face apps-face--back">
                <img :src="item.src" alt="" draggable="false" decoding="async" @error="hide" />
                <span class="apps-inner"></span>
                <span class="apps-shade"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="captions && current" class="apps-caption" aria-hidden="true">
        <span :key="active" class="apps-caption-title">
          {{ current.title }}
          <span v-if="current.subtitle" class="apps-caption-sub">{{ current.subtitle }}</span>
        </span>
        <span class="apps-caption-count">{{ pad(active + 1) }} / {{ pad(items.length) }}</span>
      </div>

      <div class="apps-live" aria-live="polite" aria-atomic="true">
        {{ current ? `${current.title}, ${active + 1} of ${items.length}` : '' }}
      </div>
    </div>
  </section>
</template>