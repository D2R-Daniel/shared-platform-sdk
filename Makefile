# Makefile for shared-platform-specs
# SDK generation, validation, and development utilities

.PHONY: help install validate generate-python generate-java generate-node generate-all clean lint docs

# Default target
help:
	@echo "shared-platform-specs - API Contract & SDK Generator"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  install          Install development dependencies"
	@echo "  validate         Validate all OpenAPI specs"
	@echo "  lint             Lint OpenAPI specs and schemas"
	@echo ""
	@echo "  generate-python  Generate Python SDK"
	@echo "  generate-java    Generate Java SDK"
	@echo "  generate-node    Generate Node.js/TypeScript SDK"
	@echo "  generate-all     Generate all SDKs"
	@echo ""
	@echo "  clean            Remove generated files"
	@echo "  docs             Generate API documentation"
	@echo ""

# Variables
SCRIPTS_DIR := ./scripts
GENERATED_DIR := ./generated
OPENAPI_DIR := ./openapi
EVENTS_DIR := ./events
MODELS_DIR := ./models

# Install dependencies
install:
	@echo "Installing dependencies..."
	@command -v openapi-generator >/dev/null 2>&1 || { \
		echo "Installing openapi-generator..."; \
		brew install openapi-generator 2>/dev/null || npm install -g @openapitools/openapi-generator-cli; \
	}
	@command -v jq >/dev/null 2>&1 || { \
		echo "Installing jq..."; \
		brew install jq; \
	}
	@echo "Dependencies installed."

# Validate OpenAPI specs
validate:
	@echo "Validating OpenAPI specs..."
	@for spec in $(OPENAPI_DIR)/**/*.yaml; do \
		echo "Validating $$spec..."; \
		openapi-generator validate -i "$$spec" 2>&1 | grep -v "^$$" || true; \
	done
	@echo "Validation complete."

# Lint specs and schemas
lint: validate
	@echo "Linting complete."

# Generate Python SDK
generate-python:
	@echo "Generating Python SDK..."
	@chmod +x $(SCRIPTS_DIR)/generate-sdk.sh
	@$(SCRIPTS_DIR)/generate-sdk.sh python $(GENERATED_DIR)/python

# Generate Java SDK
generate-java:
	@echo "Generating Java SDK..."
	@chmod +x $(SCRIPTS_DIR)/generate-sdk.sh
	@$(SCRIPTS_DIR)/generate-sdk.sh java $(GENERATED_DIR)/java

# Generate Node.js SDK
generate-node:
	@echo "Generating Node.js SDK..."
	@chmod +x $(SCRIPTS_DIR)/generate-sdk.sh
	@$(SCRIPTS_DIR)/generate-sdk.sh node $(GENERATED_DIR)/node

# Generate all SDKs
generate-all: generate-python generate-java generate-node
	@echo "All SDKs generated in $(GENERATED_DIR)"

# Clean generated files
clean:
	@echo "Cleaning generated files..."
	@rm -rf $(GENERATED_DIR)
	@echo "Clean complete."

# Generate API documentation (using Redoc or similar)
docs:
	@echo "Generating API documentation..."
	@mkdir -p ./docs/api
	@for spec_dir in $(OPENAPI_DIR)/*/; do \
		module=$$(basename "$$spec_dir"); \
		for spec in "$$spec_dir"*.yaml; do \
			if [ -f "$$spec" ]; then \
				echo "Generating docs for $$spec..."; \
				npx @redocly/cli build-docs "$$spec" -o "./docs/api/$$module-$$(basename $$spec .yaml).html" 2>/dev/null || \
				echo "  (install @redocly/cli for HTML docs)"; \
			fi \
		done \
	done
	@echo "Documentation generated in ./docs/api"

# Development server for docs
docs-serve:
	@echo "Starting documentation server..."
	@npx @redocly/cli preview-docs $(OPENAPI_DIR)/auth/auth-api.yaml

# Version bump helpers
version-patch:
	@current=$$(cat VERSION); \
	new=$$(echo $$current | awk -F. '{print $$1"."$$2"."$$3+1}'); \
	echo $$new > VERSION; \
	echo "Version bumped to $$new"

version-minor:
	@current=$$(cat VERSION); \
	new=$$(echo $$current | awk -F. '{print $$1"."$$2+1".0"}'); \
	echo $$new > VERSION; \
	echo "Version bumped to $$new"

version-major:
	@current=$$(cat VERSION); \
	new=$$(echo $$current | awk -F. '{print $$1+1".0.0"}'); \
	echo $$new > VERSION; \
	echo "Version bumped to $$new"

# Show current version
version:
	@cat VERSION

# CI targets
ci-validate: validate
ci-generate: generate-all
ci: ci-validate ci-generate
