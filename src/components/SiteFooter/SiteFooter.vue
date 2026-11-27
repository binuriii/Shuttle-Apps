<script setup>
import { footerContent } from './SiteFooter.js'
import ParticleText from './ParticleText.vue'
import './SiteFooter.css'

const props = defineProps({
  content: {
    type: Object,
    default: () => footerContent,
  },
})

const year = new Date().getFullYear()
</script>

<template>
  <footer
    class="footer"
    aria-label="Shuttle Apps footer"
  >
    <!-- Links + about text -->
    <div class="footer-top">
      <nav
        class="footer-links"
        aria-label="Footer"
      >
        <a
          v-for="item in content.left"
          :key="item.href"
          :href="item.href"
        >
          {{ item.label }}
        </a>
      </nav>

      <p class="footer-about">
        {{ content.about }}
      </p>

      <nav
        class="footer-links footer-links--right"
        aria-label="Footer, more"
      >
        <a
          v-for="item in content.right"
          :key="item.href"
          :href="item.href"
        >
          {{ item.label }}
        </a>

        <a :href="`mailto:${content.email}`">
          {{ content.email }}
        </a>
      </nav>
    </div>

    <!-- SHUTTLE particle animation -->
    <div class="footer-mark">
      <ParticleText
        :text="content.brand"
        :particle-size="1.8"
        :density="3"
        color="#ffffff"
        highlight-color="#bcbcbc"
        highlight-mode="motion"
        shape="circle"
        intro="gather"
        :scatter="180"
        :gather-duration="1800"
        :stagger="420"
        :click-burst="true"
        :burst-strength="1"
        :pointer-repel="65"
        :repel-radius="150"
        :idle-drift="0.5"
        trigger="mount"
        font-size="var(--ft-mark-size)"
        :font-weight="300"
        font-family="inherit"
        :glow="true"
        :replay-on-scroll="true"
      />
    </div>

    <!-- Bottom bar -->
    <div class="footer-bottom">
      <p>© {{ year }} {{ content.company }}</p>

      <p class="footer-tagline">
        {{ content.tagline }}
      </p>

      <span
        class="footer-plus"
        aria-hidden="true"
      >
        +
      </span>
    </div>
  </footer>
</template>