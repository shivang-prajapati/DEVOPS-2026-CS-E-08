# EstateX

EstateX is an Express API, static real-estate website, and CRM platform.

## Stack

- **Frontend**: Static landing page with dynamic API data flow and CRM dashboard (`/crm`)
- **Backend**: Express API with JWT auth and metrics instrumentation
- **Database**: MongoDB (production / Render) or SQLite (local / fallback)
- **Monitoring**: Prometheus and Grafana dashboards

## Local development

Requirements: Node.js 20+.

```bash
npm install
npm test
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
7. When prompted, provide the Atlas URI for `MONGODB_URI`. Render generates `JWT_SECRET` and `ADMIN_SETUP_KEY`; do not commit either secret. The service runs `npm ci --omit=dev` and `npm start`.
8. Add the Render outbound IP ranges to Atlas **Network Access**, then wait for the deployment and `/api/health` health check to succeed.
9. Create the first administrator by submitting a POST request to `/api/auth/setup-admin` with JSON fields `name`, `email`, `password` (at least 12 characters), and `setupKey` (the value of Render's `ADMIN_SETUP_KEY`). The endpoint works only before the first admin exists. Log in using `/api/auth/login` after creation, then remove `ADMIN_SETUP_KEY` from Render's environment and redeploy.
10. Open the Render service URL. The public website is served at `/`; the CRM-related backend routes are under `/api`, and the health response is at `/api/health`. The health check reports `UP` only when MongoDB is connected.

If deployment fails, check Render logs and confirm that `MONGODB_URI` has the correct password, database name, and Atlas cluster host, and that Atlas allows the Render outbound IP ranges.

## Docker & Prometheus Monitoring Setup

The project includes full Docker, Prometheus, and Grafana instrumentation.

### Services Overview
- **EstateX Application (`app`)**: Runs the Node.js/Express service and exposes Prometheus metrics at `/metrics` (Port `3000`).
- **Prometheus (`prometheus`)**: Scrapes application and runtime metrics every 5 seconds (Port `9090`).
- **Grafana (`grafana`)**: Pre-provisioned with Prometheus datasource and EstateX dashboards (Port `3001`).

### Running with Docker Compose

1. **Build and start all containers**:
   ```sh
   docker compose up -d --build
   ```

2. **Check container status**:
   ```sh
   docker compose ps
   ```

3. **Access Services**:
   - **Application**: [http://localhost:3000](http://localhost:3000)
   - **Metrics Endpoint**: [http://localhost:3000/metrics](http://localhost:3000/metrics)
   - **Prometheus Dashboard**: [http://localhost:9090](http://localhost:9090)
   - **Grafana Dashboard**: [http://localhost:3001](http://localhost:3001) *(Default login: admin / admin)*

4. **Stop containers**:
   ```sh
   docker compose down
   ```

## Environment variables

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/estatex
JWT_SECRET=change-me-to-a-long-random-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

## API routes

- `GET /api/health`
- `GET /metrics`
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
