import { test as base, expect } from "@playwright/test";
import { MockApi } from "./mock-api";

interface Fixtures {
  mockApi: MockApi;
}

export const test = base.extend<Fixtures>({
  mockApi: [
    async ({ page }, use) => {
      const mockApi = new MockApi();
      await mockApi.install(page);
      await use(mockApi);
      expect(mockApi.unhandledRequests, "Every API request must have an explicit mock").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
