# Common developer commands. Run `make` or `make help` to list targets.

.DEFAULT_GOAL := help

.PHONY: help format format-check format-java format-web format-check-java format-check-web \
	build build-java build-web lint lint-web test test-java ci

help: ## List available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
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