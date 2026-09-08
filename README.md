# whereartistsfindinspiration — projet autonome

Ce dossier contient le même code que l'artifact Claude (`src/App.jsx`), mais
packagé comme un vrai projet Vite. En dehors du bac à sable Claude, il n'y a
plus de Content Security Policy bloquant les appels réseau : le `fetch()`
vers TMDB et Supabase fonctionnera normalement.

## Depuis un téléphone (le plus simple) : StackBlitz

**Option A — via GitHub (le chemin le plus fluide sur mobile) :**
1. Sur github.com, crée un nouveau repo vide.
2. "Add file → Upload files", dépose tout le contenu de ce dossier.
3. Ouvre `https://stackblitz.com/github/TON-PSEUDO/NOM-DU-REPO` — StackBlitz
   importe et lance le projet automatiquement.

**Option B — import direct du zip :**
1. Va sur stackblitz.com, "Create project" → "Import from ZIP".
2. StackBlitz détecte `package.json` et installe/lance tout seul.

## Depuis un ordinateur

```bash
npm install
npm run dev
```

Ouvre l'URL affichée (en général `http://localhost:5173`).

## Mettre en ligne pour de bon

```bash
npm run build
```

Dépose le dossier `dist/` généré sur Vercel ou Netlify.

## Structure

```
src/App.jsx     — l'application (identique à l'artifact Claude)
src/main.jsx    — point d'entrée React
src/index.css   — Tailwind (nécessaire ici, contrairement à l'artifact Claude)
```
