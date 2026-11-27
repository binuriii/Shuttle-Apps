<script setup>
import { heroContent as c, heroColumns } from './Hero.js'
import './Hero.css'
</script>

<template>
  <section class="hero" id="home">
    <div class="hero-inner">
      <h1 class="hero-title">
        <span class="hero-line">
         {{ c.titleLine1 }}
        </span>
        <span class="hero-line">{{ c.titleLine2 }}</span>
      </h1>

      <p class="hero-desc">{{ c.description }}</p>
      <a :href="c.cta.href" class="hero-cta">{{ c.cta.label }}</a>
    </div>

    <div class="hero-grid" aria-hidden="true">
      <div
        v-for="(col, i) in heroColumns"
        :key="i"
        class="hero-col"
        :style="{ marginTop: col.offset + 'vh' }"
      >
        <figure v-for="img in col.images" :key="img.src" class="hero-card">
          <img :src="img.src" :alt="img.alt" loading="eager" />
        </figure>
      </div>
    </div>
  </section>
</template>