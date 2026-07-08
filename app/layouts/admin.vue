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
    <main id="main" class="admin-main"><slot /></main>
  </div>
</template>

<script setup lang="ts">
const { loggedIn, clear } = useUserSession()
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
.admin-main { max-width: 1140px; margin: 0 auto; padding: clamp(28px, 5vw, 52px) clamp(20px, 5vw, 40px); }
</style>
