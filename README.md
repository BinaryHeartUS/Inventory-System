# Inventory System

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [VS Code](https://code.visualstudio.com/)
  - [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension

## Getting Started

1. Open the project folder in VS Code
2. When prompted, click **Reopen in Container** (or open the Command Palette and run `Dev Containers: Reopen in Container`)
3. Once inside the container, start the app:
   ```bash
   docker compose up
   ```

## Accessing the App (When running via docker)

| Service     | URL                                                           |
| ----------- | ------------------------------------------------------------- |
| Frontend    | http://localhost                                              |
| Backend API | http://localhost:8080/api                                     |
| Swagger UI  | http://localhost:8080/swagger                                 |
| Database    | `localhost:5432` — database: `inventory`, user: `binaryheart` |

## End-to-End Tests

The Playwright suite runs against frontend and backend images built from the current checkout and
a temporary PostgreSQL database. The database is migrated and seeded with synthetic E2E data,
reset after every serial test, and destroyed with its containers when the run finishes.

Install the frontend dependencies and Chromium once, then run the suite from the repository root:

```bash
cd frontend && npm ci && npx playwright install chromium && cd ..
make test-e2e
```

Docker Desktop must be running. Set `E2E_PORT` to use a frontend port other than `4173`. The same
command runs as the required full-stack E2E pull-request gate in GitHub Actions; it never connects
to the development or production databases.

## Deployment

Dev and prod both run on a single VPS as two isolated Docker Compose stacks
behind one shared Caddy reverse proxy. Images are built in GitHub Actions, pushed
to GHCR, and pulled on the server.

| Piece | File |
| --- | --- |
| Per-environment app stack (db, migrate, backend, frontend) | [docker-compose.app.yml](docker-compose.app.yml) |
| Shared Caddy reverse proxy | [docker-compose.proxy.yml](docker-compose.proxy.yml), [Caddyfile](Caddyfile) |
| Non-secret per-env config | [deploy/dev.env](deploy/dev.env), [deploy/prod.env](deploy/prod.env) |
| Proxy domains | [deploy/proxy.env](deploy/proxy.env) |
| Secrets template (copied to `secrets/<env>.env` on the server) | [deploy/secrets.env.example](deploy/secrets.env.example) |

Each environment runs its own separate `frontend`, `backend`, and Postgres
containers (with its own named volume), so dev and prod never share data and you
can deploy/test any branch on dev without touching prod. Only the frontends join
the shared `web` network; Caddy routes `inventory.binaryheart.org` → prod and
`inventory.binaryheart.dev` → dev.

## Central authentication

Dev Inventory now signs in through `https://auth.binaryheart.dev` using an
authorization code with PKCE. Inventory verifies the RS256 signature, issuer,
audience, token type and expiry, then maps shared and Inventory-specific roles
to its existing chapter permissions. It never accepts legacy Inventory JWTs
when central authentication is enabled.

The next production deploy also enables central auth, using
`https://auth.binaryheart.org`. **Before Deploy Prod**, complete the
[production cutover runbook](https://github.com/BinaryHeartUS/binaryheart-auth/blob/main/deploy/production-cutover.md):
new production infrastructure/auth, a provisioned signing key, stopped legacy
writers and a verified one-time identity import. Inventory deployment refuses
activation without the production import receipt, callback, National Admin and
healthy public auth/JWKS. Its database stays where it is.

The default local stack still uses legacy authentication.
No Inventory account/chapter tables are dropped or rewritten by this change.

### Dev deploy order

1. Make sure the identity transfer to auth dev is complete and chapter/account
   IDs still match Inventory dev. If legacy identities changed since the copy,
   reconcile those changes before switching. Stop managing accounts in the
   legacy Inventory UI once cutover begins.
2. Deploy **binaryheart-auth dev first**, including the new
   `V20261108.52__Register_Inventory_Dev_Callback.sql` migration. It registers
   the exact callback `https://inventory.binaryheart.dev/auth/callback`.
   It also deploys the **Applications** menu on the signed-in auth console.
   The auth sign-in page has no application-navigation link. Do not edit an already-applied migration or rerun the identity
   replacement just to register this callback.
3. Deploy this Inventory revision using **Deploy Dev**. Its checked-in
   `deploy/dev.env` sets:

   ```dotenv
   AUTH_MODE=central
   AUTH_ISSUER=https://auth.binaryheart.dev
   ```

   The frontend reads the backend's runtime configuration; there are no new
   frontend build arguments, client secrets or server secrets to synchronize.
   Keep the existing `JWT_SECRET` for possible legacy rollback.
   No infrastructure redeploy or Inventory database migration is needed.
4. Verify the mode:

   ```sh
   curl --fail https://inventory.binaryheart.dev/api/auth/config
   curl --fail https://inventory.binaryheart.org/api/auth/config
   ```

   Dev should report `"enabled":true`, issuer `https://auth.binaryheart.dev`
   and client ID `inventory`. After the production cutover, production should
   report `"enabled":true` with issuer `https://auth.binaryheart.org`.
   An older production revision may not have this endpoint.

### Acceptance checks

- Open an Inventory dev deep link while signed out. Click **Sign in with
  BinaryHeart**; authenticate on auth dev and confirm you return to that
  Inventory page, including its query string.
- Check Viewer, Editor, Chapter Admin and National Admin accounts. Viewer
  cannot write inventory or see management links; Editor can write only in
  permitted chapters; admin permissions remain chapter-scoped.
- **My account** opens the central portal in the same tab. Account and chapter
  management live in that portal rather than appearing as duplicate Inventory
  shortcuts; only admins see those portal pages. Use **Applications → Inventory**
  to open the Inventory dashboard, regardless of how you arrived at the portal.
- Create/manage accounts and passwords in auth, not Inventory. A new account
  with an Inventory role should be able to sign into Inventory without a
  corresponding legacy Volunteer row.
- Use Inventory's **Sign out** action (in the sidebar/mobile menu). It clears
  the Inventory token and filters, ends the central auth session, and returns
  to Inventory sign-in. Signing in again should require credentials.
- Expired application tokens return the user to Inventory sign-in. The user
  explicitly clicks to resume via SSO; there is no automatic renewal loop.

The old `/api/auth/login` and `/api/accounts` endpoints are unavailable in
central mode. Inventory still reads its own chapter table for names and
inventory foreign keys, but chapter creation/deletion is disabled; the auth
chapter directory is read-only. Do not create/delete/renumber chapters through
either service's API during this phase: cross-service chapter synchronization
is a separate step.

Role/password changes and auth-console sign-out do **not** revoke already-issued
Inventory tokens. They remain valid until expiry (currently one hour); sign
out of Inventory and sign back in to refresh permissions immediately.

### Configuration and rollback

`AUTH_MODE` defaults to `legacy`; any other value besides `legacy` or `central`
fails startup. `AUTH_ISSUER` is required in central mode and must be an HTTPS
origin without a trailing slash (HTTP localhost is allowed for development).
JWKS are cached for five minutes and refreshed on unknown key IDs, with a
ten-second minimum between fetches. Key retrieval failures are reported as
503 errors rather than falling back to legacy authentication.

For local central-auth testing, use the same browser-facing issuer as auth
(normally `http://localhost:8082`) and a registered Inventory callback
(`http://localhost/auth/callback` or `http://localhost:5173/auth/callback`).
If Inventory runs in Docker and cannot reach that issuer via localhost,
`AUTH_JWKS_URL` can point at the trusted internal JWKS endpoint instead;
token issuer validation still uses `AUTH_ISSUER`. These backend variables
must be supplied by a local Compose override or your IDE launch environment.
The auth portal's local Inventory application link targets `http://localhost/`.

To roll back dev, set `AUTH_MODE=legacy` in the dev deployment configuration
and redeploy the **same revision**. No schema rollback is required. Existing
central sessions are discarded by Inventory when the mode changes. Legacy
accounts/roles reflect the last state in Inventory, **not** changes made in
auth after cutover, so reconcile identities before treating rollback as an
operational recovery. Production defaults to central auth; use the production
runbook's configuration-only rollback, not an arbitrary older code revision.

Run `bash scripts/tests/production-auth.sh` to test production preflight
fail-closed behavior without contacting live services.