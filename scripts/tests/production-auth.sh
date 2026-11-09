#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
mkdir "$WORK/bin"
cat > "$WORK/bin/docker" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
if [ "$1" = inspect ]; then
  case "$3" in
    *project*) echo "${TEST_PROJECT:-binaryheart-infra-prod}" ;;
    *service*) echo postgres ;;
    *) exit 1 ;;
  esac
elif [ "$1" = exec ]; then
  if [ "${TEST_DATABASE_ERROR:-false}" = true ]; then echo "database unavailable" >&2; exit 1; fi
  echo "${TEST_RECEIPT:-1}"
elif [ "$1" = compose ]; then
  case "$*" in
    *"config --environment"*)
      printf 'AUTH_MODE=%s\nAUTH_ISSUER=%s\n' "${AUTH_MODE:-central}" "${TEST_ISSUER:-https://auth.binaryheart.org}" ;;
    *"pull "*|*"up "*)
      echo "app-changed" >> "$TEST_DEPLOY_LOG" ;;
    *"exec -T frontend wget -qO- http://127.0.0.1/api/health/ready") echo OK ;;
    *"exec -T frontend wget -qO- http://127.0.0.1/api/auth/config")
      printf '{"enabled":%s}\n' "${TEST_ENABLED:-true}" ;;
    *) exit 1 ;;
  esac
elif [ "$1" = image ]; then
  exit 0
else
  exit 1
fi
SH
cat > "$WORK/bin/curl" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
for arg in "$@"; do url="$arg"; done
case "$url" in
  */api/health/ready) echo "${TEST_READY:-OK}" ;;
  */.well-known/oauth-authorization-server) printf '{"issuer":"%s"}\n' "${TEST_ISSUER:-https://auth.binaryheart.org}" ;;
  */.well-known/jwks.json) printf '{"keys":[{"kty":"%s"}]}\n' "${TEST_KEY:-RSA}" ;;
  *) exit 1 ;;
esac
SH
chmod +x "$WORK/bin/docker" "$WORK/bin/curl"
export PATH="$WORK/bin:$PATH"
expect_failure() {
  local expected="$1"
  shift
  if "$@" > "$WORK/result" 2>&1; then echo "Expected failure: $expected"; exit 1; fi
  grep -q "$expected" "$WORK/result" || { cat "$WORK/result"; exit 1; }
}
CHECK="$ROOT/scripts/check-production-auth.sh"
expect_failure "requires binaryheart-infra-prod" env TEST_PROJECT=binaryheart-infra-dev bash "$CHECK"
expect_failure "database unavailable" env TEST_DATABASE_ERROR=true bash "$CHECK"
expect_failure "Verified production identity import" env TEST_RECEIPT=0 bash "$CHECK"
expect_failure "not ready" env TEST_READY=DOWN bash "$CHECK"
expect_failure "wrong issuer" env TEST_ISSUER=https://auth.binaryheart.dev bash "$CHECK"
expect_failure "RSA verification key" env TEST_KEY=EC bash "$CHECK"
bash "$CHECK"

# Exercise deploy wiring too: guards must run before pulling/replacing services.
mkdir -p "$WORK/repo/deploy" "$WORK/repo/secrets" "$WORK/repo/scripts"
touch "$WORK/repo/deploy/prod.env" "$WORK/repo/secrets/prod.env"
cp "$CHECK" "$WORK/repo/scripts/check-production-auth.sh"
export REPO_DIR="$WORK/repo" TEST_DEPLOY_LOG="$WORK/deploy.log"
touch "$TEST_DEPLOY_LOG"
DEPLOY="$ROOT/scripts/deploy.sh"
expect_failure "Verified production identity import" env TEST_RECEIPT=0 bash "$DEPLOY" prod test-sha
[ ! -s "$TEST_DEPLOY_LOG" ]
expect_failure "requires https://auth.binaryheart.org" env TEST_ISSUER=https://auth.binaryheart.dev bash "$DEPLOY" prod test-sha
[ ! -s "$TEST_DEPLOY_LOG" ]
bash "$DEPLOY" prod test-sha
[ -s "$TEST_DEPLOY_LOG" ]
expect_failure "did not enable central" env TEST_ENABLED=false bash "$DEPLOY" prod test-sha
AUTH_MODE=legacy TEST_RECEIPT=0 bash "$DEPLOY" prod test-sha
echo "PASS: production preflight failures, deploy gating before service changes, central-mode confirmation and legacy rollback."
