# 💶 TJM Calculator — Belgique

Calcul du Taux Journalier Moyen pour freelances belges.
**100% frontend — aucune donnée envoyée sur un serveur.**

🔗 **Demo live :** `https://[votre-pseudo].github.io/tjm-calculator/`

---

## Fonctionnalités

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Simulateur TJM** | Net souhaité → TJM avec calculs INASTI + IPP 2024 |
| 2 | **Comparateur statuts** | Principal / Complémentaire / Salarié côte à côte |
| 3 | **Export Devis PDF** | Devis avec mentions légales belges, téléchargé localement |

---

## Stack technique

- **Vue 3** + `<script setup>` (Composition API)
- **Vite** — build ultra-rapide
- **Tailwind CSS** — dark mode natif
- **jsPDF + AutoTable** — génération PDF côté client
- **GitHub Actions** — déploiement automatique

---

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en développement (hot reload)
npm run dev

# 3. Build de production
npm run build

# 4. Prévisualiser le build local
npm run preview
```

---

## Déploiement sur GitHub Pages

### Automatique (recommandé)
Le fichier `.github/workflows/deploy.yml` s'occupe de tout.

1. Pusher sur `main` → GitHub Actions lance le build
2. Le dossier `dist/` est déployé sur la branche `gh-pages`
3. Dans les **Settings** du repo → **Pages** → Source : `gh-pages` / `/ (root)`

### Manuel
```bash
npm run build
# puis uploader le contenu de dist/ sur votre hébergement
```

---

## Formules fiscales 2024

### Cotisations INASTI (indépendant principal)
| Tranche de revenus | Taux |
|--------------------|------|
| 0 → 17 717,28 € | **20,5 %** |
| 17 717,28 → 78 668,93 € | **14,16 %** |
| > 78 668,93 € | **0 %** (plafonné) |
| Minimum annuel | ~3 208,28 € |

### IPP fédéral
| Tranche de revenus | Taux |
|--------------------|------|
| 0 → 15 820 € | **25 %** |
| 15 820 → 27 920 € | **40 %** |
| 27 920 → 48 320 € | **45 %** |
| > 48 320 € | **50 %** |
| Quotité exemptée | 10 160 € |
| Additionnel communal | +7 % (moyenne) |

> ⚠️ Simulation indicative. Consultez un comptable agréé (IEC/IAB)
> pour votre situation personnelle.

---

## Structure

```
src/
├── components/
│   ├── TJMSimulator.vue      ← Feature 1 : formulaire + résultats réactifs
│   ├── StatusComparator.vue  ← Feature 2 : tableau 3 statuts
│   └── QuoteExport.vue       ← Feature 3 : formulaire + génération PDF
├── utils/
│   └── belgiumTaxCalc.js     ← Toutes les formules fiscales belges
├── App.vue                   ← Navigation + dark mode
├── main.js                   ← Point d'entrée Vue
└── index.css                 ← Tailwind + classes réutilisables
```
