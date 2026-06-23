<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

    <!-- ── Formulaire ─────────────────────────────────────────── -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold mb-5">Vos paramètres</h2>

      <div class="space-y-5">

        <div>
          <label class="field-label">Salaire net mensuel souhaité (€/mois)</label>
          <input v-model.number="params.netMensuelSouhaite"
                 type="number" class="input-field"
                 min="500" max="50000" step="100" />
        </div>

        <div>
          <label class="field-label">Jours travaillés par an</label>
          <input v-model.number="params.joursParAn"
                 type="number" class="input-field"
                 min="100" max="260" step="5" />
        </div>

        <div>
          <label class="field-label">Semaines de congés</label>
          <input v-model.number="params.semainesConges"
                 type="number" class="input-field"
                 min="0" max="12" />
        </div>

        <div>
          <label class="field-label">
            Jours non facturables — {{ params.pctNonFacturable }} %
          </label>
          <input v-model.number="params.pctNonFacturable"
                 type="range" class="w-full accent-indigo-600"
                 min="0" max="50" step="5" />
          <p class="text-xs text-gray-400 mt-1">Admin, prospection, formation…</p>
        </div>

        <div>
          <label class="field-label">Statut fiscal</label>
          <select v-model="params.statut" class="input-field">
            <option value="principal">Indépendant à titre principal</option>
            <option value="complementaire">Indépendant à titre complémentaire</option>
          </select>
        </div>

      </div>
    </div>

    <!-- ── Résultats ──────────────────────────────────────────── -->
    <div v-if="result" class="flex flex-col gap-4">

      <!-- TJM hero card -->
      <div class="bg-indigo-600 rounded-xl p-6 text-white">
        <p class="text-indigo-200 text-sm font-medium mb-1">Votre Taux Journalier Moyen</p>
        <p class="text-5xl font-bold tracking-tight">{{ formatEUR(result.tjmJour) }}</p>
        <p class="text-indigo-200 mt-2 text-sm">
          soit {{ formatEUR(result.tjmHeure) }} / heure (base 8 h)
        </p>
      </div>

      <!-- 4 metric cards -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
          <p class="text-xs text-emerald-600 dark:text-emerald-400 opacity-70 mb-1">CA annuel nécessaire</p>
          <p class="text-lg font-bold text-emerald-800 dark:text-emerald-300">{{ formatEUR(result.caAnnuel) }}</p>
        </div>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
          <p class="text-xs text-emerald-600 dark:text-emerald-400 opacity-70 mb-1">Net annuel estimé</p>
          <p class="text-lg font-bold text-emerald-800 dark:text-emerald-300">{{ formatEUR(result.netAnnuel) }}</p>
        </div>
        <div class="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
          <p class="text-xs text-orange-600 dark:text-orange-400 opacity-70 mb-1">Cotisations INASTI</p>
          <p class="text-lg font-bold text-orange-800 dark:text-orange-300">{{ formatEUR(result.cotisationsINASTI) }}</p>
        </div>
        <div class="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
          <p class="text-xs text-orange-600 dark:text-orange-400 opacity-70 mb-1">IPP estimé</p>
          <p class="text-lg font-bold text-orange-800 dark:text-orange-300">{{ formatEUR(result.ipp) }}</p>
        </div>
      </div>

      <!-- Détails -->
      <div class="card p-4 space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">Jours disponibles</span>
          <span>{{ result.joursDisponibles }} j</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Jours facturables réels</span>
          <span class="font-semibold text-indigo-600 dark:text-indigo-400">{{ result.joursFacturables }} j</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Total charges (INASTI + IPP)</span>
          <span class="font-medium">{{ formatEUR(result.totalCharges) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Taux de charges total</span>
          <span class="font-medium">{{ result.tauxChargesTotal }} %</span>
        </div>
      </div>

      <p class="text-xs text-gray-400 text-center leading-relaxed">
        ⚠️ Simulation indicative — consultez un comptable agréé (IEC/IAB)
      </p>
    </div>

  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { calcTJM, formatEUR } from '../utils/belgiumTaxCalc.js'

const emit = defineEmits(['result'])

// Paramètres du formulaire — reactive() = chaque propriété est réactive
const params = reactive({
  netMensuelSouhaite: 4_000,
  joursParAn        : 220,
  semainesConges    : 5,
  pctNonFacturable  : 20,
  statut            : 'principal',
})

// Résultat calculé automatiquement à chaque changement de params
const result = computed(() => {
  try {
    return calcTJM({ ...params })
  } catch {
    return null
  }
})

// Remonte le résultat à App.vue (pour pré-remplir l'onglet Devis)
watch(result, val => { if (val) emit('result', val) }, { immediate: true })
</script>
