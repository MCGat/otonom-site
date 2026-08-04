<template>
  <section class="page-intro section--light"><div class="wrap">
    <span class="kicker reveal">Simulateur de transition</span>
    <h1 class="reveal">Combien votre transition peut-elle vous rapporter&nbsp;?</h1>
    <p class="lede reveal">Un diagnostic en moins de 5&nbsp;minutes&nbsp;: économies annuelles, investissement, aides mobilisables, retour sur investissement, CO₂ évité et score de maturité. Calcul instantané, sans engagement.</p>
    <p class="sim-note reveal">Résultats en <strong>ordres de grandeur indicatifs</strong>, établis sur des barèmes au 01/01/2026 — à confirmer lors de votre audit gratuit.</p>
  </div></section>

  <!-- FORMULAIRE -->
  <section id="simFormSection" class="section section--tight"><div class="wrap">
    <form class="sim-form" novalidate @submit.prevent="onCalculer">
      <fieldset class="sim-fieldset reveal">
        <legend class="sim-legend"><span class="sim-legend-n">01</span> Votre flotte &amp; ses usages</legend>
        <div class="sim-grid">
          <div class="field sim-span-2">
            <label for="nbVehicules">Nombre de véhicules <span class="req" aria-hidden="true">*</span></label>
            <input id="nbVehicules" v-model.number="f.nbVehicules" type="number" min="0" step="1" inputmode="numeric" placeholder="ex. 100" required>
          </div>
          <div class="field">
            <label for="kmAn">Kilométrage annuel moyen <small>(par véhicule)</small></label>
            <input id="kmAn" v-model.number="f.kmAn" type="number" min="0" step="1000" inputmode="numeric" placeholder="25 000 km">
          </div>
        </div>
        <div class="sim-subgrid">
          <span class="sim-sublabel">Répartition de la flotte <small>(en&nbsp;%)</small></span>
          <div class="sim-mix">
            <div class="field sim-mixin"><label for="mixVP">VP <small>%</small></label><input id="mixVP" v-model.number="f.mixVP" type="number" min="0" max="100" step="5" placeholder="60"></div>
            <div class="field sim-mixin"><label for="mixVUL">VUL <small>%</small></label><input id="mixVUL" v-model.number="f.mixVUL" type="number" min="0" max="100" step="5" placeholder="30"></div>
            <div class="field sim-mixin"><label for="mixPL">PL <small>%</small></label><input id="mixPL" v-model.number="f.mixPL" type="number" min="0" max="100" step="5" placeholder="10"></div>
          </div>
        </div>
      </fieldset>

      <fieldset class="sim-fieldset reveal">
        <legend class="sim-legend"><span class="sim-legend-n">02</span> Sites &amp; équipe</legend>
        <div class="sim-grid">
          <div class="field"><label for="nbSites">Nombre de sites</label><input id="nbSites" v-model.number="f.nbSites" type="number" min="1" step="1" inputmode="numeric" placeholder="1"></div>
          <div class="field"><label for="nbCollaborateurs">Nombre de collaborateurs</label><input id="nbCollaborateurs" v-model.number="f.nbCollaborateurs" type="number" min="0" step="1" inputmode="numeric" placeholder="ex. 120"></div>
        </div>
      </fieldset>

      <fieldset class="sim-fieldset reveal">
        <legend class="sim-legend"><span class="sim-legend-n">03</span> Énergie &amp; bâtiment</legend>
        <div class="sim-grid">
          <div class="field"><label for="puissanceSouscrite">Puissance souscrite <small>(kVA)</small></label><input id="puissanceSouscrite" v-model.number="f.puissanceSouscrite" type="number" min="0" step="1" inputmode="numeric" placeholder="ex. 250"></div>
          <div class="field"><label for="consoEnergie">Consommation énergie <small>(MWh/an)</small></label><input id="consoEnergie" v-model.number="f.consoEnergie" type="number" min="0" step="10" inputmode="numeric" placeholder="ex. 500"></div>
          <div class="field sim-span-2"><label for="surfaceToiture">Surface de toiture disponible <small>(m²)</small></label><input id="surfaceToiture" v-model.number="f.surfaceToiture" type="number" min="0" step="100" inputmode="numeric" placeholder="ex. 3 000 — laissez vide si aucune"></div>
        </div>

        <button type="button" class="sim-more-toggle" :aria-expanded="moreOpen" @click="moreOpen = !moreOpen">Affiner (optionnel) <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 9l6 6 6-6" /></svg></button>
        <div v-show="moreOpen" class="sim-more">
          <div class="sim-grid">
            <div class="field">
              <label for="partDejaElec">Part déjà électrifiée <small>(%)</small></label>
              <input id="partDejaElec" v-model.number="f.partDejaElec" type="number" min="0" max="100" step="5" placeholder="0">
              <span class="sim-field-help">Part de votre flotte roulant déjà en 100&nbsp;% électrique aujourd'hui — laissez 0 si aucune.</span>
            </div>
          </div>
        </div>
      </fieldset>

      <div class="sim-actions reveal">
        <button type="submit" class="btn btn--primary btn--lg">Calculer mon potentiel <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
        <p class="sim-hint">Calcul immédiat dans votre navigateur — aucune donnée transmise à ce stade.</p>
      </div>
    </form>
  </div></section>

  <!-- RÉSULTATS -->
  <section v-if="view" id="simResults" ref="resultsEl" class="section section--light"><div class="wrap">
    <div class="sim-print-head print-only" aria-hidden="true">
      <span class="sim-print-brand">OTONOM</span>
      <span class="sim-print-meta">Rapport de simulation · estimation indicative · otonom.fr</span>
    </div>
    <div class="sec-head"><span class="kicker">Votre diagnostic</span><h2>Le potentiel de votre transition, en un coup d'œil.</h2></div>

    <!-- Synthèse (gratuite) -->
    <div class="sim-synth">
      <div class="sim-hero-metric">
        <span class="sim-hero-label">Argent laissé sur la table<em>chaque année</em></span>
        <div class="sim-hero-num tabnum">{{ view.hero }}</div>
        <p class="sim-hero-sub">Économies annuelles potentielles aujourd'hui non exploitées — ordre de grandeur indicatif, affiné lors de l'audit.</p>
      </div>
      <div class="sim-metrics">
        <div v-for="m in view.metrics" :key="m.label" class="sim-metric">
          <span class="sim-metric-l">{{ m.label }}</span><b class="sim-metric-v tabnum">{{ m.value }}</b>
        </div>
      </div>
      <div class="sim-score">
        <div class="sim-score-head"><span class="sim-metric-l">Score OTONOM</span><span class="sim-score-now tabnum">{{ view.score.actuel }}<em>/100</em></span></div>
        <div class="sim-score-rail">
          <span class="sim-score-fill" :style="{ width: view.score.actuel + '%' }"></span>
          <span class="sim-score-target" :style="{ left: view.score.objectif + '%' }" :title="'Objectif ' + view.score.objectif"></span>
        </div>
        <div class="sim-score-legend"><span>Aujourd'hui {{ view.score.actuel }}</span><span>Potentiel {{ view.score.potentiel }} · objectif {{ view.score.objectif }}</span></div>
      </div>
    </div>
    <p v-if="view.extra" class="sim-extra" v-html="view.extra"></p>

    <!-- Gate email -->
    <div v-if="!unlocked" id="simGate" class="sim-gate">
      <div class="sim-gate-copy">
        <span class="kicker">Rapport complet</span>
        <h3>Débloquez le détail des 10 leviers et votre rapport.</h3>
        <p>Vous voyez déjà votre synthèse ci-dessus. Laissez votre email pour afficher le <strong>détail chiffré levier par levier</strong>, télécharger votre <strong>rapport PDF</strong> et recevoir une proposition d'échange.</p>
        <ul class="sim-gate-list">
          <li>Détail des 10 leviers (flotte, AEN, IRVE, énergie, PV…)</li>
          <li>Rapport PDF au format livrable OTONOM</li>
          <li>Proposition de RDV pour affiner les chiffres</li>
        </ul>
      </div>
      <form class="sim-gate-form" novalidate @submit.prevent="sendGate">
        <input v-model="g.honey" type="text" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div class="field"><label for="gNom">Nom <span class="req" aria-hidden="true">*</span></label><input id="gNom" v-model="g.nom" type="text" autocomplete="name" required></div>
        <div class="field"><label for="gEmail">Email professionnel <span class="req" aria-hidden="true">*</span></label><input id="gEmail" v-model="g.email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="gEntreprise">Entreprise</label><input id="gEntreprise" v-model="g.entreprise" type="text" autocomplete="organization"></div>
        <div class="field"><label for="gTel">Téléphone</label><input id="gTel" v-model="g.tel" type="tel" autocomplete="tel"></div>
        <button type="submit" class="btn btn--primary btn--block btn--lg" :disabled="sending">
          {{ sending ? 'Envoi…' : 'Voir le détail complet' }}
          <svg v-if="!sending" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
        <p v-if="gateError" class="sim-gate-msg" role="alert">Une erreur est survenue. Réessayez, ou écrivez-nous à <a href="mailto:e.barlet@mc-groupe.com">e.barlet@mc-groupe.com</a>.</p>
        <p class="sim-gate-consent">En validant, vous acceptez d'être recontacté par OTONOM. Vos données restent confidentielles — <NuxtLink to="/confidentialite">politique de confidentialité</NuxtLink>.</p>
      </form>
    </div>

    <!-- Détail déverrouillé -->
    <div v-else id="simDetail" ref="detailEl">
      <div class="sim-detail-top">
        <div class="sim-blocks-head"><span class="kicker">Le détail, levier par levier</span></div>
        <button type="button" class="btn btn--ghost sim-print-btn" @click="printReport">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" /></svg>
          Enregistrer mon rapport (PDF)
        </button>
      </div>
      <div class="sim-blocks">
        <article v-for="b in view.blocks" :key="b.n" class="sim-block">
          <header class="sim-block-h">
            <span class="sim-block-n">{{ b.n }}</span><h3>{{ b.title }}</h3>
            <span class="sim-tag" :class="'sim-tag--' + b.tag">{{ TAG_LABELS[b.tag] }}</span>
          </header>
          <div class="sim-block-b">
            <p v-if="b.leadHtml" class="sim-lead" :class="{ 'sim-muted': b.leadMuted }" v-html="b.leadHtml"></p>
            <div v-for="row in b.rows" :key="row.label" class="sim-kv">
              <span>{{ row.label }}</span><b class="tabnum" :class="{ 'is-strong': row.strong }">{{ row.value }}</b>
            </div>
          </div>
        </article>
      </div>

      <p class="disclaimer sim-disclaimer">Estimations en ordres de grandeur, établies sur des barèmes et hypothèses au 01/01/2026, données à titre indicatif et non contractuel. Les montants réels dépendent de votre situation et sont affinés lors de l'audit gratuit OTONOM.</p>

      <div class="cta-block">
        <h2>Transformons ce potentiel en résultats.</h2>
        <p class="lede">Un échange court pour affiner ces chiffres et bâtir votre plan de transition, sans engagement.</p>
        <div class="hero-cta"><NuxtLink class="btn btn--primary btn--lg" to="/contact">Réserver mon audit gratuit <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg></NuxtLink></div>
      </div>
    </div>
  </div></section>

  <section class="section section--tight sim-seo"><div class="wrap">
    <div class="sec-head">
      <span class="kicker">Comprendre le calcul</span>
      <h2>Chiffrer une transition énergétique d'entreprise&nbsp;: leviers, aides et retour sur investissement</h2>
    </div>

    <div class="article-body">
      <p>La transition mobilité, recharge et énergie d'une entreprise n'est pas une décision unique&nbsp;: c'est une <strong>série de leviers</strong> qui se financent en partie les uns les autres. Électrifier la flotte réduit le budget carburant et l'entretien, mais crée un besoin de recharge&nbsp;; installer des bornes augmente la facture d'électricité, que la renégociation du contrat, l'autoconsommation solaire et le pilotage de la consommation viennent à leur tour compenser. Pris isolément, chaque levier paraît coûteux. C'est leur <strong>combinaison</strong> qui produit le gain.</p>

      <p>Ce simulateur d'économies parcourt ces leviers dans l'ordre où ils se posent réellement, et rend trois chiffres&nbsp;: le <strong>gain annuel estimé</strong>, l'<strong>investissement</strong> à consentir net des aides mobilisables, et le <strong>retour sur investissement</strong> exprimé en années. Il y ajoute un <strong>score de maturité</strong> sur 100, qui indique moins une note qu'un ordre de priorité.</p>

      <h3>Qu'est-ce qu'un simulateur d'économies d'énergie pour une entreprise&nbsp;?</h3>
      <p>C'est un outil d'ordre de grandeur, pas un devis. Il applique à votre situation déclarée — taille de flotte, kilométrage, consommation d'électricité, surface de toiture, nombre de sites — des barèmes publics datés et des hypothèses de marché, puis chiffre l'écart entre votre situation actuelle et une situation optimisée. Sa valeur n'est pas dans la précision du montant, mais dans le fait de savoir <strong>quel levier pèse le plus</strong> chez vous, et lequel ne vaut pas l'effort.</p>

      <h3>Les leviers chiffrés par le simulateur</h3>
      <table>
        <thead><tr><th>Levier</th><th>D'où vient le gain</th></tr></thead>
        <tbody>
          <tr><td>Flotte</td><td>Écart entre budget carburant et coût de recharge, entretien allégé, et évitement de la taxe annuelle incitative pour les flottes concernées</td></tr>
          <tr><td>Avantage en nature</td><td>Abattement de jusqu'à 70&nbsp;% sur l'avantage en nature d'un véhicule électrique mis à disposition d'un salarié</td></tr>
          <tr><td>Recharge (IRVE)</td><td>Investissement en points de charge et génie civil, diminué des aides ouvertes au moment du projet</td></tr>
          <tr><td>Contrat d'énergie</td><td>Mise en concurrence de la fourniture d'électricité, souvent le gain le plus rapide à obtenir</td></tr>
          <tr><td>Photovoltaïque</td><td>Part d'autoconsommation qui remplace de l'électricité achetée, et prime à l'investissement</td></tr>
          <tr><td>Stockage</td><td>Effacement des pointes et arbitrage entre heures pleines et heures creuses</td></tr>
          <tr><td>Pilotage de l'énergie</td><td>Réduction de la facture par l'ajustement de la puissance souscrite et le lissage des usages</td></tr>
        </tbody>
      </table>

      <div class="article-callout">
        <span class="callout-label">À retenir</span>
        <p>Le levier le plus rentable est presque toujours celui qui ne demande aucun investissement&nbsp;: <strong>renégocier le contrat d'énergie</strong> et <strong>ajuster la puissance souscrite</strong>. Beaucoup d'entreprises commencent par les bornes ou le solaire, et découvrent après coup qu'elles payaient leur électricité trop cher depuis des années. L'ordre dans lequel on agit change le résultat autant que les actions elles-mêmes.</p>
      </div>

      <h3>Comment se lit le retour sur investissement</h3>
      <p>Le retour sur investissement rapporte l'investissement net d'aides au gain annuel qu'il produit. Un ROI de trois ans signifie que l'opération s'autofinance à partir de la troisième année, puis dégage un gain récurrent. Deux précautions&nbsp;: le gain annuel dépend de prix de l'énergie qui évoluent, et l'investissement doit être décaissé avant d'être récupéré — un calcul de <strong>trésorerie</strong> reste nécessaire à côté du calcul de rentabilité. Si votre sujet principal est la flotte, notre <NuxtLink to="/simulateurs/tco-flotte-electrique">simulateur de TCO flotte électrique</NuxtLink> pousse ce raisonnement beaucoup plus loin, infrastructure de recharge comprise.</p>

      <h3>Les aides mobilisables, et pourquoi elles se vérifient au cas par cas</h3>
      <p>Programme ADVENIR pour les infrastructures de recharge, prime à l'autoconsommation photovoltaïque, certificats d'économies d'énergie&nbsp;: ces dispositifs existent, mais leurs <strong>guichets ouvrent et se ferment</strong>, et les conditions d'éligibilité varient selon le type de site, le bénéficiaire et l'usage. Une aide annoncée dans un article de l'an dernier peut être close aujourd'hui. Le simulateur en donne une estimation&nbsp;; nous vérifions les guichets réellement ouverts au moment de votre projet, ce qui fait partie de <NuxtLink to="/methode">notre méthode</NuxtLink>.</p>

      <h3>Les erreurs qui faussent une estimation d'économies</h3>
      <ul>
        <li><strong>Additionner des gains qui se recouvrent</strong> — l'autoconsommation solaire et la renégociation du contrat portent en partie sur les mêmes kilowattheures.</li>
        <li><strong>Oublier la facture d'électricité créée par la recharge</strong>, qui vient en déduction du gain carburant.</li>
        <li><strong>Retenir une aide sans vérifier son guichet</strong>, alors que les dispositifs évoluent d'une année à l'autre.</li>
        <li><strong>Raisonner en rentabilité sans regarder la trésorerie</strong>&nbsp;: une opération rentable peut être indécidable si le décaissement arrive au mauvais moment.</li>
        <li><strong>Traiter les sujets séparément</strong>, en confiant flotte, bornes et énergie à trois prestataires qui n'optimisent chacun que leur périmètre.</li>
      </ul>

      <h3>Qui est concerné dans l'entreprise</h3>
      <p>Le <NuxtLink to="/dirigeants">dirigeant</NuxtLink> arbitre sur le potentiel global et le moment d'engager, le <NuxtLink to="/daf">directeur financier</NuxtLink> sur l'investissement, les aides et la trésorerie, les <NuxtLink to="/services-generaux">services généraux</NuxtLink> sur l'exploitation des sites et de la recharge, le <NuxtLink to="/drh">DRH</NuxtLink> sur l'avantage en nature et l'acceptation par les collaborateurs. Ces quatre lectures aboutissent rarement au même ordre de priorité&nbsp;: un chiffrage commun évite des mois d'arbitrage.</p>

      <h2>Questions fréquentes sur le chiffrage d'une transition énergétique</h2>
      <div class="article-faq">
        <details><summary>Combien une entreprise peut-elle économiser en électrifiant sa flotte&nbsp;?</summary><div class="faq-a">Le gain vient principalement de trois postes&nbsp;: l'écart entre le budget carburant et le coût de la recharge, l'entretien allégé d'un véhicule électrique, et la fiscalité. Son ampleur dépend surtout du kilométrage annuel et du lieu de recharge — recharger au dépôt en heures creuses n'a pas le même coût qu'en borne publique rapide. Un chiffrage sérieux se fait sur vos usages réels.</div></details>
        <details><summary>Par quel levier faut-il commencer&nbsp;?</summary><div class="faq-a">Par ceux qui ne demandent pas d'investissement&nbsp;: la renégociation du contrat de fourniture d'électricité et l'ajustement de la puissance souscrite produisent un gain immédiat et financent souvent la suite. Viennent ensuite l'électrification de la flotte et l'infrastructure de recharge, puis la production et le stockage.</div></details>
        <details><summary>Quel retour sur investissement attendre d'une transition énergétique&nbsp;?</summary><div class="faq-a">Il varie fortement selon le levier&nbsp;: quasi immédiat pour une renégociation de contrat, de quelques années pour l'infrastructure de recharge et le photovoltaïque en autoconsommation. C'est pourquoi le simulateur rend un ROI global tout en détaillant le gain levier par levier&nbsp;: la moyenne cache toujours un levier très rentable et un levier qui l'est peu.</div></details>
        <details><summary>À quoi sert le score de maturité sur 100&nbsp;?</summary><div class="faq-a">Il situe votre organisation sur les axes mobilité, recharge, énergie et pilotage, et met en évidence l'axe le plus en retard. Ce n'est pas une note de performance mais un ordre de priorité&nbsp;: l'axe le plus faible est en général celui où le prochain euro investi rapporte le plus.</div></details>
        <details><summary>Les aides pour installer des bornes de recharge en entreprise existent-elles toujours&nbsp;?</summary><div class="faq-a">Des dispositifs existent, mais leurs guichets et leurs conditions d'éligibilité évoluent régulièrement selon le type de site et le bénéficiaire. Une estimation d'aide doit toujours être confirmée au moment du projet&nbsp;: c'est une des premières vérifications que nous menons lors de l'audit.</div></details>
        <details><summary>Qui peut affiner ce calcul avec mes données réelles&nbsp;?</summary><div class="faq-a">OTONOM, orchestrateur de la transition mobilité, recharge et énergie des entreprises&nbsp;: nous auditons vos usages et vos factures, chiffrons chaque levier, coordonnons installateurs, énergéticiens, financeurs et mainteneurs, puis vérifions les gains sur facture. Un seul interlocuteur, de A à Z.</div></details>
      </div>

      <h3>Pour aller plus loin</h3>
      <p>Les cadres applicables sont publics&nbsp;: l'<a href="https://www.ademe.fr/" target="_blank" rel="noopener noreferrer">ADEME</a> documente la maîtrise de l'énergie et la mobilité des entreprises, le <a href="https://www.ecologie.gouv.fr/politiques-publiques/fiscalite-environnementale-relative-aux-vehicules" target="_blank" rel="noopener noreferrer">ministère de la Transition écologique</a> publie le cadre de la fiscalité environnementale des véhicules, l'administration décrit les <a href="https://entreprendre.service-public.gouv.fr/vosdroits/F22203" target="_blank" rel="noopener noreferrer">taxes annuelles sur l'affectation des véhicules à des fins économiques</a> et l'<a href="https://www.urssaf.fr/accueil/employeur/cotisations/avantages-en-nature.html" target="_blank" rel="noopener noreferrer">URSSAF</a> les règles d'évaluation de l'avantage en nature. Le détail fiscal figure dans notre article sur <NuxtLink to="/blog/fiscalite-vehicule-electrique-2026">la fiscalité du véhicule électrique en entreprise</NuxtLink>, et notre page <NuxtLink to="/expertises">expertises</NuxtLink> décrit le périmètre que nous couvrons.</p>

      <hr>
      <p class="disclaimer">Barèmes et hypothèses au 01/01/2026. Montants exprimés en «&nbsp;jusqu'à&nbsp;», donnés à titre indicatif et non contractuel — à confirmer avec votre expert-comptable et, pour les aides, au moment du dépôt de dossier. Les gains énergétiques sont des ordres de grandeur, affinés lors de l'audit gratuit OTONOM.</p>
    </div>
  </div></section>
</template>

<script setup lang="ts">
import { calculerSimulateur, construireVueSimulateur, resumeSimulateur, type SimResult, type SimInput, type TagKind } from '~/utils/simulateur'

useSeoMeta({
  title: 'Simulateur de transition — OTONOM | Économies, ROI & maturité',
  description: "En moins de 5 minutes, estimez vos économies annuelles, votre investissement, vos aides mobilisables, votre ROI et votre score de maturité énergétique. Ordres de grandeur indicatifs."
})

const TAG_LABELS: Record<TagKind, string> = {
  calc: 'Calculé', hyp: 'Hypothèse', ind: 'Estimation indicative', audit: 'À affiner en audit'
}

const f = reactive<SimInput>({})
const moreOpen = ref(false)

const result = ref<SimResult | null>(null)
const view = computed(() => (result.value ? construireVueSimulateur(result.value) : null))

const unlocked = ref(false)
const g = reactive({ nom: '', email: '', entreprise: '', tel: '', honey: '' })
const sending = ref(false)
const gateError = ref(false)

const resultsEl = ref<HTMLElement | null>(null)
const detailEl = ref<HTMLElement | null>(null)

function onCalculer() {
  result.value = calculerSimulateur({ ...f })
  nextTick(() => resultsEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

async function sendGate() {
  if (sending.value || !result.value) return
  if (g.honey) { unlocked.value = true; return }
  gateError.value = false
  sending.value = true
  try {
    const res = await $fetch<{ ok: boolean }>('/api/lead', {
      method: 'POST',
      body: {
        _form: 'simulateur', _honey: g.honey,
        nom: g.nom, email: g.email, entreprise: g.entreprise, telephone: g.tel,
        message: resumeSimulateur(result.value),
        meta: { gain: result.value.synth.gainGlobal, roi: result.value.synth.roiAns, invest: result.value.synth.investissement }
      }
    })
    if (res?.ok) {
      unlocked.value = true
      nextTick(() => detailEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } else { throw new Error('refus') }
  } catch {
    gateError.value = true
  } finally {
    sending.value = false
  }
}

function printReport() {
  if (import.meta.client) window.print()
}
</script>
