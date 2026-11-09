// Test-only OAuth issuer. It deliberately has no real accounts or credentials.
import { createHash, generateKeyPairSync, randomBytes, sign } from "node:crypto";
import { createServer } from "node:http";

const issuer = process.env.AUTH_ISSUER;
const origin = process.env.INVENTORY_ORIGIN;
if (!issuer || !origin) throw new Error("AUTH_ISSUER and INVENTORY_ORIGIN are required");
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "e2e-key", use: "sig", alg: "RS256" };
const codes = new Map();
const roles = {
  Admin: { id: 42, username: "e2e-admin", roles: ["national_admin"], app_roles: [] },
  "Chapter Admin": {
    id: 43,
    username: "e2e-chapter-admin",
    roles: ["chapter_admin"],
    app_roles: [],
  },
  Editor: { id: 44, username: "e2e-editor", roles: [], app_roles: ["editor"] },
  Viewer: { id: 45, username: "e2e-viewer", roles: [], app_roles: ["viewer"] },
};

function jwt(role) {
  const user = roles[role];
  const now = Math.floor(Date.now() / 1000);
  const chapters = [{ id: 101, roles: user.roles, app_roles: user.app_roles }];
  if (role === "Admin") chapters.unshift({ id: 1, roles: user.roles, app_roles: user.app_roles });
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const payload = `${encode({ alg: "RS256", typ: "at+jwt", kid: jwk.kid })}.${encode({
    iss: issuer,
    aud: "inventory",
    client_id: "inventory",
    sub: String(user.id),
    username: user.username,
    chapters,
    iat: now,
    exp: now + 3600,
  })}`;
  return `${payload}.${sign("RSA-SHA256", Buffer.from(payload), privateKey).toString("base64url")}`;
}

function send(res, status, body, type = "application/json") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}
function redirect(res, url) {
  res.writeHead(302, { Location: url, "Cache-Control": "no-store" });
  res.end();
}
function validRequest(params) {
  return (
    params.get("client_id") === "inventory" &&
    params.get("redirect_uri") === `${origin}/auth/callback` &&
    params.get("response_type") === "code" &&
    params.get("code_challenge_method") === "S256" &&
    /^[A-Za-z0-9_-]{43}$/.test(params.get("code_challenge") ?? "") &&
    /^[A-Za-z0-9_-]{43}$/.test(params.get("state") ?? "")
  );
}

createServer(async (req, res) => {
  const url = new URL(req.url, issuer);
  if (req.method === "OPTIONS") return send(res, 204, "");
  if (req.method === "GET" && url.pathname === "/.well-known/jwks.json")
    return send(res, 200, JSON.stringify({ keys: [jwk] }));
  if (req.method === "GET" && url.pathname === "/api/service/chapters") {
    if (req.headers.authorization !== "Bearer e2e-chapter-sync-only-synthetic-token")
      return send(res, 401, "{}");
    return send(
      res,
      200,
      JSON.stringify({
        chapters: [
          { id: 1, name: "National", active: true },
          { id: 101, name: "E2E Test Chapter", active: true },
        ],
      })
    );
  }
  if (req.method === "GET" && url.pathname === "/fixture/token") {
    const role = url.searchParams.get("role");
    if (!Object.hasOwn(roles, role)) return send(res, 400, "{}");
    return send(res, 200, JSON.stringify({ access_token: jwt(role) }));
  }
  if (req.method === "GET" && url.pathname === "/api/oauth/authorize") {
    if (!validRequest(url.searchParams))
      return send(res, 400, "Invalid authorization request", "text/plain");
    const query = url.searchParams.toString().replaceAll("&", "&amp;").replaceAll('"', "&quot;");
    return send(
      res,
      200,
      `<!doctype html><title>Test BinaryHeart sign-in</title>
      <h1>Test BinaryHeart sign-in</h1><form method="post" action="/api/oauth/authorize?${query}">
      <label>Test identity <select name="role"><option>Admin</option><option>Chapter Admin</option>
      <option>Editor</option><option>Viewer</option></select></label>
      <button type="submit">Continue</button></form>`,
      "text/html"
    );
  }
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 8192) return send(res, 413, "{}");
  }
  const data = new URLSearchParams(body);
  if (req.method === "POST" && url.pathname === "/api/oauth/authorize") {
    const role = data.get("role");
    if (!validRequest(url.searchParams) || !Object.hasOwn(roles, role)) return send(res, 400, "{}");
    const code = randomBytes(32).toString("base64url");
    codes.set(code, {
      role,
      challenge: url.searchParams.get("code_challenge"),
      expires: Date.now() + 60_000,
    });
    const callback = new URL(`${origin}/auth/callback`);
    callback.search = new URLSearchParams({
      code,
      state: url.searchParams.get("state"),
      iss: issuer,
    });
    return redirect(res, callback.href);
  }
  if (req.method === "POST" && url.pathname === "/api/oauth/token") {
    const code = data.get("code");
    const entry = codes.get(code);
    codes.delete(code);
    const verifier = data.get("code_verifier") ?? "";
    if (
      !entry ||
      entry.expires < Date.now() ||
      data.get("grant_type") !== "authorization_code" ||
      data.get("client_id") !== "inventory" ||
      data.get("redirect_uri") !== `${origin}/auth/callback` ||
      !/^[A-Za-z0-9_-]{43,128}$/.test(verifier) ||
      createHash("sha256").update(verifier).digest("base64url") !== entry.challenge
    )
      return send(res, 400, JSON.stringify({ error: "invalid_grant" }));
    return send(res, 200, JSON.stringify({ access_token: jwt(entry.role), token_type: "Bearer" }));
  }
  if (
    req.method === "GET" &&
    url.pathname === "/api/oauth/logout" &&
    url.searchParams.get("client_id") === "inventory" &&
    url.searchParams.get("post_logout_redirect_uri") === `${origin}/login`
  )
    return redirect(res, `${origin}/login`);
  return send(res, 404, "{}");
}).listen(8080, "0.0.0.0");
