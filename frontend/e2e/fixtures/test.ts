import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { env } from "node:process";
import { fileURLToPath } from "node:url";
import { test as base, expect } from "@playwright/test";

interface Fixtures {
  databaseCleanup: void;
}

export const test = base.extend<Fixtures>({
  databaseCleanup: [
    async ({ page }, use) => {
      await use();
      void page;

      const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
      execFileSync(
        "docker",
        [
          "compose",
          "-p",
          env.E2E_COMPOSE_PROJECT ?? "inventory-e2e",
          "-f",
          resolve(repositoryRoot, "docker-compose.e2e.yml"),
          "exec",
          "-T",
          "db",
          "psql",
          "-v",
          "ON_ERROR_STOP=1",
          "-U",
          "binaryheart",
          "-d",
          "inventory",
          "-f",
          "/e2e/reset.sql",
        ],
        { stdio: "pipe" }
      );
    },
    { auto: true },
  ],
});

export { expect };
