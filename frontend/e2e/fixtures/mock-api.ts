/// <reference types="node" />

import type { Page, Route } from "@playwright/test";

export type TestRole = "Admin" | "Chapter Admin" | "Editor" | "Viewer";
export const TEST_CHAPTER = { id: 101, name: "E2E Test Chapter" } as const;
export const NATIONAL_CHAPTER = { id: 1, name: "National" } as const;

export interface MockUser {
  username: string;
  role: TestRole;
  chapterRoles: Array<{ chapterId: number; role: TestRole }>;
}

export interface RecordedRequest {
  method: string;
  path: string;
  body: unknown;
}

interface Device {
  id: number;
  type: "Desktop" | "Laptop" | "Tablet";
  manufacturer: string;
  model: string;
  year: number;
  chapter: string;
  status: string;
  cpu?: string | null;
  ram?: number | null;
  ramGeneration?: string | null;
  storage?: number | null;
  storageType?: string | null;
  operatingSystem?: string | null;
  acquisitionDate?: string | null;
  value?: number | null;
  donorId?: number | null;
  recipientId?: number | null;
  hasWifi?: string | null;
  includesCharger?: string | null;
}

interface Part {
  id: number;
  chapterId: number;
  type: string;
  description: string;
  wasPurchased: boolean;
  containedIn: number | null;
  acquisitionDate: string | null;
  value: number | null;
  donorId: number | null;
}

interface Tool {
  id: number;
  chapterId: number;
  description: string;
  acquisitionDate: string | null;
  value: number | null;
  donorId: number | null;
}

interface Party {
  id: number;
  name: string;
  individualEmail?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  location?: string | null;
}

interface Account {
  id: number;
  username: string;
  name: string;
  role: string;
  chapterRoles: Array<{ chapterId: number; role: string }>;
}

export const USERS: Record<TestRole, MockUser> = {
  Admin: {
    username: "e2e-admin",
    role: "Admin",
    chapterRoles: [
      { chapterId: NATIONAL_CHAPTER.id, role: "Admin" },
      { chapterId: TEST_CHAPTER.id, role: "Admin" },
    ],
  },
  "Chapter Admin": {
    username: "e2e-chapter-admin",
    role: "Chapter Admin",
    chapterRoles: [{ chapterId: TEST_CHAPTER.id, role: "Chapter Admin" }],
  },
  Editor: {
    username: "e2e-editor",
    role: "Editor",
    chapterRoles: [{ chapterId: TEST_CHAPTER.id, role: "Editor" }],
  },
  Viewer: {
    username: "e2e-viewer",
    role: "Viewer",
    chapterRoles: [{ chapterId: TEST_CHAPTER.id, role: "Viewer" }],
  },
};

const LOOKUP_ROUTES = {
  manufacturers: "manufacturers",
  "ram-generations": "ramGenerations",
  "storage-types": "storageTypes",
  "part-types": "partTypes",
  "operating-systems": "operatingSystems",
} as const;

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

function noContent(route: Route, status = 204) {
  return route.fulfill({ status, body: "" });
}

function includesSearch(values: unknown[], search: string | null): boolean {
  if (!search) return true;
  const needle = search.toLowerCase();
  return values.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(needle)
  );
}

export class MockApi {
  readonly unhandledRequests: string[] = [];
  readonly requests: RecordedRequest[] = [];
  loginStatus = 200;
  loginRole: TestRole = "Admin";
  nextId = 2000;

  chapters: Array<{ id: number; name: string }> = [{ ...NATIONAL_CHAPTER }, { ...TEST_CHAPTER }];
  devices: Device[] = [
    {
      id: 1001,
      type: "Laptop",
      manufacturer: "Framework",
      model: "Laptop 13",
      year: 2024,
      chapter: TEST_CHAPTER.name,
      status: "In Progress",
      cpu: "Ryzen 7 7840U",
      ram: 16,
      ramGeneration: "DDR5",
      storage: 512,
      storageType: "NVMe",
      operatingSystem: "Ubuntu",
      acquisitionDate: "2026-01-15",
      value: 750,
      donorId: 301,
      recipientId: null,
      includesCharger: "Yes",
    },
    {
      id: 1002,
      type: "Desktop",
      manufacturer: "Dell",
      model: "OptiPlex 7090",
      year: 2022,
      chapter: TEST_CHAPTER.name,
      status: "Donated",
      cpu: "Core i5",
      ram: 8,
      storage: 256,
      storageType: "SSD",
      acquisitionDate: "2025-11-10",
      value: 300,
      donorId: 301,
      recipientId: 302,
      hasWifi: "Yes",
    },
  ];
  parts: Part[] = [
    {
      id: 1101,
      chapterId: TEST_CHAPTER.id,
      type: "RAM",
      description: "16GB DDR5 SODIMM",
      wasPurchased: false,
      containedIn: null,
      acquisitionDate: "2026-02-01",
      value: 45,
      donorId: 301,
    },
    {
      id: 1102,
      chapterId: TEST_CHAPTER.id,
      type: "SSD",
      description: "1TB NVMe drive",
      wasPurchased: true,
      containedIn: null,
      acquisitionDate: "2026-02-02",
      value: 70,
      donorId: null,
    },
  ];
  tools: Tool[] = [
    {
      id: 1201,
      chapterId: TEST_CHAPTER.id,
      description: "Precision screwdriver kit",
      acquisitionDate: "2026-03-01",
      value: 25,
      donorId: 301,
    },
  ];
  parties: Party[] = [
    {
      id: 301,
      name: "Test Donor",
      individualEmail: "donor@example.test",
      location: "(1 Test Way,Testville,GA,30000,USA)",
    },
    {
      id: 302,
      name: "Test Recipient Org",
      contactName: "Case Worker",
      contactEmail: "recipient@example.test",
      location: "(2 Test Way,Testville,GA,30000,USA)",
    },
  ];
  accounts: Account[] = [
    {
      id: 42,
      username: USERS.Admin.username,
      name: "E2E Administrator",
      role: "Admin",
      chapterRoles: USERS.Admin.chapterRoles,
    },
    {
      id: 43,
      username: USERS.Editor.username,
      name: "E2E Editor",
      role: "Editor",
      chapterRoles: USERS.Editor.chapterRoles,
    },
  ];
  lookups = {
    manufacturers: ["Dell", "Framework", "Lenovo"],
    ramGenerations: ["DDR4", "DDR5"],
    storageTypes: ["SSD", "NVMe"],
    partTypes: ["RAM", "SSD", "Charger"],
    operatingSystems: ["Ubuntu", "Windows 11"],
    deviceStatuses: ["Not Started", "In Progress", "Ready To Donate", "Donated", "Scrapped"],
    chargerStatuses: ["Unknown", "Yes", "No"],
    workingBatteryOpts: ["Unknown", "Yes", "No"],
  };

  async install(page: Page): Promise<void> {
    await page.route("**/api/**", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const path = url.pathname.replace(/^\/api/, "");
      const method = request.method();
      const body = request.postData() ? request.postDataJSON() : null;
      this.requests.push({ method, path, body });

      if (method === "POST" && path === "/auth/login") {
        return this.loginStatus === 200
          ? json(route, this.loginResponse(this.loginRole))
          : json(route, { message: "Invalid username or password" }, this.loginStatus);
      }

      if (method === "GET" && path === "/chapters") return json(route, this.chapters);
      if (method === "POST" && path === "/chapters") {
        const chapter = {
          id: this.nextId++,
          name: String((body as { name?: string })?.name ?? ""),
        };
        this.chapters.push(chapter);
        return json(route, chapter, 201);
      }
      const chapterMatch = path.match(/^\/chapters\/(\d+)$/);
      if (method === "DELETE" && chapterMatch) {
        this.chapters = this.chapters.filter((chapter) => chapter.id !== Number(chapterMatch[1]));
        return noContent(route);
      }

      if (method === "GET" && path === "/lookup") return json(route, this.lookups);
      const lookupMatch = path.match(/^\/lookup\/([^/]+)(?:\/(.+))?$/);
      if (lookupMatch && lookupMatch[1] in LOOKUP_ROUTES) {
        const key = LOOKUP_ROUTES[lookupMatch[1] as keyof typeof LOOKUP_ROUTES];
        if (method === "POST") {
          const value = String((body as { name?: string })?.name ?? "");
          if (!this.lookups[key].includes(value)) this.lookups[key].push(value);
          return noContent(route, 201);
        }
        if (method === "DELETE" && lookupMatch[2]) {
          const value = decodeURIComponent(lookupMatch[2]);
          this.lookups[key] = this.lookups[key].filter((item) => item !== value);
          return noContent(route);
        }
      }

      const assetExistsMatch = path.match(/^\/assets\/(\d+)\/exists$/);
      if (method === "GET" && assetExistsMatch) {
        const id = Number(assetExistsMatch[1]);
        return json(
          route,
          this.devices.some((item) => item.id === id) ||
            this.parts.some((item) => item.id === id) ||
            this.tools.some((item) => item.id === id)
        );
      }
      if (method === "GET" && /^\/assets\/\d+\/notes$/.test(path)) return json(route, []);

      if (method === "GET" && path === "/devices") return json(route, this.filterDevices(url));
      const deviceCreateMatch = path.match(/^\/devices\/(desktop|laptop|tablet)$/);
      if (method === "POST" && deviceCreateMatch) {
        const input = body as Record<string, unknown>;
        const id = Number(input.assetId) || this.nextId++;
        const device: Device = {
          id,
          type: `${deviceCreateMatch[1][0].toUpperCase()}${deviceCreateMatch[1].slice(1)}` as Device["type"],
          manufacturer: String(input.manufacturer ?? ""),
          model: String(input.model ?? ""),
          year: Number(input.year) || new Date().getFullYear(),
          chapter:
            this.chapters.find((chapter) => chapter.id === Number(input.chapterId))?.name ??
            TEST_CHAPTER.name,
          status: String(input.status ?? "Not Started"),
          cpu: input.cpu as string | undefined,
          ram: input.ram as number | undefined,
          ramGeneration: input.ramGeneration as string | undefined,
          storage: input.storageAmount as number | undefined,
          storageType: input.storageType as string | undefined,
          operatingSystem: input.operatingSystem as string | undefined,
          acquisitionDate: input.acquisitionDate as string | undefined,
          value: input.value as number | undefined,
          hasWifi: input.hasWifi as string | undefined,
          includesCharger: input.includesCharger as string | undefined,
        };
        this.devices.push(device);
        return json(route, { id }, 201);
      }
      const deviceMatch = path.match(/^\/devices\/(\d+)$/);
      if (deviceMatch && method === "GET") {
        const device = this.devices.find((item) => item.id === Number(deviceMatch[1]));
        return device ? json(route, device) : noContent(route, 404);
      }
      const deviceUpdateMatch = path.match(/^\/devices\/(desktop|laptop|tablet)\/(\d+)$/);
      if (method === "PUT" && deviceUpdateMatch) {
        const index = this.devices.findIndex((item) => item.id === Number(deviceUpdateMatch[2]));
        if (index >= 0) {
          const input = body as Record<string, unknown>;
          this.devices[index] = {
            ...this.devices[index],
            ...input,
            chapter:
              this.chapters.find((chapter) => chapter.id === Number(input.chapterId))?.name ??
              this.devices[index].chapter,
            storage: (input.storageAmount as number | undefined) ?? this.devices[index].storage,
          } as Device;
        }
        return noContent(route);
      }
      if (method === "GET" && /^\/devices\/\d+\/changelog$/.test(path)) return json(route, []);
      if (method === "GET" && path === "/devices/stats/counts")
        return json(route, this.dashboardCounts());
      if (method === "GET" && path === "/devices/stats/chapter-inventory")
        return json(route, [this.chapterInventorySummary()]);
      if (method === "GET" && path === "/devices/stats/avg-time")
        return json(route, { avgDays: 12, sampleSize: 1 });
      if (method === "GET" && path === "/devices/stats/completion-rate")
        return json(route, {
          donated: this.devices.filter((item) => item.status === "Donated").length,
          total: this.devices.length,
        });
      if (method === "GET" && path === "/devices/stats/chapter-activity")
        return json(route, {
          activeChapters: 1,
          totalChapters: 1,
          chaptersWorkingOnDevices: 1,
          chaptersWithPickupsReady: 0,
        });
      if (
        method === "GET" &&
        [
          "/devices/stats/devices-received",
          "/devices/stats/devices-donated",
          "/devices/stats/donated-value",
        ].includes(path)
      )
        return json(route, []);

      if (method === "GET" && path === "/parts/type-counts")
        return json(route, this.partTypeCounts(url));
      if (method === "GET" && path === "/parts") return json(route, this.filterParts(url));
      const partsByDeviceMatch = path.match(/^\/parts\/device\/(\d+)$/);
      if (method === "GET" && partsByDeviceMatch)
        return json(
          route,
          this.parts.filter((part) => part.containedIn === Number(partsByDeviceMatch[1]))
        );
      if (method === "POST" && path === "/parts") {
        const input = body as Record<string, unknown>;
        const id = Number(input.id) || this.nextId++;
        this.parts.push({
          id,
          chapterId: Number(input.chapterId) || TEST_CHAPTER.id,
          type: String(input.type ?? ""),
          description: String(input.description ?? ""),
          wasPurchased: Boolean(input.wasPurchased),
          containedIn: (input.containedIn as number | null | undefined) ?? null,
          acquisitionDate: (input.acquisitionDate as string | undefined) ?? null,
          value: (input.value as number | undefined) ?? null,
          donorId: (input.donorId as number | undefined) ?? null,
        });
        return json(route, { id }, 201);
      }
      const partMatch = path.match(/^\/parts\/(\d+)$/);
      if (partMatch) {
        const id = Number(partMatch[1]);
        const index = this.parts.findIndex((part) => part.id === id);
        if (method === "GET")
          return index >= 0 ? json(route, this.parts[index]) : noContent(route, 404);
        if (method === "PUT") {
          if (index >= 0) this.parts[index] = { ...this.parts[index], ...(body as Partial<Part>) };
          return noContent(route);
        }
        if (method === "DELETE") {
          this.parts = this.parts.filter((part) => part.id !== id);
          return noContent(route);
        }
      }
      if (method === "GET" && /^\/parts\/\d+\/changelog$/.test(path)) return json(route, []);

      if (method === "GET" && path === "/tools") return json(route, this.filterTools(url));
      if (method === "POST" && path === "/tools") {
        const input = body as Record<string, unknown>;
        const id = Number(input.assetId) || this.nextId++;
        this.tools.push({
          id,
          chapterId: Number(input.chapterId) || TEST_CHAPTER.id,
          description: String(input.description ?? ""),
          acquisitionDate: (input.acquisitionDate as string | undefined) ?? null,
          value: (input.value as number | undefined) ?? null,
          donorId: (input.donorId as number | undefined) ?? null,
        });
        return json(route, { id }, 201);
      }
      const toolMatch = path.match(/^\/tools\/(\d+)$/);
      if (toolMatch) {
        const id = Number(toolMatch[1]);
        const index = this.tools.findIndex((tool) => tool.id === id);
        if (method === "GET")
          return index >= 0 ? json(route, this.tools[index]) : noContent(route, 404);
        if (method === "PUT") {
          if (index >= 0) this.tools[index] = { ...this.tools[index], ...(body as Partial<Tool>) };
          return noContent(route);
        }
        if (method === "DELETE") {
          this.tools = this.tools.filter((tool) => tool.id !== id);
          return noContent(route);
        }
      }
      if (method === "GET" && /^\/tools\/\d+\/changelog$/.test(path)) return json(route, []);

      if (method === "GET" && path === "/party") return json(route, this.filterParties(url));
      if (method === "POST" && path === "/party/person") {
        const input = body as Record<string, unknown>;
        this.parties.push({
          id: this.nextId++,
          name: String(input.name ?? ""),
          individualEmail: (input.email as string | undefined) ?? null,
          location: (input.location as string | undefined) ?? null,
        });
        return noContent(route, 201);
      }
      if (method === "POST" && path === "/party/organization") {
        const input = body as Record<string, unknown>;
        this.parties.push({
          id: this.nextId++,
          name: String(input.name ?? ""),
          contactName: (input.contactName as string | undefined) ?? null,
          contactEmail: (input.contactEmail as string | undefined) ?? null,
          location: (input.location as string | undefined) ?? null,
        });
        return noContent(route, 201);
      }
      const partyMatch = path.match(/^\/party\/(\d+)$/);
      if (method === "GET" && partyMatch) {
        const party = this.parties.find((item) => item.id === Number(partyMatch[1]));
        return party ? json(route, party) : noContent(route, 404);
      }

      if (method === "GET" && path === "/accounts") return json(route, this.accounts);
      if (method === "POST" && path === "/accounts") {
        const input = body as Record<string, unknown>;
        const account: Account = {
          id: this.nextId++,
          username: String(input.username ?? ""),
          name: String(input.name ?? ""),
          role: String(input.role ?? "Viewer"),
          chapterRoles: [
            {
              chapterId: Number(input.chapterId) || TEST_CHAPTER.id,
              role: String(input.role ?? "Viewer"),
            },
          ],
        };
        this.accounts.push(account);
        return json(route, account, 201);
      }
      const accountRoleMatch = path.match(/^\/accounts\/(\d+)\/roles$/);
      if (method === "POST" && accountRoleMatch) {
        const account = this.accounts.find((item) => item.id === Number(accountRoleMatch[1]));
        if (account) account.chapterRoles.push(body as { chapterId: number; role: string });
        return noContent(route);
      }
      if (method === "PUT" && /^\/accounts\/\d+$/.test(path)) return noContent(route);

      this.unhandledRequests.push(`${method} ${path}`);
      return json(route, { message: `Unhandled mock request: ${method} ${path}` }, 501);
    });
  }

  request(method: string, path: string): RecordedRequest | undefined {
    return this.requests.find((request) => request.method === method && request.path === path);
  }

  loginResponse(role: TestRole) {
    const user = USERS[role];
    const payload = Buffer.from(JSON.stringify({ sub: "42", username: user.username })).toString(
      "base64url"
    );
    return {
      token: `mock-header.${payload}.mock-signature`,
      username: user.username,
      role: user.role,
      chapterRoles: user.chapterRoles,
    };
  }

  private filterDevices(url: URL): Device[] {
    let result = [...this.devices];
    const search = url.searchParams.get("search");
    const type = url.searchParams.get("type");
    const status = url.searchParams.get("status");
    const includeDonated = url.searchParams.get("includeDonated") === "true";
    if (search)
      result = result.filter((item) =>
        includesSearch(
          [item.id, item.manufacturer, item.model, item.cpu, item.chapter, item.status],
          search
        )
      );
    if (type) result = result.filter((item) => item.type === type);
    if (status) result = result.filter((item) => item.status === status);
    if (!includeDonated && !status) result = result.filter((item) => item.status !== "Donated");
    return result;
  }

  private filterParts(url: URL): Part[] {
    let result = [...this.parts];
    const type = url.searchParams.get("type");
    const search = url.searchParams.get("search");
    if (type) result = result.filter((part) => part.type === type);
    if (search)
      result = result.filter((part) =>
        includesSearch([part.id, part.type, part.description, TEST_CHAPTER.name], search)
      );
    return result;
  }

  private filterTools(url: URL): Tool[] {
    const search = url.searchParams.get("search");
    return search
      ? this.tools.filter((tool) =>
          includesSearch([tool.id, tool.description, TEST_CHAPTER.name], search)
        )
      : this.tools;
  }

  private partTypeCounts(url: URL) {
    const type = url.searchParams.get("type");
    const filtered = type ? this.parts.filter((part) => part.type === type) : this.parts;
    return [...new Set(filtered.map((part) => part.type))].map((partType) => ({
      type: partType,
      count: filtered.filter((part) => part.type === partType).length,
    }));
  }

  private dashboardCounts() {
    const active = this.devices.filter(
      (item) => item.status !== "Donated" && item.status !== "Scrapped"
    );
    return {
      notStarted: this.devices.filter((item) => item.status === "Not Started").length,
      inProgress: this.devices.filter((item) => item.status === "In Progress").length,
      readyToDonate: this.devices.filter((item) => item.status === "Ready To Donate").length,
      donated: this.devices.filter((item) => item.status === "Donated").length,
      desktopActive: active.filter((item) => item.type === "Desktop").length,
      laptopActive: active.filter((item) => item.type === "Laptop").length,
      tabletActive: active.filter((item) => item.type === "Tablet").length,
      totalActive: active.length,
    };
  }

  private chapterInventorySummary() {
    const desktopCount = this.devices.filter((item) => item.type === "Desktop").length;
    const laptopCount = this.devices.filter((item) => item.type === "Laptop").length;
    const tabletCount = this.devices.filter((item) => item.type === "Tablet").length;
    return {
      chapterId: TEST_CHAPTER.id,
      notStarted: this.devices.filter((item) => item.status === "Not Started").length,
      inProgress: this.devices.filter((item) => item.status === "In Progress").length,
      readyToDonate: this.devices.filter((item) => item.status === "Ready To Donate").length,
      donated: this.devices.filter((item) => item.status === "Donated").length,
      scrapped: this.devices.filter((item) => item.status === "Scrapped").length,
      desktopCount,
      laptopCount,
      tabletCount,
      desktopsCount: desktopCount,
      laptopsCount: laptopCount,
      tabletsCount: tabletCount,
      totalDevices: this.devices.length,
      partsCount: this.parts.length,
      toolsCount: this.tools.length,
    };
  }

  private filterParties(url: URL): Party[] {
    const type = url.searchParams.get("type");
    if (type === "person") return this.parties.filter((party) => !("contactName" in party));
    if (type === "organization") return this.parties.filter((party) => "contactName" in party);
    return this.parties;
  }
}

export async function authenticate(page: Page, role: TestRole = "Admin"): Promise<void> {
  const user = USERS[role];
  const mockApi = new MockApi();
  const storedAuth = {
    ...mockApi.loginResponse(role),
    chapterIds: user.chapterRoles.map((chapterRole) => chapterRole.chapterId),
  };
  await page.goto("/login");
  await page.evaluate((auth) => {
    const browser = globalThis as typeof globalThis & {
      sessionStorage: { setItem: (key: string, value: string) => void };
    };
    browser.sessionStorage.setItem("bh_auth", JSON.stringify(auth));
  }, storedAuth);
}
