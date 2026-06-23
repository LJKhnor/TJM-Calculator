<template>
  <!-- ── Bouton flottant ──────────────────────────────────────── -->
  <div class="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">

    <!-- Panneau projets -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="open"
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
               rounded-2xl shadow-2xl w-72 p-4 origin-bottom-right"
      >
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Mes autres projets
        </p>

        <div class="space-y-2">
          <a
            v-for="p in projects"
            :key="p.url"
            :href="p.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-start gap-3 p-3 rounded-xl
                   hover:bg-gray-50 dark:hover:bg-gray-700/50
                   transition-colors group"
          >
            <span class="text-2xl leading-none mt-0.5 select-none">{{ p.emoji ?? '🔗' }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-100
                         group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {{ p.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 leading-snug mt-0.5">
                {{ p.description }}
              </p>
            </div>
            <svg class="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-1
                        group-hover:text-indigo-400 transition-colors"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4
                       M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <p v-if="author" class="text-xs text-gray-300 dark:text-gray-600 text-center mt-3 pt-3
                                border-t border-gray-100 dark:border-gray-700">
          par {{ author }}
        </p>
      </div>
    </Transition>

    <!-- Bouton toggle -->
    <button
      @click="open = !open"
      :title="open ? 'Fermer' : 'Mes projets'"
      :class="[
        'w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200',
        open
          ? 'bg-gray-700 hover:bg-gray-600 rotate-45'
          : 'bg-indigo-600 hover:bg-indigo-700'
      ]"
    >
      <svg v-if="!open" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"
           stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      <svg v-else class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"
           stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

  </div>

  <!-- Overlay fermeture au clic extérieur -->
  <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  projects: {
    type: Array,
    required: true,
    // [{ name, description, url, emoji? }]
  },
  author: {
    type: String,
    default: '',
  },
})

const open = ref(false)
</script>
