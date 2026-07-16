<template>
  <div class="admin">
    <header class="admin-bar">
      <div class="admin-bar-in">
        <NuxtLink to="/admin" class="admin-brand" aria-label="OTONOM — admin"><OtonomLogo /><span>Admin</span></NuxtLink>
        <div class="admin-bar-actions">
          <NuxtLink to="/" class="admin-link">Voir le site ↗</NuxtLink>
          <button v-if="loggedIn" type="button" class="btn btn--ghost admin-logout" @click="onLogout">Déconnexion</button>
        </div>
      </div>
    </header>

    <nav v-if="loggedIn" class="admin-tabs">
      <div class="admin-tabs-in">
        <NuxtLink to="/admin" :class="{ active: isLeads }">Formulaires &amp; leads</NuxtLink>
        <NuxtLink to="/admin/blog" :class="{ active: isBlog }">Blog</NuxtLink>
        <NuxtLink to="/admin/pages" :class="{ active: isPages }">Pages &amp; indexation</NuxtLink>
      </div>
    </nav>

    <main id="main" class="admin-main"><slot /></main>
  </div>
</template>

<script setup lang="ts">
const { loggedIn, clear } = useUserSession()
const route = useRoute()
const isBlog = computed(() => route.path.startsWith('/admin/blog'))
const isPages = computed(() => route.path.startsWith('/admin/pages'))
const isLeads = computed(() => route.path === '/admin')

// Sécurité : l'admin n'a pas de PageLoader. Si la classe `has-loader` traînait
// (ex. arrivée depuis le site pendant le préloader), son `overflow:hidden`
// bloquerait le scroll de l'admin. Personne d'autre ne viendrait la retirer.
onMounted(() => document.documentElement.classList.remove('has-loader'))

async function onLogout() {
  await $fetch('/api/admin/logout', { method: 'POST' })
  await clear()
  await navigateTo('/admin/login')
}
</script>

<style scoped>
.admin { min-height: 100vh; background: var(--bg); }
.admin-bar { position: sticky; top: 0; z-index: 20; background: var(--bg-1); border-bottom: 1px solid var(--line); }
.admin-bar-in { max-width: 1140px; margin: 0 auto; padding: 0 clamp(20px, 5vw, 40px); height: 64px; display: flex; align-items: center; justify-content: space-between; }
.admin-brand { display: flex; align-items: center; gap: 12px; color: var(--ink); }
.admin-brand :deep(.logo) { height: 17px; width: auto; }
.admin-brand span { font-family: var(--ff-mono); font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
.admin-bar-actions { display: flex; align-items: center; gap: 18px; }
.admin-link { font-family: var(--ff-mono); font-size: 12.5px; letter-spacing: .04em; color: var(--muted); }
.admin-link:hover { color: var(--ink); }
.admin-logout { padding: 9px 16px; font-size: 13px; }

.admin-tabs { position: sticky; top: 64px; z-index: 19; background: var(--bg-1); border-bottom: 1px solid var(--line); }
.admin-tabs-in { max-width: 1140px; margin: 0 auto; padding: 0 clamp(20px, 5vw, 40px); display: flex; gap: 26px; }
.admin-tabs a { position: relative; padding: 15px 2px; font-size: 14px; color: var(--muted); }
.admin-tabs a:hover { color: var(--ink); }
.admin-tabs a.active { color: var(--ink); }
.admin-tabs a.active::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--ink); }

.admin-main { max-width: 1140px; margin: 0 auto; padding: clamp(28px, 5vw, 52px) clamp(20px, 5vw, 40px); }
</style>
