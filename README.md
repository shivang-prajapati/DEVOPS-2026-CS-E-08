# EstateX

EstateX has been reworked toward a MongoDB-backed MERN-style setup. The backend is now powered by Express + Mongoose and uses MongoDB for users, properties, contacts, and enquiries.

## Stack

- Frontend: static landing page retained for the current repository, with API-ready data flow
- Backend: Express API with JWT auth and Mongoose models
- Database: MongoDB

## Local development

Requirements: Node.js 20+, MongoDB running locally or via Docker.

```bash
npm install
npm start
```

Set up a `.env` file using the values in `.env.example`.

## Environment variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/estatex
JWT_SECRET=change-me-to-a-long-random-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

## API routes

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/admin-check`
- `GET /api/properties`
- `POST /api/properties`
- `POST /api/contact`
- `GET /api/contact`
- `POST /api/enquiries`
- `GET /api/enquiries`

## Notes

This repository originally mixed Supabase/SQLite assumptions with a static front end. The latest backend rework removes that mismatch and standardizes on MongoDB and Mongoose as the real persistence layer for the EstateX project.