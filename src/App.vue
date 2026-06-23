<template>
  <div class="flex flex-col h-screen overflow-hidden">

    <!-- ── Header ──────────────────────────────────────────────── -->
    <header class="card rounded-none border-x-0 border-t-0 px-6 py-3
                   flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-3">
        <span class="text-2xl select-none">💶</span>
        <h1 class="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          TJM Calculator
        </h1>
        <span class="text-xs text-gray-400 hidden sm:block">Belgique · 2025</span>
      </div>
      <button
        @click="toggleDark"
        title="Basculer thème clair / sombre"
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
               text-gray-500 dark:text-gray-400 transition-colors"
      >
        {{ darkMode ? '☀️' : '🌙' }}
      </button>
    </header>

    <!-- ── Navigation ──────────────────────────────────────────── -->
    <nav class="card rounded-none border-x-0 border-t-0 px-6 flex-shrink-0">
      <div class="flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.id
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </nav>

    <!-- ── Contenu ─────────────────────────────────────────────── -->
    <main class="flex-1 overflow-y-auto p-6">
      <TJMSimulator
        v-if="activeTab === 'simulator'"
        @result="simulatorResult = $event"
      />
      <StatusComparator
        v-if="activeTab === 'comparator'"
      />
      <QuoteExport
        v-if="activeTab === 'quote'"
        :simulator-result="simulatorResult"
      />
    </main>

    <!-- ── Projets flottant ──────────────────────────────────────── -->
    <ProjectsShowcase :projects="myProjects" author="Joachim Lejeune" />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TJMSimulator      from './components/TJMSimulator.vue'
import StatusComparator  from './components/StatusComparator.vue'
import QuoteExport       from './components/QuoteExport.vue'
import ProjectsShowcase  from './components/ProjectsShowcase.vue'

const tabs = [
  { id: 'simulator',  label: '🧮 Simulateur TJM'     },
  { id: 'comparator', label: '📊 Comparateur statuts' },
  { id: 'quote',      label: '📄 Devis'               },
]

const activeTab       = ref('simulator')
const darkMode        = ref(true)
const simulatorResult = ref(null)

const myProjects = [
  {
    name       : 'Pedimed',
    description: 'Application pour pédicure médicale',
    url        : 'https://pedimed-pro.be/',
    emoji      : '🦶',
  },
]

function toggleDark() {
  darkMode.value = !darkMode.value
  document.documentElement.classList.toggle('dark', darkMode.value)
}

// Dark mode activé par défaut au chargement
onMounted(() => document.documentElement.classList.add('dark'))
</script>
