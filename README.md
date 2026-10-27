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

## Deploy the backend and CRM on Render

The `render.yaml` Blueprint deploys the Express server, static site, and CRM API as one Render web service. MongoDB is hosted separately on MongoDB Atlas; Render stores the connection string as a secret environment variable.

1. Create a MongoDB Atlas project and cluster.
2. In Atlas **Database Access**, create a database user with read/write access to the `estatex` database.
3. In Atlas **Network Access**, add the outbound IP ranges shown for the Render service after it is created. Do not leave the database open to `0.0.0.0/0` for production.
4. In Atlas, choose **Connect → Drivers**, copy the connection string, replace its password placeholder, and set the database name to `estatex`. URL-encode special characters in the password. It should look like:

   ```text
   mongodb+srv://<database-user>:<encoded-password>@<cluster-host>/estatex?retryWrites=true&w=majority&appName=EstateX
   ```

5. Push the project, including `render.yaml`, to the GitHub branch you want to deploy.
6. In Render, choose **New → Blueprint**, connect the repository and branch, review the `estatex-crm` service, and create it.
7. When prompted, provide the Atlas URI for `MONGODB_URI`. Render generates `JWT_SECRET`; do not commit either secret. The service runs `npm ci --omit=dev` and `npm start`.
8. Add the Render outbound IP ranges to Atlas **Network Access**, then wait for the deployment and `/api/health` health check to succeed.
9. Open the Render service URL. The public website is served at `/`; the CRM-related backend routes are under `/api`, and the health response is at `/api/health`. The health check reports `UP` only when MongoDB is connected.

If deployment fails, check Render logs and confirm that `MONGODB_URI` has the correct password, database name, and Atlas cluster host, and that Atlas allows the Render outbound IP ranges.

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

MongoDB Atlas is the production database for the Render deployment. Keep connection strings and JWT secrets in Render's environment settings, not in source files.