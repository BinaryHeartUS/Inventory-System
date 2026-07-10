# Common developer commands. Run `make` or `make help` to list targets.

.DEFAULT_GOAL := help

.PHONY: help format format-check format-java format-web format-check-java format-check-web

help: ## List available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

format: format-java format-web ## Format all code (Java + frontend)

format-check: format-check-java format-check-web ## Check formatting without writing changes

format-java: ## Format Java with Spotless
	cd backend && mvn -q spotless:apply

format-web: ## Format frontend with Prettier
	cd frontend && npm run format

format-check-java: ## Check Java formatting with Spotless
	cd backend && mvn -q spotless:check

format-check-web: ## Check frontend formatting with Prettier
	cd frontend && npm run format:check
