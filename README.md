# BAJIM BLOSSOM KITCHEN & HOUSEHOLD ITEMS

Full-stack thrift contribution management platform for BAJIM BLOSSOM KITCHEN & HOUSEHOLD ITEMS.

## Architecture

The application consists of three clearly separated areas:

1. Public Website
2. Member Portal
3. Admin Portal

The system uses:

- Next.js
- React
- JavaScript
- JSX
- Tailwind CSS
- Node.js
- Express.js
- PostgreSQL
- bcryptjs
- HTTP-only cookies
- Render

## Architecture Flow

Next.js Frontend
        ↓
Express.js Backend
        ↓
PostgreSQL Database

## Important Rules

- JavaScript only
- No TypeScript
- No Supabase Auth
- No Firebase Authentication
- No Auth0
- No Clerk
- No online payment gateway
- All custom PostgreSQL tables must begin with `baj_`
- Backend is the authoritative source for business logic
- PostgreSQL is the authoritative data store
- Authentication is handled by Express.js
- Authentication credentials must not be stored in localStorage
- Financial records must be preserved
- Member data must be isolated
- Administrative permissions must be enforced server-side

## Project Structure

bajim-blossom/
│
├── frontend/
│
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── validators/
│       └── server.js
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── .gitignore
└── README.md

## Development

### Frontend
cd frontend
npm run dev


Frontend:
http://localhost:3000

### Backend
Open another terminal:
cd backend
npm run dev


Backend:
http://localhost:5000
Health check:
http://localhost:5000/api/health

## Development Phases

* Phase 0 — Project Setup
* Phase 1 — Database Foundation
* Phase 2 — Express Authentication
* Phase 3 — Public Website
* Phase 4 — Member Portal
* Phase 5 — Contribution Cycles
* Phase 6 — Admin Foundation
* Phase 7 — Admin Member Management
* Phase 8 — Payment Management
* Phase 9 — Fine Management
* Phase 10 — Member Items
* Phase 11 — Announcements
* Phase 12 — Reports
* Phase 13 — Activity Logs
* Phase 14 — Settings
* Phase 15 — Security Testing
* Phase 16 — Responsive Testing
* Phase 17 — Production Deployment
