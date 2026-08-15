# whereartistsfindinspiration — projet autonome

Ce dossier contient le même code que l'artifact Claude (`src/App.jsx`), mais
packagé comme un vrai projet Vite. En dehors du bac à sable Claude, il n'y a
plus de Content Security Policy bloquant les appels réseau : le `fetch()`
vers TMDB fonctionnera normalement, avec la clé (v3 ou Bearer v4) que tu as
déjà.

## Depuis un téléphone (le plus simple) : StackBlitz

StackBlitz fait tourner Node directement dans le navigateur mobile — aucune
installation, aucun terminal.

**Option A — via GitHub (le chemin le plus fluide sur mobile) :**
1. Sur github.com (dans le navigateur du téléphone), crée un nouveau repo vide.
2. "Add file → Upload files", dépose tout le contenu de ce dossier (glisser
   les fichiers depuis l'app Fichiers/Photos fonctionne).
3. Ouvre `https://stackblitz.com/github/TON-PSEUDO/NOM-DU-REPO` — StackBlitz
   importe et lance le projet automatiquement.

**Option B — import direct du zip :**
1. Va sur stackblitz.com, "Create project" → "Import from ZIP" (ou dépose
   le fichier `.zip` s'il y a une zone de dépôt).
2. StackBlitz détecte `package.json` et installe/lance tout seul.

Une fois le projet ouvert dans StackBlitz : colle ta clé TMDB dans la barre
qui apparaît sur l'écran Feed. StackBlitz te donne aussi un lien public
partageable directement, pas besoin de Vercel/Netlify pour tester.

## Depuis un ordinateur

```bash
npm install
npm run dev
```

Ouvre l'URL affichée (en général `http://localhost:5173`).

## Mettre en ligne pour de bon (lien public permanent)

```bash
npm run build
```

Ça génère un dossier `dist/`. Dépose-le sur **Vercel** ou **Netlify**
(glisser-déposer le dossier suffit sur leur interface) — tu obtiens une URL
publique en quelques minutes.

## Point d'attention sécurité

Pour l'instant, la clé TMDB tape directement dans le navigateur de la
personne qui utilise l'app (visible dans les requêtes réseau de son propre
navigateur). C'est acceptable pour un usage non-commercial en solo/démo.
Si l'app doit être partagée publiquement plus tard, il vaudra mieux
remettre en place un petit backend (Supabase Edge Function par exemple)
qui garde la clé côté serveur — architecture qu'on avait esquissée
plus tôt dans la conversation.

## Structure

```
src/App.jsx     — l'application (identique à l'artifact Claude)
src/main.jsx    — point d'entrée React
src/index.css   — Tailwind (nécessaire ici, contrairement à l'artifact
                  Claude qui a une feuille de style de base déjà prête)
```
