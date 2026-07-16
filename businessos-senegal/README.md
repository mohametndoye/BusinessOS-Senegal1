# BusinessOS Sénégal — V1

Plateforme de gestion pour PME sénégalaises et africaines : **ventes, produits, stock, clients, factures et finances** depuis une seule application.

Ce dossier contient le code source complet de la V1 (première étape de la stratégie produit) :
gestion des ventes, du catalogue produits et du stock, avec clients, facturation automatique et suivi financier de base.

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
L'API démarre sur `http://localhost:4000`.

### 2. Frontend (application web)

Dans un second terminal :
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
L'application est accessible sur `http://localhost:5173`.

### 3. Première utilisation

Ouvrez `http://localhost:5173`, cliquez sur **"Créer mon entreprise"**, renseignez le nom de votre entreprise, un email et un mot de passe. Vous êtes ensuite connecté et pouvez commencer à ajouter vos produits, enregistrer vos ventes et suivre vos finances.

## Fonctionnalités de la V1

- **Produits & Stock** — catalogue produit, prix de vente/coût, alerte de stock faible
- **Ventes** — vente multi-articles, déduction automatique du stock, génération de facture
- **Clients** — répertoire clients avec historique d'achats
- **Factures** — suivi payée / impayée, détail imprimable
- **Finances** — revenus encaissés, dépenses, bénéfice net
- **Comptes isolés par entreprise** — chaque entreprise inscrite ne voit que ses propres données

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router, lucide-react |
| Backend | Node.js, Express, lowdb (stockage JSON fichier, sans dépendance native) |
| Auth | JWT (jsonwebtoken) + mots de passe hashés (bcryptjs) |

`lowdb` a été choisi pour la V1 afin d'éviter toute compilation native (facilite le déploiement sur des serveurs low-cost, VPS africains ou Render/Railway). Pour la montée en charge (étapes suivantes de la roadmap), prévoir une migration vers PostgreSQL/MySQL.

## Déploiement

- **Backend** : déployable sur tout serveur Node.js (Render, Railway, VPS). Pensez à définir `JWT_SECRET` avec une valeur forte et unique en production, et `CORS_ORIGIN` avec l'URL exacte du frontend.
- **Frontend** : `npm run build` génère un dossier `dist/` statique déployable sur Vercel, Netlify, ou tout hébergement statique. Définissez `VITE_API_URL` vers l'URL de production de l'API.

## Roadmap (vision long terme)

Cette V1 est la première brique de BusinessOS Sénégal. Les étapes suivantes prévues par la stratégie produit :
1. Test terrain auprès de petites entreprises sénégalaises, itération sur les retours
2. Intégration des paiements mobiles (Wave, Orange Money)
3. Comptabilité avancée et rapports fiscaux
4. Fonctionnalités d'intelligence artificielle (prévisions de stock, recommandations)
5. Commerce B2B entre PME
6. Expansion vers d'autres pays d'Afrique de l'Ouest
