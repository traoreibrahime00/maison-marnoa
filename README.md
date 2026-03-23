
# MAISON MARNOA

E-commerce premium bijoux (React + Vite + TypeScript + Express + Prisma + Better Auth).

## Architecture

Le projet est organise avec deux dossiers metiers principaux:

```txt
frontend/
  index.html
  src/                  # UI React (pages, composants, context, styles)

backend/
  src/server/           # API Express MVC (routes/services/repos)
  prisma/               # schema.prisma + seed.ts
```

## Demarrage

1. `npm install`
2. Configurer `backend/.env` (au minimum `DATABASE_URL`)
3. `npm run dev`

Le script `dev` lance:
- frontend Vite sur `http://localhost:5173`
- backend Express sur `http://localhost:3000`

Build production:

1. `npm run build`

## Notes

- Le schema Prisma actif est `backend/prisma/schema.prisma`.
- Backend Express entrypoint: `backend/src/server/index.ts`.
- Les appels frontend utilisent `VITE_API_URL` si defini; sinon Vite proxy `/api/*` vers `http://localhost:3000`.
- L'ancien dossier `src/` racine n'est plus utilise (remplace par `frontend/src/`).

Exemple `.env` frontend:

```env
VITE_API_URL=http://localhost:3000
```
  
