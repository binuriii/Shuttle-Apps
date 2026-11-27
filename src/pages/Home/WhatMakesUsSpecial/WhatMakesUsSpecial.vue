<template>
  <section ref="root" class="special" id="special" aria-labelledby="special-title">
    <!-- Headline + intro -->
    <header class="special-head">
      <div>
        <h2 id="special-title" class="special-title">{{ title }}</h2>
      </div>
      <p class="special-tagline">{{ intro }}</p>
    </header>

    <!-- Bento panel -->
    <div class="special-panel">
      <article
        v-for="item in features"
        :key="item.id"
        class="special-card"
        :class="['area-' + item.area]"
        @pointermove="onPointerMove"
      >
        <span class="special-num">{{ item.id }}</span>
        <div class="special-copy">
          <h3 class="special-card-title">{{ item.title }}</h3>
          <p class="special-card-text">{{ item.text }}</p>
        </div>
      </article>

      <!-- Decorative tile -->
      <div class="special-card special-visual area-d" aria-hidden="true">
        <svg viewBox="-100 -100 200 200" class="special-sphere">
          <circle
            v-for="(d, i) in dots"
            :key="i"
            :cx="d.x"
            :cy="d.y"
            :r="d.r"
          />
        </svg>
      </div>
    </div>
  </section>
</template>

<script src="./WhatMakesUsSpecial.js"></script>
<style src="./WhatMakesUsSpecial.css"></style>