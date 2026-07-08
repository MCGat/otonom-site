<template>
  <div class="login">
    <span class="kicker">Back-office</span>
    <h1>Connexion admin</h1>
    <p class="muted">Accès réservé à l'équipe OTONOM.</p>
    <form class="login-form" novalidate @submit.prevent="onSubmit">
      <div class="field">
        <label for="pwd">Mot de passe</label>
        <input id="pwd" v-model="password" type="password" autocomplete="current-password" autofocus required>
      </div>
      <button type="submit" class="btn btn--primary btn--block btn--lg" :disabled="loading">{{ loading ? 'Connexion…' : 'Se connecter' }}</button>
      <p v-if="error" class="login-error" role="alert">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Admin — OTONOM', robots: 'noindex, nofollow' })

const { fetch: refreshSession, loggedIn } = useUserSession()
const password = ref('')
const loading = ref(false)
const error = ref('')

// Déjà connecté → vers le tableau de bord
watchEffect(() => { if (loggedIn.value) navigateTo('/admin') })

async function onSubmit() {
  if (loading.value) return
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { password: password.value } })
    await refreshSession()
    await navigateTo('/admin')
  } catch (e: any) {
    error.value = e?.statusMessage || e?.data?.statusMessage || 'Connexion impossible.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login { max-width: 420px; margin: clamp(30px, 8vh, 90px) auto; }
.login .kicker { font-family: var(--ff-mono); font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); }
.login h1 { font-size: clamp(28px, 4vw, 40px); margin: 14px 0 8px; }
.login .muted { color: var(--muted); font-size: 15px; }
.login-form { margin-top: 28px; display: grid; gap: 18px; }
.login-error { font-size: 13.5px; color: var(--ink-soft); border-left: 2px solid var(--ink); padding-left: 12px; line-height: 1.5; }
</style>
