<script setup>
import { ref } from 'vue'
import { aboutContent, usePhoneTilt, useScrollRise } from './About.js'
import './About.css'

defineProps({
  // Files in /public are served from the site root.
  // Spaces in the filename must be written as %20.
  image: {
    type: String,
    default: `${import.meta.env.BASE_URL}assests/HandHoldingShuttleAppsSmartphone.png`,
  },
  content: { type: Object, default: () => aboutContent },
})

const root = ref(null)
const stage = ref(null)
usePhoneTilt(stage)
useScrollRise(root)
</script>

<template>
  <section ref="root" class="about" id="about" aria-labelledby="about-title">
    <div class="about-rings" aria-hidden="true"></div>

    <header class="about-head">
      <h2 id="about-title" class="about-title">
        <span class="about-line">{{ content.title.strong }}</span>
        <span class="about-line about-muted">{{ content.title.muted }}</span>
      </h2>

      <p class="about-tagline">
        <span class="about-line">{{ content.tagline.strong }}</span>
        <span class="about-line about-muted">{{ content.tagline.muted }}</span>
      </p>
    </header>

    <div ref="stage" class="about-stage">
      <div class="about-device">
        <img
          class="about-image"
          :src="image"
          alt="A hand holding a smartphone running a Shuttle Apps app"
          draggable="false"
        />
      </div>
    </div>

    <aside class="about-caption">
      <span class="about-caption-icon" aria-hidden="true"></span>
      <div>
        <p class="about-caption-label">{{ content.caption.label }}</p>
        <p class="about-caption-text">{{ content.caption.text }}</p>
      </div>
    </aside>
  </section>
</template>