<template>
  <div class="max-w-2xl space-y-5">

    <!-- ── Informations freelance ──────────────────────────────── -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold mb-4">Informations freelance</h2>
      <div class="grid grid-cols-2 gap-4">

        <div>
          <label class="field-label">Nom / Entreprise</label>
          <input v-model="form.nomFreelance" class="input-field" placeholder="Jean Dupont" />
          <p v-if="errors.nomFreelance" class="text-xs text-red-500 mt-1">{{ errors.nomFreelance }}</p>
        </div>

        <div>
          <label class="field-label">Numéro TVA belge</label>
          <input v-model="form.tva" class="input-field" placeholder="BE 0123.456.789" />
          <p v-if="errors.tva" class="text-xs text-red-500 mt-1">{{ errors.tva }}</p>
        </div>

        <div class="col-span-2">
          <label class="field-label">IBAN (optionnel)</label>
          <input v-model="form.iban" class="input-field" placeholder="BE68 5390 0754 7034" />
        </div>

        <div class="col-span-2 flex items-center gap-3 pt-1">
          <button
            type="button"
            @click="form.franchiseTVA = !form.franchiseTVA"
            :class="[
              'relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
              form.franchiseTVA ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
            ]"
          >
            <span
              :class="[
                'inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200',
                form.franchiseTVA ? 'translate-x-5' : 'translate-x-0'
              ]"
            />
          </button>
          <div>
            <span class="text-sm font-medium">Franchise TVA <span class="text-gray-400 font-normal">(art. 56bis Code TVA)</span></span>
            <p class="text-xs text-gray-400 mt-0.5">Revenus annuels ≤ 25 000 € HTVA — aucune TVA facturée</p>
          </div>
        </div>

      </div>
    </div>

    <!-- ── Mission ────────────────────────────────────────────── -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold mb-4">Mission</h2>
      <div class="grid grid-cols-2 gap-4">

        <div>
          <label class="field-label">Nom du client</label>
          <input v-model="form.nomClient" class="input-field" placeholder="Acme SPRL" />
          <p v-if="errors.nomClient" class="text-xs text-red-500 mt-1">{{ errors.nomClient }}</p>
        </div>

        <div>
          <label class="field-label">Description de la mission</label>
          <input v-model="form.mission" class="input-field" placeholder="Développement web" />
          <p v-if="errors.mission" class="text-xs text-red-500 mt-1">{{ errors.mission }}</p>
        </div>

        <div>
          <label class="field-label">Nombre de jours</label>
          <input v-model.number="form.jours" type="number" class="input-field" min="1" />
        </div>

        <div>
          <label class="field-label">TJM (€/jour)</label>
          <input v-model.number="form.tjm" type="number" class="input-field" min="1" step="50" />
        </div>

      </div>
    </div>

    <!-- ── Aperçu totaux ──────────────────────────────────────── -->
    <div class="card p-4 flex justify-end gap-8 text-sm">
      <div class="text-right">
        <p class="text-gray-400">{{ form.franchiseTVA ? 'Total' : 'Total HTVA' }}</p>
        <p class="font-semibold">{{ formatEUR(montantHtva) }}</p>
      </div>
      <template v-if="!form.franchiseTVA">
        <div class="text-right">
          <p class="text-gray-400">TVA 21 %</p>
          <p class="font-semibold">{{ formatEUR(montantHtva * 0.21) }}</p>
        </div>
        <div class="text-right">
          <p class="text-gray-400">Total TVAC</p>
          <p class="text-xl font-bold text-indigo-600 dark:text-indigo-400">{{ formatEUR(montantHtva * 1.21) }}</p>
        </div>
      </template>
      <template v-else>
        <div class="text-right">
          <p class="text-indigo-400 text-xs max-w-[160px] leading-tight">TVA non applicable — franchise art. 56bis</p>
        </div>
      </template>
    </div>

    <!-- ── Bouton export ──────────────────────────────────────── -->
    <button
      @click="genererPDF"
      :disabled="generating"
      class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
             text-white rounded-xl font-semibold transition-colors"
    >
      {{ generating ? '⏳ Génération…' : '📄 Télécharger le devis PDF' }}
    </button>

    <!-- Message succès -->
    <p v-if="success" class="text-center text-emerald-500 font-medium">
      ✅ Devis téléchargé — vérifiez vos téléchargements !
    </p>

  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatEUR } from '../utils/belgiumTaxCalc.js'

// ── Props ──────────────────────────────────────────────────────
const props = defineProps({
  // Résultat du simulateur pour pré-remplir le TJM
  simulatorResult: { type: Object, default: null },
})

// ── State ──────────────────────────────────────────────────────
const form = reactive({
  nomFreelance: '',
  tva         : '',
  iban        : '',
  franchiseTVA: false,
  nomClient   : '',
  mission     : '',
  jours       : 10,
  tjm         : 500,
})

const errors    = reactive({})
const generating = ref(false)
const success    = ref(false)
let   counter    = 1  // numéro de devis, persisté dans localStorage

// ── Pré-remplissage depuis le simulateur ──────────────────────
watch(() => props.simulatorResult, (val) => {
  if (val?.tjmJour) form.tjm = val.tjmJour
}, { immediate: true })

// Chargement du compteur et des infos freelance depuis localStorage
onMounted(() => {
  counter = parseInt(localStorage.getItem('tjm-quote-counter') || '1')
  const saved = localStorage.getItem('tjm-freelance-info')
  if (saved) {
    const info = JSON.parse(saved)
    form.nomFreelance = info.nom         || ''
    form.tva          = info.tva         || ''
    form.iban         = info.iban        || ''
    form.franchiseTVA = info.franchiseTVA ?? false
  }
})

// Sauvegarde automatique des infos freelance
watch([() => form.nomFreelance, () => form.tva, () => form.iban, () => form.franchiseTVA], () => {
  localStorage.setItem('tjm-freelance-info', JSON.stringify({
    nom: form.nomFreelance, tva: form.tva, iban: form.iban, franchiseTVA: form.franchiseTVA,
  }))
})

// ── Calculs ──────────────────────────────────────────────────
const montantHtva = computed(() => Math.max(0, form.jours * form.tjm))

// ── Validation ──────────────────────────────────────────────
function valider() {
  Object.keys(errors).forEach(k => delete errors[k])

  if (!form.nomFreelance.trim())
    errors.nomFreelance = 'Requis'
  if (!/^BE\s?\d{4}\.\d{3}\.\d{3}$/.test(form.tva))
    errors.tva = 'Format attendu : BE XXXX.XXX.XXX'
  if (!form.nomClient.trim())
    errors.nomClient = 'Requis'
  if (!form.mission.trim())
    errors.mission = 'Requis'

  return Object.keys(errors).length === 0
}

// ── Génération PDF ────────────────────────────────────────────
function genererPDF() {
  if (!valider()) return

  generating.value = true

  const numero     = `${new Date().getFullYear()}-${String(counter).padStart(3, '0')}`
  const date       = new Date().toLocaleDateString('fr-BE')
  const htva       = form.jours * form.tjm
  const tva        = form.franchiseTVA ? 0 : htva * 0.21
  const total      = htva + tva

  const doc = new jsPDF()

  // ── En-tête ────────────────────────────────────────────────
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(form.nomFreelance, 14, 20)
  doc.text(form.tva, 14, 26)
  doc.text(date, 196, 20, { align: 'right' })

  // ── Titre ──────────────────────────────────────────────────
  doc.setFontSize(22)
  doc.setTextColor(30)
  doc.text('DEVIS', 14, 42)
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`N° ${numero}`, 14, 49)

  // ── Client ────────────────────────────────────────────────
  doc.setFontSize(10)
  doc.setTextColor(30)
  doc.text("À l'attention de :", 14, 62)
  doc.setFontSize(11)
  doc.text(form.nomClient, 14, 68)

  // ── Tableau ───────────────────────────────────────────────
  autoTable(doc, {
    startY: 82,
    head  : [['Description', 'Jours', 'TJM (€)', 'Total HTVA (€)']],
    body  : [[form.mission, form.jours, form.tjm.toFixed(2), htva.toFixed(2)]],
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    styles    : { fontSize: 10 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
  })

  const y = doc.lastAutoTable.finalY + 10

  // ── Totaux ────────────────────────────────────────────────
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')

  if (form.franchiseTVA) {
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Total :', 130, y)
    doc.text(`${total.toFixed(2)} €`, 196, y, { align: 'right' })
    doc.setFont(undefined, 'normal')
  } else {
    doc.text('Total HTVA :', 130, y)
    doc.text(`${htva.toFixed(2)} €`, 196, y, { align: 'right' })
    doc.text('TVA 21 % :', 130, y + 7)
    doc.text(`${tva.toFixed(2)} €`, 196, y + 7, { align: 'right' })

    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Total TVAC :', 130, y + 16)
    doc.text(`${total.toFixed(2)} €`, 196, y + 16, { align: 'right' })
    doc.setFont(undefined, 'normal')
  }

  // ── Mentions légales belges ───────────────────────────────
  doc.setFontSize(8)
  doc.setTextColor(120)
  const mentions = [
    'Délai de paiement : 30 jours à réception de la facture.',
    'En cas de retard : intérêts légaux (loi 2002) + indemnité forfaitaire de 40 €.',
    form.franchiseTVA
      ? 'TVA non applicable — Régime de la franchise de la taxe en vertu de l\'art. 56bis du Code TVA.'
      : 'TVA due par le cocontractant — art. 51 §2 Code TVA (si applicable en B2B).',
    form.iban ? `Virement : ${form.iban}` : '',
  ].filter(Boolean)

  mentions.forEach((ligne, i) => doc.text(ligne, 14, 272 + i * 5))

  // ── Téléchargement direct dans le navigateur ──────────────
  // Pas d'IPC, pas de backend — jsPDF gère le download natif
  doc.save(`Devis-${numero}.pdf`)

  // Incrémenter le compteur
  counter++
  localStorage.setItem('tjm-quote-counter', String(counter))

  generating.value = false
  success.value    = true
  setTimeout(() => { success.value = false }, 4000)
}
</script>
