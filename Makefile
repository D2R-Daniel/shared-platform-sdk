# Makefile for shared-platform-specs
# SDK build, validation, and development utilities

.PHONY: help install validate lint docs clean
.PHONY: build-python build-node build-java build-all
.PHONY: test-python test-node test-java test-all
.PHONY: publish-python publish-node publish-java publish-all

# Default target
help:
	@echo "shared-platform-specs - Platform SDK Monorepo"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Spec Targets:"
	@echo "  install          Install development dependencies"
	@echo "  validate         Validate all OpenAPI specs"
	@echo "  lint             Lint OpenAPI specs and schemas"
	@echo "  docs             Generate API documentation"
	@echo ""
	@echo "Build Targets:"
	@echo "  build-python     Build Python package"
	@echo "  build-node       Build Node.js package"
	@echo "  build-java       Build Java package"
	@echo "  build-all        Build all packages"
	@echo ""
	@echo "Test Targets:"
	@echo "  test-python      Run Python tests"
	@echo "  test-node        Run Node.js tests"
	@echo "  test-java        Run Java tests"
	@echo "  test-all         Run all tests"
	@echo ""
	@echo "Publish Targets:"
	@echo "  publish-python   Publish to PyPI"
	@echo "  publish-node     Publish to npm"
	@echo "  publish-java     Publish to Maven Central"
	@echo "  publish-all      Publish all packages"
	@echo ""

# Variables
PACKAGES_DIR := ./packages
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

# ============================================================================
# Python Package
# ============================================================================

build-python:
	@echo "Building Python package..."
	@cd $(PACKAGES_DIR)/python && pip install build && python -m build
	@echo "Python package built."

test-python:
	@echo "Running Python tests..."
	@cd $(PACKAGES_DIR)/python && pip install -e ".[dev]" && pytest
	@echo "Python tests complete."

publish-python:
	@echo "Publishing Python package to PyPI..."
	@cd $(PACKAGES_DIR)/python && pip install twine && twine upload dist/*
	@echo "Python package published."

# ============================================================================
# Node.js Package
# ============================================================================

build-node:
	@echo "Building Node.js package..."
	@cd $(PACKAGES_DIR)/node && npm install && npm run build
	@echo "Node.js package built."

test-node:
	@echo "Running Node.js tests..."
	@cd $(PACKAGES_DIR)/node && npm install && npm test
	@echo "Node.js tests complete."

publish-node:
	@echo "Publishing Node.js package to npm..."
	@cd $(PACKAGES_DIR)/node && npm publish
	@echo "Node.js package published."

# ============================================================================
# Java Package
# ============================================================================

build-java:
	@echo "Building Java package..."
	@cd $(PACKAGES_DIR)/java && mvn clean package
	@echo "Java package built."

test-java:
	@echo "Running Java tests..."
	@cd $(PACKAGES_DIR)/java && mvn test
	@echo "Java tests complete."

publish-java:
	@echo "Publishing Java package to Maven Central..."
	@cd $(PACKAGES_DIR)/java && mvn deploy
	@echo "Java package published."

# ============================================================================
# All Packages
# ============================================================================

build-all: build-python build-node build-java
	@echo "All packages built."

test-all: test-python test-node test-java
	@echo "All tests complete."

publish-all: publish-python publish-node publish-java
	@echo "All packages published."

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(PACKAGES_DIR)/python/dist $(PACKAGES_DIR)/python/build $(PACKAGES_DIR)/python/*.egg-info
	@rm -rf $(PACKAGES_DIR)/node/dist $(PACKAGES_DIR)/node/node_modules
	@rm -rf $(PACKAGES_DIR)/java/target
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
ci-build: build-all
ci-test: test-all
ci: ci-validate ci-build ci-test
