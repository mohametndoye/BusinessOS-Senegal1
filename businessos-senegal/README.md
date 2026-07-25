# BusinessOS Sénégal — V2

Plateforme de gestion pour PME sénégalaises et africaines : **ventes, produits, stock, clients, factures, finances et paiements mobiles**, avec un espace d'administration pour piloter l'ensemble des entreprises inscrites.

## Structure du projet

```
businessos-senegal/
├── backend/     API REST (Node.js + Express + lowdb)
└── frontend/    Application web (React + Vite + Tailwind)
```

## Démarrage rapide

### 1. Backend (API)

```bash
cd backend
npm install
cp .env.example .env
npm start
```
L'API démarre sur `http://localhost:4000`. Node.js 18 ou supérieur est requis (utilise le `fetch` natif pour les intégrations Wave/PayDunya).

### 2. Frontend (application web)

Dans un second terminal :
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
L'application est accessible sur `http://localhost:5173`.

### 3. Créer votre entreprise

Ouvrez `http://localhost:5173`, cliquez sur **"Créer mon entreprise"**, renseignez son nom, un email et un mot de passe. Vous pouvez ensuite ajouter vos produits, enregistrer vos ventes, encaisser vos factures et suivre vos finances.

### 4. Créer un compte administrateur (optionnel)

Le compte admin donne accès à un espace séparé (`/admin`) pour superviser toutes les entreprises inscrites sur la plateforme.

```bash
cd backend
ADMIN_NAME="Équipe BusinessOS" ADMIN_EMAIL="admin@votredomaine.sn" ADMIN_PASSWORD="mot-de-passe-fort" npm run create-admin
```

Connectez-vous ensuite avec cet email/mot de passe : vous serez automatiquement redirigé vers l'espace d'administration plutôt que vers le tableau de bord entreprise.

## Fonctionnalités

- **Produits & Stock** — catalogue avec catégories en liste déroulante (création à la volée), alerte de stock faible
- **Ventes** — vente multi-articles, déduction automatique du stock, génération de facture
- **Clients** — répertoire clients avec historique d'achats
- **Factures** — suivi payée / impayée, téléchargement et impression en **PDF**, encaissement par **Wave**, **Orange Money** (via agrégateur) ou espèces
- **Finances** — revenus encaissés, dépenses, bénéfice net, graphique d'activité sur 14 jours
- **Paramètres** — profil de l'entreprise (repris sur les factures PDF), changement de mot de passe
- **Espace administrateur** — vue d'ensemble de la plateforme (revenus, entreprises actives, graphique global), liste et fiche détaillée de chaque entreprise, suspension/réactivation de comptes
- **Comptes isolés par entreprise** — chaque entreprise inscrite ne voit que ses propres données

## Paiements mobiles (Wave & Orange Money)

L'application intègre deux rails de paiement réels utilisés au Sénégal :

- **Wave**, via l'API officielle [Wave Checkout](https://docs.wave.com/checkout) (une clé API par compte marchand Wave Business)
- **Orange Money**, via l'agrégateur [PayDunya](https://paydunya.com), qui permet d'accepter Orange Money (ainsi que Free Money et Wizall) sans passer par la procédure d'agrément marchand directe d'Orange, plus longue à obtenir

**Sans aucune clé configurée**, l'application fonctionne automatiquement en **mode démonstration** : un bouton "Simuler le paiement reçu" permet de tester tout le parcours (création de session, confirmation, passage de la facture en "payée") sans compte marchand réel.

Pour activer les paiements réels, renseignez dans `backend/.env` :

```bash
# Wave — clé obtenue depuis le Business Portal Wave
WAVE_API_KEY=
WAVE_WEBHOOK_SECRET=

# PayDunya — clés obtenues dans votre espace marchand PayDunya (gratuit)
PAYDUNYA_MASTER_KEY=
PAYDUNYA_PRIVATE_KEY=
PAYDUNYA_TOKEN=
PAYDUNYA_MODE=live   # "test" pendant vos essais, "live" en production

# URLs publiques (redirections après paiement / webhooks)
FRONTEND_URL=https://votre-app.vercel.app
BACKEND_URL=https://votre-api.onrender.com
```

## Factures PDF

Chaque facture peut être téléchargée ou ouverte en PDF (bouton "Télécharger" / "Imprimer" sur la liste et le détail de facture), avec en-tête personnalisé reprenant le nom, l'adresse et le téléphone renseignés dans **Paramètres**. Génération entièrement côté navigateur (jsPDF), aucun appel serveur nécessaire.

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router, recharts, jsPDF, lucide-react |
| Backend | Node.js, Express, lowdb (stockage JSON fichier, sans dépendance native) |
| Auth | JWT (jsonwebtoken) + mots de passe hashés (bcryptjs) + rôles owner/admin |
| Paiements | Wave Checkout API (direct), PayDunya (Orange Money / Free Money / Wizall) |

`lowdb` a été choisi afin d'éviter toute compilation native (facilite le déploiement sur des serveurs low-cost, VPS africains ou Render/Railway). Pour la montée en charge, prévoir une migration vers PostgreSQL/MySQL.

## Déploiement

- **Backend (Render, Railway, VPS...)** : définissez `JWT_SECRET` (valeur forte et unique), `CORS_ORIGIN` (URL exacte du frontend déployé), `FRONTEND_URL`/`BACKEND_URL`, et les clés Wave/PayDunya si vous les avez. Pensez à créer votre compte admin une fois déployé (`npm run create-admin`).
- **Frontend (Vercel, Netlify...)** : `npm run build` génère un dossier `dist/` statique. Définissez `VITE_API_URL` vers l'URL de production de l'API.

⚠️ **Stockage des données** : lowdb écrit dans `backend/data/db.json`. Sur les hébergeurs à système de fichiers éphémère (ex. Render sur le plan gratuit sans disque persistant), ce fichier peut être réinitialisé au redéploiement. Attachez un disque persistant à ce chemin, ou migrez vers une vraie base de données pour la production.

## Roadmap (vision long terme)

1. Migration vers une base de données persistante (PostgreSQL) pour la production
2. Comptabilité avancée et rapports fiscaux
3. Fonctionnalités d'intelligence artificielle (prévisions de stock, recommandations)
4. Commerce B2B entre PME
5. Expansion vers d'autres pays d'Afrique de l'Ouest
