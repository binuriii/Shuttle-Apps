<script setup>
import { ref } from 'vue'
import { showcaseContent, showcaseItems, useShowcase, useReveal } from './AppShowcase.js'
import './AppShowcase.css'

const props = defineProps({
  items: { type: Array, default: () => showcaseItems },
  content: { type: Object, default: () => showcaseContent },
  start: { type: Number, default: 0 }, // which app is in the center first
})

// simple reveal: adds "is-visible" to the section when it scrolls into view
const root = ref(null)
useReveal(root)

const { active, current, styleOf, go, onDown, onUp, onItemClick, onKey } = useShowcase(
  () => ({ items: props.items, start: props.start }),
)
</script>

<template>
  <section ref="root" class="showcase" id="showcase" aria-labelledby="showcase-title">
    <header class="showcase-head">
      <h2 id="showcase-title" class="showcase-title">{{ content.heading }}</h2>
      <p class="showcase-sub">{{ content.subheading }}</p>
    </header>

    <div
      class="showcase-stage"
      role="group"
      aria-roledescription="carousel"
      aria-label="Our apps"
      tabindex="0"
      @keydown="onKey"
      @pointerdown="onDown"
      @pointerup="onUp"
    >
      <button
        v-for="(item, i) in items"
        :key="item.title"
        type="button"
        class="showcase-item"
        :class="{ 'is-active': i === active }"
        :style="styleOf(i)"
        :aria-label="`${item.title}, ${item.subtitle}`"
        :aria-current="i === active ? 'true' : null"
        :tabindex="i === active ? -1 : 0"
        @click="onItemClick(i)"
      >
        <img :src="item.src" alt="" draggable="false" decoding="async" />
      </button>
    </div>

    <div v-if="current" class="showcase-info">
      <div :key="active" class="showcase-meta">
        <h3 class="showcase-name">{{ current.title }}</h3>
        <p class="showcase-cat">{{ current.subtitle }}</p>
        <a
          class="showcase-link"
          :href="current.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          View app
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path
              d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </a>
      </div>

      <div class="showcase-dots" role="tablist" aria-label="Choose an app">
        <button
          v-for="(item, i) in items"
          :key="item.title"
          type="button"
          role="tab"
          class="showcase-dot"
          :class="{ 'is-active': i === active }"
          :aria-selected="i === active"
          :aria-label="item.title"
          @click="go(i)"
        ></button>
      </div>
    </div>
  </section>
</template>