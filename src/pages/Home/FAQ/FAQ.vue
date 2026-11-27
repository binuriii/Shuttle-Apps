<script setup>
import { faqContent, faqItems, useFaq } from './Faq.js'
import './Faq.css'

const props = defineProps({
  items: { type: Array, default: () => faqItems },
  content: { type: Object, default: () => faqContent },
  start: { type: Number, default: 0 }, // which answer is open first (-1 = none)
})

const { open, toggle } = useFaq(props.start)
</script>

<template>
  <section class="faq" id="faq" aria-labelledby="faq-title">
    <header class="faq-head">
      <h2 id="faq-title" class="faq-title">{{ content.heading }}</h2>
      <p class="faq-intro">{{ content.intro }}</p>
    </header>

    <div class="faq-body">
      <!-- Questions -->
      <div class="faq-list">
        <div
          v-for="(item, i) in items"
          :key="item.q"
          class="faq-item"
          :class="{ 'is-open': open === i }"
        >
          <h3 class="faq-q-wrap">
            <button
              type="button"
              class="faq-q"
              :id="`faq-q-${i}`"
              :aria-expanded="open === i"
              :aria-controls="`faq-a-${i}`"
              @click="toggle(i)"
            >
              <span>{{ item.q }}</span>
              <span class="faq-icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                  <path
                    d="M4 6.5 8 10.5 12 6.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </button>
          </h3>
          <div
            :id="`faq-a-${i}`"
            class="faq-a"
            role="region"
            :aria-labelledby="`faq-q-${i}`"
          >
            <div class="faq-a-inner">
              <p>{{ item.a }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact card -->
      <aside class="faq-aside">
        <div class="faq-card">
          <div>
            <h3 class="faq-card-title">{{ content.contact.title }}</h3>
            <p class="faq-card-text">{{ content.contact.text }}</p>
          </div>
          <a class="faq-card-link" :href="content.contact.href">
            {{ content.contact.label }}
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
      </aside>
    </div>
  </section>
</template>