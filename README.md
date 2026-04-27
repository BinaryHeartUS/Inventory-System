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
