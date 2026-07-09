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