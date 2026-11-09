# Inventory System

## Requirements

- Docker Desktop (or Docker Engine with Compose).
- The sibling `binaryheart-infrastructure` and `binaryheart-auth` repositories.
- Node.js and Java 25 for development outside Docker.

## Local development

Start infrastructure, then auth, then Inventory:

```sh
cd ../binaryheart-infrastructure
docker compose up -d --wait
cd ../binaryheart-auth
docker compose up -d --build
cd ../Inventory-System
docker compose up -d --build db db-migrate backend frontend
```

Open **http://localhost**, not `127.0.0.1`: OAuth callbacks are registered
exactly. Click **Sign in with BinaryHeart** to authenticate at
http://localhost:8082. The auth development seed includes `viewer` / `viewer`;
account and role management live in that service, not Inventory.

Inventory's local database is published at **localhost:5433** to avoid the
shared infrastructure Postgres on port 5432. Its named volume is unchanged.
Local credentials are database `inventory`, user `binaryheart`, password
`changeme`. Backend API: http://localhost:8080/api; Swagger:
http://localhost:8080/swagger.

The backend uses public issuer `http://localhost:8082` and fetches verification
keys via `host.docker.internal:8082` (a host-gateway mapping is included for
Linux). Keep account chapter IDs in auth aligned with Inventory's chapter IDs;
fresh local databases both seed National as ID 1. Chapter mutation is disabled
pending cross-service synchronization.

For frontend hot reload:

```sh
cd frontend
npm ci
npm run dev
```

Use http://localhost:5173 (also registered in local auth). Vite proxies `/api`
to the Inventory backend. A backend launched directly by an IDE needs
`AUTH_ISSUER=http://localhost:8082` and its normal database settings; an internal
JWKS override is unnecessary when the backend runs on the host.

## Authentication and authorization

Inventory is an OAuth public client using authorization code + PKCE (S256).
It never accepts passwords or signs access tokens. The backend verifies auth's
RS256 signature, issuer, audience, token type and expiration before mapping
shared and Inventory-specific roles to chapter permissions.

- **My account** opens the central account portal. **Applications > Inventory**
  returns to Inventory without assuming where the user arrived from.
- Explicit **Sign out** clears Inventory's session/filters and ends central SSO.
- Expired tokens return to Inventory sign-in; the user explicitly resumes SSO.
- Role/password changes do not revoke issued access tokens immediately
  (currently one-hour lifetime). Sign out/in to refresh permissions.
- Account management is exclusively in auth. Inventory retains a read-only
  chapter directory for inventory foreign keys and names, not an identity store.

`AUTH_ISSUER` is required: `https://auth.binaryheart.dev` for dev and
`https://auth.binaryheart.org` for prod. It must be an HTTPS origin without a
trailing slash (HTTP localhost is allowed locally). Optional `AUTH_JWKS_URL`
provides a trusted internal fetch URL without changing issuer validation.
JWKS are cached for five minutes; unknown-key refreshes are throttled to ten
seconds. Key retrieval failures return 503; there is no local-auth fallback.

The frontend loads issuer/client ID from `/api/auth/config` at startup.
`/api/auth/session` returns backend-verified permissions. Local login, password,
account-management and chapter-mutation endpoints do not exist. There is no
authentication mode flag or Inventory signing secret.

## Deployment

Dev and prod run as isolated Compose stacks on the VPS. GitHub Actions builds
images, pushes them to GHCR and deploys them through the shared proxy maintained
in `binaryheart-infrastructure`. Auth must be available for sign-in.

| Piece | File |
| --- | --- |
| Inventory app and database stack | [docker-compose.app.yml](docker-compose.app.yml) |
| Environment config | [deploy/dev.env](deploy/dev.env), [deploy/prod.env](deploy/prod.env) |
| Database secrets reference | [deploy/secrets.env.example](deploy/secrets.env.example) |

Inventory still owns its existing Postgres instance and volume; auth uses the
infrastructure-managed database. Inventory deploys do not access auth's database
or require migration receipts.

Set `DB_PASSWORD`, `API_USER_PASSWORD` and `IMPORTER_PASSWORD` on the appropriate
GitHub Environment and run **Sync Secrets**, then **Deploy Dev** or **Deploy Prod**.
The obsolete `JWT_SECRET` GitHub secret can be deleted; run Sync Secrets to remove
it from the deployed secrets file. Verify `/api/health/ready` returns `OK` and
`/api/auth/config` reports the expected issuer after deployment.

Database changes use forward-only Flyway migrations. The identity-removal
migration permanently removes Inventory's old accounts/passwords/role assignments,
but preserves chapters and inventory data. Take a normal database backup before
deploying schema changes. Old Inventory builds requiring those tables are no
longer compatible; fix forward rather than attempting an auth-mode rollback.
Previously stored browser sessions are cleared once and users sign in again.

## Tests

```sh
make test-java
cd frontend && npm ci && npx playwright install chromium && cd ..
make test-web
make test-e2e
```

The E2E suite uses disposable databases and a synthetic OAuth provider, never
dev/prod accounts or databases. See [docker-compose.e2e.yml](docker-compose.e2e.yml).
Unit tests cover PKCE state/issuer checks, stored-session expiration, JWT/JWKS
validation and chapter-scoped authorization.
