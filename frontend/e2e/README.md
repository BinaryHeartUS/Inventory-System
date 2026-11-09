# Inventory E2E authentication

`npm run test:e2e` builds an isolated Compose stack with a disposable database
and a test-only OAuth issuer. The issuer generates an ephemeral RSA key, exposes
JWKS, validates authorization codes and PKCE S256 verifiers, and issues signed
tokens with representative chapter roles. It is a synthetic fixture, not the
BinaryHeart auth service or a test of real account credentials. Normal API
tests obtain a fixture token and verify it through Inventory's real session
endpoint; the authentication tests also exercise browser redirects, PKCE,
session expiry and logout.

The browser reaches the issuer on `127.0.0.1:4174`; Inventory uses the internal
Compose JWKS address. Set `E2E_PORT` and `E2E_AUTH_PORT` to change the host
ports, and `E2E_COMPOSE_PROJECT` to isolate the Compose project. Do not deploy
the fixture outside the E2E stack.
