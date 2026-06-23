<template>
  <div class="space-y-6">

    <!-- ── Paramètres ─────────────────────────────────────────── -->
    <div class="card p-4 flex flex-wrap gap-6 items-end">
      <div>
        <label class="field-label">Net mensuel souhaité</label>
        <div class="flex items-center gap-2">
          <input v-model.number="netMensuel" type="number"
                 class="input-field w-32" step="100" min="1000" />
          <span class="text-sm text-gray-400">€/mois</span>
        </div>
      </div>
      <div>
        <label class="field-label">Jours travaillés / an</label>
        <input v-model.number="joursParAn" type="number"
               class="input-field w-24" step="5" min="100" max="260" />
      </div>
    </div>

    <!-- ── 3 colonnes statuts ─────────────────────────────────── -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div v-for="s in statuts" :key="s.key" class="card p-5 flex flex-col">

        <div class="text-center mb-5">
          <span class="text-4xl">{{ s.emoji }}</span>
          <h3 class="font-semibold mt-2 text-sm">{{ s.label }}</h3>
        </div>

        <div class="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 mb-4 text-center">
          <p class="text-xs text-indigo-500 dark:text-indigo-400 mb-1">TJM nécessaire</p>
          <p class="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
            {{ formatEUR(resultats[s.key].tjmJour) }}<span class="text-sm font-normal">/j</span>
          </p>
          <p class="text-xs text-indigo-400 mt-0.5">= {{ formatEUR(resultats[s.key].tjmHeure) }}/h</p>
        </div>

        <div class="space-y-2 text-sm flex-1">
          <div class="flex justify-between">
            <span class="text-gray-500">Coût total annuel</span>
            <span class="font-medium">{{ formatEUR(resultats[s.key].caAnnuel) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Net annuel</span>
            <span class="font-medium">{{ formatEUR(resultats[s.key].netAnnuel) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Taux de charges</span>
            <span class="font-medium">{{ resultats[s.key].tauxChargesTotal }} %</span>
          </div>
          <div class="flex justify-between items-start gap-2">
            <span class="text-gray-500 flex-shrink-0">Couverture</span>
            <span class="font-medium text-right text-xs">{{ s.couverture }}</span>
          </div>

          <!-- Barres de score -->
          <div class="pt-3 mt-3 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
            <div v-for="bar in [
              { label: 'Flexibilité', val: s.flexibilite, color: 'bg-indigo-500' },
              { label: 'Protection',  val: s.protection,  color: 'bg-emerald-500' },
            ]" :key="bar.label" class="flex items-center gap-2">
              <span class="text-xs text-gray-400 w-20">{{ bar.label }}</span>
              <div class="flex gap-0.5">
                <div
                  v-for="i in 5" :key="i"
                  :class="['w-4 h-1.5 rounded-full', i <= bar.val ? bar.color : 'bg-gray-200 dark:bg-gray-700']"
                />
              </div>
            </div>
          </div>

          <div class="pt-2 text-xs space-y-1">
            <p class="text-emerald-600 dark:text-emerald-400">✅ {{ s.avantage }}</p>
            <p class="text-orange-500  dark:text-orange-400">⚠️ {{ s.inconvenient }}</p>
          </div>
        </div>

      </div>
    </div>

    <p class="text-xs text-gray-400 text-center leading-relaxed">
      ⚠️ Le TJM "salarié" = coût journalier total employeur (brut + ONSS patronal ~27 %).
      Simulation indicative — consultez un comptable agréé.
    </p>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { compareStatuts, formatEUR } from '../utils/belgiumTaxCalc.js'

const netMensuel = ref(4_000)
const joursParAn = ref(220)

const resultats = computed(() =>
  compareStatuts(netMensuel.value, { joursParAn: joursParAn.value })
)

const statuts = [
  {
    key: 'principal', emoji: '🧳', label: 'Indép. Principal',
    flexibilite: 5, protection: 2,
    couverture: 'INASTI seul (~18 %)',
    avantage: 'Contrôle total — revenus et temps',
    inconvenient: 'Protection sociale réduite',
  },
  {
    key: 'complementaire', emoji: '⚖️', label: 'Indép. Complémentaire',
    flexibilite: 4, protection: 4,
    couverture: 'Via employeur principal',
    avantage: 'Revenus extra + couverture salarié',
    inconvenient: 'Cotisations INASTI quand même dues',
  },
  {
    key: 'salarie', emoji: '🏢', label: 'Salarié (simulation)',
    flexibilite: 1, protection: 5,
    couverture: 'Complète (mutuelle, chômage…)',
    avantage: 'Sécurité maximale',
    inconvenient: "TJM le plus élevé pour l'employeur",
  },
]
</script>
