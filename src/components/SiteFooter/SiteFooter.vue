<script setup>
import { footerContent } from './SiteFooter.js'
import FoldText from './FoldText.vue'
import './SiteFooter.css'

const props = defineProps({
  content: { type: Object, default: () => footerContent },
})

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer" aria-label="Shuttle Apps footer">
    <!-- Links + about text -->
    <div class="footer-top">
      <nav class="footer-links" aria-label="Footer">
        <a v-for="item in content.left" :key="item.href" :href="item.href">{{ item.label }}</a>
      </nav>

      <p class="footer-about">{{ content.about }}</p>

      <nav class="footer-links footer-links--right" aria-label="Footer, more">
        <a v-for="item in content.right" :key="item.href" :href="item.href">{{ item.label }}</a>
        <a :href="`mailto:${content.email}`">{{ content.email }}</a>
      </nav>
    </div>

    <!-- Big wordmark: folds open like paper when the footer scrolls into view -->
    <div class="footer-mark">
      <FoldText
        :text="content.brand"
        fold-style="paper"
        split-by="char"
        hinge="top"
        trigger="scroll"
        scroll-start="top 92%"
        :fold-angle="92"
        :duration="0.9"
        :stagger="0.07"
        stagger-from="start"
        ease="power3.out"
        :perspective="900"
        :crease-shading="0.55"
        :hover-refold="true"
        :refold-radius="260"
        :refold-angle="55"
        font-size="var(--ft-mark-size)"
        :font-weight="300"
      />
    </div>

    <!-- Bottom bar -->
    <div class="footer-bottom">
      <p>© {{ year }} {{ content.company }}</p>
      <p class="footer-tagline">{{ content.tagline }}</p>
      <span class="footer-plus" aria-hidden="true">+</span>
    </div>
  </footer>
</template>