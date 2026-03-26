# Maison Marnoa

> Plateforme e-commerce premium de haute joaillerie — Abidjan, Côte d'Ivoire.

SPA React + API Express.js, déployée sur VPS Hostinger sous Docker Compose avec nginx.

---

## Table des matières

- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [Commandes utiles](#commandes-utiles)
- [API Endpoints](#api-endpoints)
- [Déploiement](#déploiement)
- [Sécurité — OWASP Top 10](#sécurité--owasp-top-10)

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, React Router 7, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Radix UI, Lucide, Recharts |
| Animations | Motion (Framer Motion) |
| State | React Context API |
| Build | Vite 6 |
| Backend | Express.js 4, TypeScript, tsx |
| Auth | Better Auth 1.5 + Prisma adapter |
| ORM | Prisma 6 |
| Base de données | PostgreSQL 16 |
| Sécurité | helmet, express-rate-limit, CORS, HMAC webhooks |
| Paiement | Wave CI (webhook), WhatsApp-first |
| Email | Nodemailer (SMTP) |
| Images | Cloudinary (upload direct navigateur) |
| Déploiement | VPS Hostinger — Docker Compose + nginx + GitHub Actions |

---

## Architecture

```
maison-marnoa/
├── frontend/                   # React 18 + Vite + TypeScript
│   └── src/app/
│       ├── pages/              # Pages publiques + admin (lazy-loaded)
│       ├── components/         # Composants réutilisables + shadcn/ui
│       ├── context/            # AppContext (cart, auth, wishlist, dark mode)
│       ├── data/               # Données produits (fallback local)
│       ├── utils/              # orderStatus.ts, whatsapp.ts
│       └── lib/                # api.ts, analytics.ts
├── backend/
│   └── src/server/
│       ├── routes/             # Routers Express par domaine
│       ├── modules/            # Services + repositories + validators
│       ├── auth/               # Better Auth config + hooks
│       └── common/             # env.ts, errors.ts, express.ts, mailer.ts
├── backend/prisma/             # Schema Prisma + seed
├── infra/                      # Docker Compose + nginx
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── docker-compose.prod.yml
│   └── nginx.conf
├── .github/workflows/          # CI/CD GitHub Actions → VPS
├── env.production.example      # Template variables d'environnement
└── package.json                # Monorepo (frontend + backend)
```

### Architecture de production

```
Internet :80/:443
    └── nginx (container)
          ├── /         → fichiers statiques (dist Vite)
          └── /api/*    → backend:3000 (proxy_pass)
backend (Node/tsx) :3000
postgres :5432 (container interne)
```

---

## Démarrage rapide

### Prérequis

- Node.js >= 18
- PostgreSQL (ou Docker)

### Installation

```bash
git clone https://github.com/ORG/maison-marnoa.git
cd maison-marnoa
npm install
```

### Configuration

```bash
cp env.production.example backend/.env
# Éditer backend/.env avec vos valeurs locales
```

Variables minimales pour le développement :

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/maison_marnoa"
BETTER_AUTH_SECRET="une-chaine-aleatoire-32-caracteres-minimum"
FRONTEND_URL="http://localhost:5173"
```

### Lancer l'application

```bash
# Frontend (http://localhost:5173) + Backend (http://localhost:3000)
npm run dev

# Frontend seul
npm run dev:frontend

# Backend seul
npm run dev:backend
```

---

## Variables d'environnement

Voir [`env.production.example`](env.production.example) pour la liste complète.

| Variable | Requis | Description |
|----------|--------|-------------|
| `DATABASE_URL` | ✅ | URL PostgreSQL |
| `BETTER_AUTH_SECRET` | ✅ | Secret JWT (min. 32 chars) |
| `BETTER_AUTH_URL` | ✅ | URL complète de l'API auth |
| `FRONTEND_URL` | ✅ | URL du frontend (CORS) |
| `SMTP_HOST` / `SMTP_PORT` | ✅ | Config email |
| `SMTP_USER` / `SMTP_PASS` | ✅ | Credentials SMTP |
| `ADMIN_WHATSAPP_NUMBER` | ✅ | Numéro WA admin (format international) |
| `WAVE_API_KEY` | — | Clé API Wave pour les paiements |
| `WAVE_WEBHOOK_SECRET` | — | Secret HMAC pour vérifier les webhooks Wave |
| `VITE_CLOUDINARY_CLOUD_NAME` | — | Cloud Cloudinary (build-time) |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | — | Preset d'upload Cloudinary (build-time) |
| `GOOGLE_CLIENT_ID/SECRET` | — | OAuth Google (optionnel) |

> Les variables `VITE_*` sont injectées **à la compilation** (Vite). Elles doivent être présentes lors du `docker build` du frontend.

---

## Commandes utiles

```bash
# Build production (Prisma client + Vite bundle)
npm run build

# Peupler la base de données
npm run db:seed

# Créer un compte admin
npm run create:admin

# Générer le client Prisma après modification du schema
npx prisma generate --schema=backend/prisma/schema.prisma

# Appliquer une migration
npx prisma migrate dev --schema=backend/prisma/schema.prisma

# Prisma Studio (UI base de données)
npx prisma studio --schema=backend/prisma/schema.prisma
```

---

## API Endpoints

Base URL : `/api`

| Router | Préfixe | Auth | Description |
|--------|---------|------|-------------|
| Products | `/api/products` | admin (write) | CRUD produits + upload Cloudinary |
| Orders | `/api/orders` | admin (PATCH) | Créer / lister / mettre à jour commandes |
| Payments | `/api/payments` | — | Checkout Wave, webhook Wave (HMAC vérifié) |
| Receipts | `/api/receipts` | — | Générer et afficher reçus HTML |
| Promos | `/api/promos` | admin (sauf `/validate`) | Codes promo CRUD + validation |
| Appointments | `/api/appointments` | admin (`/all`) | Réservations showroom |
| Admin | `/api/admin` | **admin** | Dashboard, stats, notifications |
| Shipping | `/api/shipping` | — | Zones de livraison publiques |
| Settings | `/api/settings` | admin (write) | Config hero, paramètres app |
| Analytics | `/api/track` | — | Tracking événements |
| Auth | `/api/auth/*` | — | Better Auth (login, signup, OAuth, reset) |
| Health | `/api/health` | — | `{ ok: true }` |

---

## Déploiement

### Premier déploiement sur le VPS

```bash
# Sur le VPS
git clone https://github.com/ORG/maison-marnoa.git /opt/maison-marnoa
cd /opt/maison-marnoa

cp env.production.example .env.production
# Remplir toutes les valeurs dans .env.production

docker compose -f infra/docker-compose.prod.yml --env-file .env.production up -d --build
docker exec marnoa_backend npm run db:seed   # une seule fois
```

### CI/CD automatique

Push sur `main` → GitHub Actions → SSH sur le VPS → `docker compose up --build`.

Secrets GitHub requis : `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

### Renouvellement SSL (certbot)

```bash
# Cron sur le VPS
0 3 * * * certbot renew --quiet && docker exec marnoa_frontend nginx -s reload
```

---

## Sécurité — OWASP Top 10

Audit réalisé en mars 2026. État des 10 catégories et mesures en place.

### A01 — Broken Access Control ✅

| Mesure | Détail |
|--------|--------|
| `requireAdmin` middleware | Vérifie la session Better Auth + `role === 'admin'` sur **toutes** les routes d'écriture admin côté serveur |
| Appointments list protégée | `GET /api/appointments/all` requiert `requireAdmin` — le listing global n'est pas public |
| Isolation par rôle | Rôle `client` (défaut) vs `admin` — le rôle n'est jamais accepté depuis le client (`input: false`) |

> **Risque résiduel** : Les endpoints `/api/receipts/:ref` et `/api/orders/lookup` sont publics avec rate-limiting. Une vérification d'email est requise pour le lookup.

---

### A02 — Cryptographic Failures ✅

| Mesure | Détail |
|--------|--------|
| Mots de passe temporaires | Générés avec `crypto.randomBytes` (Node.js natif) — plus de `Math.random()` |
| Webhook Wave | Signature HMAC-SHA256 vérifiée via `timingSafeEqual` (`WAVE_WEBHOOK_SECRET`) |
| HTTPS | nginx terminaison SSL avec certificats Let's Encrypt (certbot) |
| Tokens auth | Gérés par Better Auth (sessions signées, expiration configurable) |
| Emails reset | Liens HTTPS uniquement, validité 1 heure (Better Auth) |

> **À faire en prod** : Configurer `WAVE_WEBHOOK_SECRET` dans `.env.production` avec la valeur fournie par le dashboard Wave.

---

### A03 — Injection ✅

| Mesure | Détail |
|--------|--------|
| Prisma ORM | Requêtes entièrement paramétrées — pas de concaténation SQL |
| Validation des inputs | Chaque route valide et caste les données entrantes avant usage |
| Codes promo | Normalisés en majuscules avant validation/insertion |
| Pas de `eval` ni `exec` | Aucune exécution dynamique de code côté backend |

---

### A04 — Insecure Design ✅

| Mesure | Détail |
|--------|--------|
| Rate limiting — login | 8 tentatives / 15 min par IP (`skipSuccessfulRequests: true`) |
| Rate limiting — lookup/promo | 20 requêtes / 5 min par IP |
| Rate limiting — commandes | 10 commandes / 10 min par IP (anti-spam) |
| Rate limiting — RDV | 5 réservations / 10 min par IP |
| `requireAdmin` | Middleware centralisé, appliqué systématiquement sur les routes sensibles |
| Idempotence commandes | `orderRef` unique — pas de doublon possible |

> **Risque résiduel** : Pas de CSRF token explicite. La protection repose sur CORS strict + `credentials: 'include'` sur les requêtes authentifiées. À renforcer si des formulaires HTML natifs sont ajoutés.

---

### A05 — Security Misconfiguration ✅

| Mesure | Détail |
|--------|--------|
| `helmet()` | Headers HTTP de sécurité (HSTS, X-Frame-Options, X-Content-Type-Options…) |
| `x-powered-by` désactivé | `app.disable('x-powered-by')` |
| CORS strict | Origines whitelistées via `BETTER_AUTH_TRUSTED_ORIGINS` + rejet des requêtes sans `Origin` en production |
| Erreurs Prisma masquées | Les codes/messages Prisma ne sont jamais renvoyés au client en production |
| `trust proxy` | Configuré pour que les IPs soient correctes derrière nginx (`app.set('trust proxy', 1)`) |
| Variables d'environnement | `.env` dans `.gitignore`, template `env.production.example` sans vraies valeurs |

---

### A06 — Vulnerable Components ⚠️

| Mesure | Détail |
|--------|--------|
| Dépendances à jour | Versions récentes (Vite 6, Express 4, Better Auth 1.5, Prisma 6) |
| `npm audit` | À exécuter régulièrement et intégrer en CI |

> **Action recommandée** : Ajouter `npm audit --audit-level=high` dans le workflow GitHub Actions et configurer Dependabot pour les mises à jour automatiques.

---

### A07 — Identification & Authentication Failures ✅

| Mesure | Détail |
|--------|--------|
| Better Auth | Gestion sessions, tokens, reset password — librairie battle-tested |
| Rate limit login | 8 tentatives / 15 min — ralentit le brute-force |
| Reset password | Lien à usage unique, expirant en 1 heure, envoyé uniquement par email |
| Mot de passe min. | 6 caractères minimum (validé côté frontend + Better Auth) |
| Rôle non modifiable | `role` non accepté depuis le client à l'inscription (`input: false`) |
| Email de bienvenue | Envoyé automatiquement à chaque nouvelle inscription |

> **Risque résiduel** : Pas de MFA/2FA pour les comptes admin. Recommandé de l'activer via le plugin Better Auth si le compte admin est exposé à internet.

---

### A08 — Software & Data Integrity Failures ✅

| Mesure | Détail |
|--------|--------|
| Webhook Wave signé | Vérification HMAC avant tout traitement de paiement |
| `npm ci` | À utiliser en CI au lieu de `npm install` pour garantir l'intégrité du lock file |
| Prisma migrations | Schema versionné, migrations reproductibles |

---

### A09 — Security Logging & Monitoring Failures ✅

| Mesure | Détail |
|--------|--------|
| Stack traces masquées en prod | En `NODE_ENV=production`, seul `error.message` est loggué (pas la stack) |
| Erreurs Prisma loggées côté serveur | `console.error('[PrismaError]', code, message)` sans exposition client |
| Webhook invalide loggué | `console.warn('[Wave webhook] Signature invalide')` |
| `NotificationLog` | Table Prisma qui enregistre toutes les notifications WhatsApp envoyées |
| `AnalyticsEvent` | Table Prisma pour le tracking des événements utilisateur |

> **Action recommandée** : Intégrer un service de monitoring centralisé (ex: Sentry, Datadog) pour alerter sur les erreurs 5xx et les rejets d'authentification en production.

---

### A10 — Server-Side Request Forgery (SSRF) ✅

| Mesure | Détail |
|--------|--------|
| URL Wave hardcodée | L'endpoint Wave (`https://api.wave.com/...`) est hardcodé dans le service, pas configurable par l'utilisateur |
| `WAVE_MERCHANT_URL` validé | Seules les URLs du domaine Wave sont acceptées |
| Pas de fetch sur input utilisateur | Aucun endpoint ne fait de requête HTTP vers une URL fournie par le client |
| Emails reset URL validée | L'URL de reset provient exclusivement de Better Auth (`BETTER_AUTH_URL`) |

---

### Résumé du statut sécurité

| Catégorie | Statut | Niveau de risque résiduel |
|-----------|--------|--------------------------|
| A01 Broken Access Control | ✅ Corrigé | Faible |
| A02 Cryptographic Failures | ✅ Corrigé | Faible |
| A03 Injection | ✅ Corrigé | Très faible |
| A04 Insecure Design | ✅ Corrigé | Faible |
| A05 Security Misconfiguration | ✅ Corrigé | Faible |
| A06 Vulnerable Components | ⚠️ Partiel | Moyen (audit manuel requis) |
| A07 Identification & Auth | ✅ Corrigé | Faible (MFA admin recommandé) |
| A08 Data Integrity | ✅ Corrigé | Faible |
| A09 Logging & Monitoring | ✅ Corrigé | Moyen (monitoring externe recommandé) |
| A10 SSRF | ✅ Corrigé | Très faible |

---

## Licence

Projet propriétaire — © 2026 Maison Marnoa. Tous droits réservés.
