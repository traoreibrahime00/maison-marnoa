# CLAUDE.md — Maison Marnoa

## Présentation du projet

**Maison Marnoa** est une application e-commerce premium de bijoux (bagues, colliers, bracelets, montres) ciblant le marché west-africain. L'application est une SPA React déployée sur Vercel avec un backend Express.js.

---

## Architecture

```
maison-marnoa/
├── frontend/          # React 18 + Vite + TypeScript + Tailwind CSS
│   └── src/app/
│       ├── pages/         # Pages publiques + admin
│       ├── components/    # Composants réutilisables + shadcn/ui
│       ├── context/       # AppContext (cart, auth, wishlist, etc.)
│       ├── data/          # Données produits (fallback local)
│       └── lib/           # api.ts, analytics.ts
├── backend/           # Express.js + TypeScript + Prisma + Better Auth
│   └── src/server/
│       ├── routes/        # Routers Express (products, orders, payments...)
│       ├── modules/       # Services + repositories par domaine
│       ├── auth/          # Better Auth configuration
│       └── common/        # env.ts, errors.ts, express.ts, prisma.ts
├── backend/prisma/    # Schema Prisma + seed
├── vite.config.ts     # Proxy /api/* → Express :3000
├── vercel.json        # SPA routing (rewrites vers index.html)
└── package.json       # Scripts root (dev, build, seed)
```

**Monorepo** : un seul `package.json` à la racine gère frontend + backend.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, React Router 7, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Radix UI, Lucide icons |
| State | React Context API (AppContext) |
| Build | Vite 6 |
| Backend | Express.js 4, TypeScript, tsx (watch) |
| Auth | Better Auth 1.5 avec adapter Prisma |
| ORM | Prisma 6 |
| DB | PostgreSQL (Vercel Postgres) |
| Paiement | Wave (webhook), WhatsApp |
| Deploy | Vercel |

---

## Commandes essentielles

```bash
# Démarrage développement (frontend :5173 + backend :3000)
npm run dev

# Frontend seul
npm run dev:frontend

# Backend seul
npm run dev:backend

# Build production (génère Prisma client + Vite build)
npm run build

# Peupler la base de données
npm run db:seed

# Générer le client Prisma après modification du schema
npx prisma generate --schema=backend/prisma/schema.prisma

# Appliquer les migrations
npx prisma migrate dev --schema=backend/prisma/schema.prisma

# Prisma Studio
npx prisma studio --schema=backend/prisma/schema.prisma
```

---

## Variables d'environnement

Fichier : `backend/.env` (jamais commité)

```env
DATABASE_URL=""           # Connection pooler Vercel Postgres
DIRECT_URL=""             # Connexion directe (pour migrations)
PORT=3000
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:3000"
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000/api/auth"
BETTER_AUTH_TRUSTED_ORIGINS="http://localhost:5173"
ADMIN_WHATSAPP_NUMBER=""  # Numéro WhatsApp admin
```

Frontend : `VITE_API_URL` (optionnel, le proxy Vite gère `/api/*` en dev)

---

## API Endpoints

Base URL : `/api`

| Router | Préfixe | Fonctions principales |
|--------|---------|----------------------|
| Products | `/api/products` | CRUD produits |
| Orders | `/api/orders` | Créer/lister/màj commandes |
| Payments | `/api/payments` | Checkout Wave, webhook Wave |
| Receipts | `/api/receipts` | Générer/afficher reçus HTML |
| Admin | `/api/admin` | Dashboard, filtres commandes/paiements |
| Analytics | `/api/analytics` | Track events, summary |
| Auth | `/api/auth/*` | Better Auth (login, signup, session) |
| Health | `/api/health` | `{ ok: true }` |

---

## Modèles de données (Prisma)

Modèles principaux :
- `Product` — bijoux (catégorie, collection, stock, prix)
- `Order` — commande client (ref unique, statuts, livraison, total)
- `OrderItem` — ligne de commande (produit, qté, taille, couleur)
- `Payment` — transaction (Wave/WhatsApp, statuts, webhook data)
- `Receipt` — reçu généré automatiquement à la commande
- `AnalyticsEvent` — tracking événements
- `NotificationLog` — log notifications
- `User / Session / Account / Verification` — Better Auth

Enums clés :
- `OrderStatus` : `PENDING_WHATSAPP → CONFIRMED → PAID → SHIPPED → DELIVERED | CANCELLED`
- `PaymentMethod` : `WHATSAPP | WAVE`
- `PaymentStatus` : `INITIATED → PENDING → SUCCESS | FAILED | REFUNDED`
- Devise : `XOF` (Franc CFA)

---

## Conventions de code

### Backend (modules)
Chaque domaine suit le pattern : `service.ts` + `repository.ts` + `validator.ts` + `types.ts`

```
modules/
  products/
    products.service.ts      # Logique métier
    products.repository.ts   # Accès Prisma
    products.validator.ts    # Validation payloads
    products.types.ts        # Types TypeScript
```

Middlewares :
- `asyncHandler()` dans `common/express.ts` pour wrapper les handlers async
- `HttpError` dans `common/errors.ts` pour les erreurs API

### Frontend (AppContext)
Toute la logique d'état global passe par `AppContext` :
- Panier, wishlist, utilisateur, thème, gift wrap, points fidélité
- Persité en `localStorage`
- Synchronisation avec l'API backend au montage

### Composants UI
- Utiliser les composants `shadcn/ui` existants dans `frontend/src/app/components/ui/`
- Ne pas installer de nouvelles librairies UI sans justification
- Style avec Tailwind CSS uniquement (pas de CSS inline sauf cas exceptionnel)

---

## Fonctionnalités clés

- **Mobile-first** : navigation par `BottomNav` sur mobile, `DesktopHeader` sur desktop
- **WhatsApp-first** : bouton WhatsApp CTA omniprésent, commandes initiées via WhatsApp
- **Fallback produits** : données locales (`data/products.ts`) si le backend est indisponible
- **Admin panel** : dashboard complet sous `/admin/*` avec accès role-based
- **Loyauté** : système de points fidélité côté AppContext
- **Dark mode** : via `next-themes`

---

## Déploiement (Vercel)

- Frontend : buildé par Vite → `./dist`, servi comme SPA (rewrites dans `vercel.json`)
- Backend : doit être déployé séparément ou configuré comme serverless function Vercel
- DB : Vercel Postgres (variables `DATABASE_URL` + `DIRECT_URL` fournies par Vercel)
- Le `npm run build` exécute `prisma generate` avant `vite build`

---

## Points d'attention

1. **Idempotence commandes** : création via `orderRef` unique, vérifier avant insert
2. **Stock** : validé au moment de la commande dans `orders.service.ts`
3. **Reçu automatique** : généré dès la création d'une commande
4. **Wave webhooks** : endpoint public `/api/payments/wave/webhook` (pas d'auth)
5. **Rôles** : `client` (défaut) et `admin` — vérifier le rôle dans les routes admin
6. **CORS** : géré dans `backend/src/server/app.ts`, origines via `BETTER_AUTH_TRUSTED_ORIGINS`
