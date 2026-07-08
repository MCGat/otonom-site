<template>
  <section class="page-intro section--light"><div class="wrap">
    <span class="kicker reveal">Contact</span>
    <h1 class="reveal">Réservez votre diagnostic gratuit.</h1>
    <p class="lede reveal">Un échange court pour comprendre vos enjeux de flotte, de recharge et d'énergie, puis un plan chiffré. Confidentiel et sans engagement.</p>
  </div></section>

  <section class="section section--tight"><div class="wrap contact-grid">
    <div class="reveal">
      <div class="form-panel">
        <h3 style="margin-bottom:8px">Parlez-nous de votre projet</h3>
        <p class="muted" style="font-size:14.5px;margin-bottom:22px">Nous revenons vers vous sous 48&nbsp;h ouvrées.</p>

        <p v-if="error" class="form-alert">Une erreur est survenue lors de l'envoi. Vérifiez vos informations et réessayez, ou écrivez-nous à <a href="mailto:e.barlet@mc-groupe.com">e.barlet@mc-groupe.com</a>.</p>

        <form class="form" novalidate @submit.prevent="submit">
          <input v-model="f.honey" type="text" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="form-row">
            <div class="field"><label for="nom">Nom <span class="req">*</span></label><input id="nom" v-model="f.nom" type="text" autocomplete="name" required></div>
            <div class="field"><label for="entreprise">Entreprise</label><input id="entreprise" v-model="f.entreprise" type="text" autocomplete="organization"></div>
          </div>
          <div class="form-row">
            <div class="field"><label for="email">Email <span class="req">*</span></label><input id="email" v-model="f.email" type="email" autocomplete="email" required></div>
            <div class="field"><label for="tel">Téléphone</label><input id="tel" v-model="f.tel" type="tel" autocomplete="tel"></div>
          </div>
          <div class="field"><label for="flotte">Taille de flotte</label>
            <select id="flotte" v-model="f.flotte">
              <option value="">— Sélectionner —</option>
              <option>1 à 9 véhicules</option>
              <option>10 à 49 véhicules</option>
              <option>50 à 199 véhicules</option>
              <option>200 à 499 véhicules</option>
              <option>500 véhicules et plus</option>
              <option>Je ne sais pas encore</option>
            </select>
          </div>
          <div class="field"><label for="message">Votre besoin</label><textarea id="message" v-model="f.message" placeholder="Flotte, recharge, énergie, fiscalité… dites-nous en quelques mots."></textarea></div>
          <button class="btn btn--primary btn--lg btn--block" type="submit" :disabled="sending">
            {{ sending ? 'Envoi…' : 'Envoyer ma demande' }}
            <svg v-if="!sending" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <p class="consent">En envoyant ce formulaire, vous acceptez d'être recontacté par OTONOM au sujet de votre demande. Vos données restent confidentielles et ne sont pas revendues. Pour en savoir plus, consultez notre <NuxtLink to="/confidentialite" style="color:var(--ink);text-decoration:underline;text-underline-offset:2px">politique de confidentialité</NuxtLink>.</p>
        </form>
      </div>
    </div>

    <div class="reveal">
      <h3 style="font-family:var(--ff-display);font-size:22px;margin-bottom:22px">Ce que vous obtenez</h3>
      <ul class="reassure">
        <li><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg><span>Un diagnostic gratuit de votre flotte, de votre recharge et de votre facture d'énergie.</span></li>
        <li><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg><span>Un plan chiffré avec projection sur 3 ans, avant toute décision.</span></li>
        <li><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg><span>Un seul interlocuteur pour la fiscalité, la recharge, l'énergie et la coordination.</span></li>
        <li><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg><span>La confidentialité de vos données — et aucun spam.</span></li>
      </ul>
      <div style="margin-top:30px">
        <div class="info-row"><span class="ic"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg></span><div><div class="k">Email</div><div class="v"><a href="mailto:gregory@otonom.fr">gregory@otonom.fr</a></div></div></div>
        <div class="info-row"><span class="ic"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg></span><div><div class="k">Téléphone</div><div class="v"><a href="tel:+33668280908">06 68 28 09 08</a></div></div></div>
      </div>
      <div class="single" style="margin-top:30px;text-align:left"><div class="sub" style="margin:0 0 6px">Sans engagement</div><p style="color:var(--ink-soft);font-size:15px">Vous restez libre à chaque étape. Notre objectif : vous donner les éléments pour décider, pas vous presser.</p></div>
    </div>
  </div></section>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Contact — OTONOM | Réserver un diagnostic gratuit',
  description: "Contactez OTONOM pour un diagnostic gratuit de votre flotte, recharge et énergie. Un plan chiffré, un seul interlocuteur, sans engagement."
})

const f = reactive({ nom: '', entreprise: '', email: '', tel: '', flotte: '', message: '', honey: '' })
const sending = ref(false)
const error = ref(false)

async function submit() {
  if (sending.value) return
  error.value = false
  sending.value = true
  try {
    const message = f.message + (f.flotte ? `\n\nTaille de flotte : ${f.flotte}` : '')
    const res = await $fetch<{ ok: boolean }>('/api/lead', {
      method: 'POST',
      body: {
        _form: 'contact', _honey: f.honey,
        nom: f.nom, email: f.email, entreprise: f.entreprise, telephone: f.tel,
        message, meta: { 'Taille de flotte': f.flotte }
      }
    })
    if (res?.ok) await navigateTo('/merci')
    else throw new Error('refus')
  } catch {
    error.value = true
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.form-alert{margin-bottom:18px;padding:12px 16px;border:1px solid var(--line);border-left:2px solid var(--ink);border-radius:10px;font-size:14px;color:var(--ink-soft);line-height:1.55}
.form-alert a{text-decoration:underline}
</style>
