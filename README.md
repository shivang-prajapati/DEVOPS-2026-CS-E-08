# EstateX

EstateX is an Express API and static real-estate website. Local development uses SQLite; production uses Supabase Postgres and is hosted as a Vercel Node function.

## Local Development

Requirements: Node.js 20 or newer.

```sh
npm ci
npm test
npm start
```

Without Supabase credentials and with `NODE_ENV` unset or set to `development`, the API uses `database.sqlite` and local demo users. Do not use the demo credentials or development JWT secret in production.

## Supabase Setup

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor.
3. Keep the service-role key on the server only. The schema enables row-level security and grants application access only to `service_role`.

## Vercel Deployment

Import this repository into Vercel and set the project root to the repository root. The checked-in [`vercel.json`](vercel.json) routes the website and API through the Express function. No separate build command or output directory is required.

Set these Vercel environment variables for Production:

- `NODE_ENV=production`
- `JWT_SECRET` to a long, unique random value
- `SUPABASE_URL` to the Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` to the server-side service-role key

Deploy, then verify `/api/health` reports `database: "supabase"`. Public registration always creates client accounts. To grant staff access, register the account first, then promote it from the Supabase SQL Editor, for example:

```sql
update public.users
set role = 'admin'
where email = 'approved-admin@example.com';
```

The user must sign in again to receive a token with the updated role. Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code or a `NEXT_PUBLIC_*` variable.