import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const componentsDirectory = fileURLToPath(new URL("../components/", import.meta.url));
const componentFiles = readdirSync(componentsDirectory, { recursive: true })
  .filter((file): file is string => typeof file === "string")
  .filter((file) => file.endsWith(".tsx") && !file.endsWith(".stories.tsx"));

describe("component story coverage", () => {
  it("discovers application components", () => {
    expect(componentFiles.length).toBeGreaterThan(0);
  });

  it.each(componentFiles)("%s has colocated stories", (file) => {
    expect(existsSync(`${componentsDirectory}${file.replace(/\.tsx$/, ".stories.tsx")}`)).toBe(
      true
    );
  });
});
