<script setup>
import AppHeader from './components/SiteHeader/SiteHeader.vue'
import SiteFooter from './components/SiteFooter/SiteFooter.vue'
</script>

<template>
  <AppHeader />
  <main><router-view /></main>
  <SiteFooter />
</template>
