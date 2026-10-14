import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const componentsDirectory = fileURLToPath(new URL("../components/", import.meta.url));
const componentFiles = readdirSync(componentsDirectory, { recursive: true })
  .filter((file): file is string => typeof file === "string")
  .filter((file) => file.endsWith(".tsx") && !file.endsWith(".stories.tsx"));

describe("component story coverage", () => {
  it.each(["pages", "containers"])("%s do not have stories", (directory) => {
    const files = readdirSync(new URL(`../${directory}/`, import.meta.url), { recursive: true });
    expect(
      files.filter((file) => typeof file === "string" && /\.stories\.[jt]sx?$/.test(file))
    ).toEqual([]);
  });

  it("discovers application components", () => {
    expect(componentFiles.length).toBeGreaterThan(0);
  });

  it.each(componentFiles)("%s has colocated stories", (file) => {
    expect(existsSync(`${componentsDirectory}${file.replace(/\.tsx$/, ".stories.tsx")}`)).toBe(
      true
    );
  });
});
