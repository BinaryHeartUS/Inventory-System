# Common developer commands. Run `make` or `make help` to list targets.

.DEFAULT_GOAL := help

.PHONY: help format format-check format-java format-web format-check-java format-check-web \
	build build-java build-web build-importer lint lint-web audit-web test test-java test-e2e \
	test-web test-e2e-headed ci generate-types check-types

help: ## List available commands
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

format: format-java format-web ## Format all code (Java + frontend)

format-java: ## Format Java with Spotless
	cd backend && mvn -q spotless:apply

format-web: ## Format frontend with Prettier
	cd frontend && npm run format

build: build-java build-web ## Build backend and frontend

build-java: ## Build the backend (skip tests)
	cd backend && mvn -q -DskipTests package

build-web: ## Lint and build the frontend
	cd frontend && npm run lint && npm run build

build-importer: ## Build the standalone data importer (skip tests)
	cd importer && mvn -q -DskipTests package

generate-types:
	cd backend && mvn clean compile && cd ../frontend && npm run gen-types

check-types: generate-types ## Fail if the generated api.d.ts has drifted from the backend contract
	@git diff --exit-code -- frontend/src/types/api.d.ts \
		|| { echo "api.d.ts is out of date. Run 'make generate-types' and commit the result."; exit 1; }

format-check: format-check-java format-check-web ## Check formatting without modifying files (Java + frontend)

format-check-java: ## Check Java formatting (Spotless)
	cd backend && mvn -B -ntp spotless:check

format-check-web: ## Check frontend formatting (Prettier)
	cd frontend && npm run format:check

lint: lint-web ## Run all linters

lint-web: ## Lint the frontend (ESLint)
	cd frontend && npm run lint

audit-web: ## Scan frontend production dependencies for vulnerabilities (npm audit)
	cd frontend && npm audit --omit=dev --audit-level=high

test-java: ## Run backend unit tests
	cd backend && mvn -ntp test

test-web: ## Run frontend unit tests
	cd frontend && npm test

test: test-java test-web test-e2e ## Run backend, frontend unit, and browser tests

test-e2e: ## Run Playwright against a disposable full application stack
	cd frontend && npm run test:e2e

test-e2e-headed: ## Run Playwright with a visible browser against the disposable stack
	cd frontend && npm run test:e2e -- --headed

ci: format-check-java format-check-web lint-web test-java test-web build-java build-web audit-web check-types test-e2e ## Run every GitHub CI gate locally
