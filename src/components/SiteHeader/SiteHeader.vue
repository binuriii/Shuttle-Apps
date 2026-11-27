<script setup>
import { ref } from 'vue'
import { siteHeaderContent, useSiteHeader } from './SiteHeader.js'
import './SiteHeader.css'

const props = defineProps({
  content: { type: Object, default: () => siteHeaderContent },
})

const { active, menuOpen, goTo, goTop, toggleMenu } = useSiteHeader(
  () => ({ nav: props.content.nav }),
)

// if the logo image can't be loaded, show the placeholder mark + text instead
const logoFailed = ref(false)
</script>

<template>
  <header class="site-header" id="top">
    <div class="site-header-bar">
      <!-- Brand -->
      <a class="site-header-brand" :href="content.brand.href" @click="goTop">
        <img
          v-if="content.brand.logo && !logoFailed"
          class="site-header-logo"
          :src="content.brand.logo"
          :alt="content.brand.logoAlt || content.brand.label"
          decoding="async"
          @error="logoFailed = true"
        />
        <svg
          v-else
          class="site-header-mark"
          viewBox="0 0 24 24"
          width="26"
          height="26"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linejoin="round"
          />
          <path d="M12 3v18M4 7.5l8 4.5 8-4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
        </svg>
        <span v-if="content.brand.showLabel || logoFailed || !content.brand.logo">
          {{ content.brand.label }}
        </span>
      </a>

      <!-- Center nav (desktop) -->
      <nav class="site-header-nav" aria-label="Main">
        <ul class="site-header-list">
          <li v-for="item in content.nav" :key="item.id">
            <a
              class="site-header-link"
              :class="{ 'is-active': active === item.id }"
              :href="`#${item.id}`"
              :aria-current="active === item.id ? 'true' : null"
              @click="goTo($event, item.id)"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>

      <!-- CTA (desktop) -->
      <a class="site-header-cta" :href="content.cta.href">
        <span>{{ content.cta.label }}</span>
        <span class="site-header-cta-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
            <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </a>

      <!-- Burger (small screens) -->
      <button
        type="button"
        class="site-header-burger"
        :aria-expanded="menuOpen"
        aria-controls="site-header-panel"
        aria-label="Menu"
        @click="toggleMenu"
      >
        <span class="site-header-burger-lines" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
      </button>
    </div>

    <!-- Mobile panel -->
    <div id="site-header-panel" class="site-header-panel" :class="{ 'is-open': menuOpen }">
      <ul class="site-header-list">
        <li v-for="item in content.nav" :key="item.id">
          <a
            class="site-header-link"
            :class="{ 'is-active': active === item.id }"
            :href="`#${item.id}`"
            :tabindex="menuOpen ? 0 : -1"
            @click="goTo($event, item.id)"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
      <a class="site-header-cta" :href="content.cta.href" :tabindex="menuOpen ? 0 : -1">
        <span>{{ content.cta.label }}</span>
        <span class="site-header-cta-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
            <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </a>
    </div>
  </header>
</template>