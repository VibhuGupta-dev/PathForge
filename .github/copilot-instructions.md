# Copilot Instructions for Carrier Guidance

## Project Overview
- **Monorepo** with `backend` (Node.js/Express, MongoDB) and `frontend` (React + Vite) apps.
- **Backend**: REST API using Express, with folders for controllers, middleware, models, routes, and utils (currently empty, but structure is in place for expansion).
- **Frontend**: React app bootstrapped with Vite, using functional components and hooks. Styling uses Tailwind CSS utility classes (see `Auth-page.jsx`).

## Key Workflows
### Backend
- **Start dev server**: `npm run dev` (uses `nodemon` for hot reload)
- **Main entry**: `backend/index.js`
- **Environment**: Uses `.env` (dotenv) for config
- **Dependencies**: Express, Mongoose, JWT, CORS, Cookie Parser
- **Error handling**: Centralized error middleware in `index.js`
- **API root**: `/` returns JSON health check

### Frontend
- **Start dev server**: `npm run dev` (in `frontend`)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (custom ESLint config in `eslint.config.js`)
- **Main entry**: `src/main.jsx`, root component is `App.jsx`
- **Component pattern**: Functional, hooks-based, colocated in `src/components/`
- **Styling**: Tailwind utility classes (see `Auth-page.jsx`)

## Conventions & Patterns
- **Backend**: Follows standard Express/Mongoose structure. Add new features by creating files in `controller/`, `models/`, `routes/`, and wiring them in `index.js`.
- **Frontend**: Use functional React components. Place new UI in `src/components/`. Use hooks for state. Prefer Tailwind for styling.
- **Linting**: ESLint config disables unused var errors for vars starting with uppercase/underscore (see `eslint.config.js`).
- **TypeScript**: Not currently used, but recommended for future expansion.

## Integration Points
- **API calls**: Frontend should call backend endpoints (e.g., for auth) via fetch/axios to the backend server (default `localhost:3000`).
- **Environment variables**: Use `.env` for backend secrets/config.

## Examples
- **Add a backend route**: Create a file in `routes/`, import and use it in `index.js`.
- **Add a frontend page**: Create a component in `src/components/`, import in `App.jsx`.

## References
- `backend/index.js` — Express app setup, error handling
- `frontend/src/components/Auth-page.jsx` — Example of React + Tailwind
- `frontend/eslint.config.js` — Custom lint rules

---
For more, see `frontend/README.md` and package.json scripts in each app.
