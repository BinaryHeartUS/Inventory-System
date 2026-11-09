#!/usr/bin/env bash
set -euo pipefail

# Read-only gate before restarting Inventory production with central auth.
fail() { echo "ERROR: $*" >&2; exit 1; }
TARGET="${AUTH_DB_CONTAINER:-binaryheart-infra-prod-postgres-1}"
project="$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "$TARGET")"
service="$(docker inspect -f '{{index .Config.Labels "com.docker.compose.service"}}' "$TARGET")"
[ "$project" = binaryheart-infra-prod ] && [ "$service" = postgres ] \
  || fail "Production auth preflight requires binaryheart-infra-prod/postgres."
receipt="$(docker exec "$TARGET" psql -X -qAt -U binaryheart -d auth -v ON_ERROR_STOP=1 -c "
  SELECT count(*) FROM public.identity_import i
  WHERE i.environment = 'prod' AND i.account_count > 0
    AND EXISTS (SELECT FROM public.account)
    AND EXISTS (
      SELECT FROM public.role_assignment a
      JOIN public.role r ON r.id = a.role_id
      JOIN public.chapter c ON c.id = a.chapter_id
      WHERE r.key = 'national_admin' AND r.application_id IS NULL AND c.name = 'National')
    AND EXISTS (
      SELECT FROM public.application_redirect_uri u
      JOIN public.application a ON a.id = u.application_id
      WHERE a.key = 'inventory' AND u.uri = 'https://inventory.binaryheart.org/auth/callback');")"
[ "$receipt" = 1 ] || fail "Verified production identity import, National Admin and Inventory callback are required before cutover."

issuer=https://auth.binaryheart.org
[ "$(curl --connect-timeout 5 --max-time 15 --fail --silent --show-error "$issuer/api/health/ready")" = OK ] \
  || fail "Production auth is not ready."
metadata="$(curl --connect-timeout 5 --max-time 15 --fail --silent --show-error "$issuer/.well-known/oauth-authorization-server")"
printf '%s' "$metadata" | grep -Eq '"issuer"[[:space:]]*:[[:space:]]*"https://auth\.binaryheart\.org"' \
  || fail "Production auth metadata has the wrong issuer."
keys="$(curl --connect-timeout 5 --max-time 15 --fail --silent --show-error "$issuer/.well-known/jwks.json")"
printf '%s' "$keys" | grep -Eq '"kty"[[:space:]]*:[[:space:]]*"RSA"' \
  || fail "Production auth does not publish an RSA verification key."
echo "Production auth preflight passed (import receipt, admin, callback, readiness, issuer and JWKS)."
