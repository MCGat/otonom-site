<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Indexation pilotée depuis l'admin : le meta robots est posé ici, au rendu
// serveur, à partir de la SEULE source de vérité (table page_settings).
// Les règles métier sont calculées côté serveur ; on ne fait qu'appliquer les préfixes.
const route = useRoute()
const { data: rules } = await useFetch<{ prefixes: string[] }>('/api/page-settings', {
  key: 'page-index-rules',
  default: () => ({ prefixes: [] as string[] })
})

const noindex = computed(() => {
  const prefixes = rules.value?.prefixes || []
  let p = route.path.split('?')[0].split('#')[0].toLowerCase()
  if (p.length > 1) p = p.replace(/\/+$/, '')
  if (!p) p = '/'
  return prefixes.some((pre) => p === pre || p.startsWith(pre + '/'))
})

useHead({
  meta: computed(() => (noindex.value ? [{ name: 'robots', content: 'noindex, nofollow' }] : []))
})
</script>
