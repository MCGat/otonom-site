<template>
  <svg class="caret" :class="{ active }" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
    <path v-if="!active || dir === 'desc'" d="M6 9l6 6 6-6" />
    <path v-else d="M6 15l6-6 6 6" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{ active?: boolean; dir?: 'asc' | 'desc' }>()
</script>

<style scoped>
.caret { opacity: .3; vertical-align: middle; }
.caret.active { opacity: 1; }
</style>
