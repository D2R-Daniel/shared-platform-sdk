#!/usr/bin/env bash
#
# SDK Generation Script
# Generates language-specific SDKs from OpenAPI specs and Avro schemas
#
# Usage: ./scripts/generate-sdk.sh <language> [output-dir]
#   language: python | java | node | all
#   output-dir: Output directory (default: ./generated/<language>)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
OPENAPI_DIR="$ROOT_DIR/openapi"
EVENTS_DIR="$ROOT_DIR/events"
MODELS_DIR="$ROOT_DIR/models"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default settings
DEFAULT_OUTPUT_DIR="$ROOT_DIR/generated"
PACKAGE_NAME="shared_platform"
PACKAGE_VERSION=$(cat "$ROOT_DIR/VERSION" 2>/dev/null || echo "0.1.0")

# Print colored output
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if required tools are installed
check_dependencies() {
    local missing=()

    if ! command -v openapi-generator &> /dev/null; then
        missing+=("openapi-generator")
    fi

    if ! command -v jq &> /dev/null; then
        missing+=("jq")
    fi

    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing required tools: ${missing[*]}"
        echo ""
        echo "Install them with:"
        echo "  brew install openapi-generator jq"
        echo "  # or"
        echo "  npm install -g @openapitools/openapi-generator-cli"
        exit 1
    fi
}

# Merge OpenAPI specs into a single file
merge_openapi_specs() {
    local output_file="$1"
    log_info "Merging OpenAPI specs..."

    # Create a combined spec file
    cat > "$output_file" << 'EOF'
openapi: 3.0.3
info:
  title: Platform API
  description: Combined Platform API specification
  version: VERSION_PLACEHOLDER
servers:
  - url: '{baseUrl}/api/v1'
    variables:
      baseUrl:
        default: https://api.example.com
security:
  - bearerAuth: []
paths: {}
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas: {}
EOF

    # Replace version placeholder
    sed -i.bak "s/VERSION_PLACEHOLDER/$PACKAGE_VERSION/" "$output_file" && rm -f "$output_file.bak"

    log_success "OpenAPI specs merged to $output_file"
}

# Generate Python SDK
generate_python() {
    local output_dir="${1:-$DEFAULT_OUTPUT_DIR/python}"
    log_info "Generating Python SDK to $output_dir..."

    mkdir -p "$output_dir"

    # Generate from each OpenAPI spec
    for spec_dir in "$OPENAPI_DIR"/*/; do
        if [ -d "$spec_dir" ]; then
            local module_name=$(basename "$spec_dir")
            for spec_file in "$spec_dir"/*.yaml; do
                if [ -f "$spec_file" ]; then
                    log_info "Processing $spec_file..."
                    openapi-generator generate \
                        -i "$spec_file" \
                        -g python \
                        -o "$output_dir" \
                        --package-name "${PACKAGE_NAME}.${module_name}" \
                        --additional-properties=packageVersion="$PACKAGE_VERSION" \
                        --additional-properties=projectName="shared-platform-python" \
                        --skip-validate-spec \
                        2>/dev/null || log_warn "Skipped $spec_file (validation issues)"
                fi
            done
        fi
    done

    # Generate Avro classes for Python
    if command -v avro-tools &> /dev/null || command -v python3 -c "import avro" &> /dev/null 2>&1; then
        log_info "Generating Avro classes for Python..."
        for avsc_file in "$EVENTS_DIR"/**/*.avsc; do
            if [ -f "$avsc_file" ]; then
                # Python avro library reads schemas at runtime, so we just copy them
                local events_output="$output_dir/${PACKAGE_NAME}/events"
                mkdir -p "$events_output"
                cp "$avsc_file" "$events_output/"
            fi
        done
    else
        log_warn "avro-tools not found, skipping Avro generation"
    fi

    # Create __init__.py files
    find "$output_dir" -type d -exec touch {}/__init__.py \;

    log_success "Python SDK generated at $output_dir"
}

# Generate Java SDK
generate_java() {
    local output_dir="${1:-$DEFAULT_OUTPUT_DIR/java}"
    log_info "Generating Java SDK to $output_dir..."

    mkdir -p "$output_dir"

    local java_package="com.platform.sdk"

    # Generate from each OpenAPI spec
    for spec_dir in "$OPENAPI_DIR"/*/; do
        if [ -d "$spec_dir" ]; then
            local module_name=$(basename "$spec_dir")
            for spec_file in "$spec_dir"/*.yaml; do
                if [ -f "$spec_file" ]; then
                    log_info "Processing $spec_file..."
                    openapi-generator generate \
                        -i "$spec_file" \
                        -g java \
                        -o "$output_dir" \
                        --api-package "${java_package}.${module_name}.api" \
                        --model-package "${java_package}.${module_name}.model" \
                        --invoker-package "${java_package}" \
                        --group-id "com.platform" \
                        --artifact-id "shared-platform-java" \
                        --artifact-version "$PACKAGE_VERSION" \
                        --additional-properties=java8=true \
                        --additional-properties=dateLibrary=java8 \
                        --skip-validate-spec \
                        2>/dev/null || log_warn "Skipped $spec_file (validation issues)"
                fi
            done
        fi
    done

    # Generate Avro classes for Java
    if command -v avro-tools &> /dev/null; then
        log_info "Generating Avro classes for Java..."
        local avro_output="$output_dir/src/main/java"
        mkdir -p "$avro_output"
        for avsc_file in "$EVENTS_DIR"/**/*.avsc; do
            if [ -f "$avsc_file" ]; then
                avro-tools compile schema "$avsc_file" "$avro_output" 2>/dev/null || true
            fi
        done
    else
        log_warn "avro-tools not found, skipping Avro generation"
    fi

    log_success "Java SDK generated at $output_dir"
}

# Generate Node.js SDK
generate_node() {
    local output_dir="${1:-$DEFAULT_OUTPUT_DIR/node}"
    log_info "Generating Node.js SDK to $output_dir..."

    mkdir -p "$output_dir"

    # Generate from each OpenAPI spec
    for spec_dir in "$OPENAPI_DIR"/*/; do
        if [ -d "$spec_dir" ]; then
            local module_name=$(basename "$spec_dir")
            for spec_file in "$spec_dir"/*.yaml; do
                if [ -f "$spec_file" ]; then
                    log_info "Processing $spec_file..."
                    openapi-generator generate \
                        -i "$spec_file" \
                        -g typescript-axios \
                        -o "$output_dir/src/$module_name" \
                        --additional-properties=npmName="@platform/shared-sdk" \
                        --additional-properties=npmVersion="$PACKAGE_VERSION" \
                        --additional-properties=supportsES6=true \
                        --additional-properties=withInterfaces=true \
                        --skip-validate-spec \
                        2>/dev/null || log_warn "Skipped $spec_file (validation issues)"
                fi
            done
        fi
    done

    # Create package.json
    cat > "$output_dir/package.json" << EOF
{
  "name": "@platform/shared-sdk",
  "version": "$PACKAGE_VERSION",
  "description": "Platform SDK - Auto-generated from OpenAPI specs",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  },
  "files": [
    "dist/**/*"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/shared-platform-specs.git"
  }
}
EOF

    # Create tsconfig.json
    cat > "$output_dir/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": false,
    "inlineSourceMap": true,
    "inlineSources": true,
    "experimentalDecorators": true,
    "strictPropertyInitialization": false,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

    # Copy Avro schemas
    local events_output="$output_dir/src/events"
    mkdir -p "$events_output"
    for avsc_file in "$EVENTS_DIR"/**/*.avsc; do
        if [ -f "$avsc_file" ]; then
            cp "$avsc_file" "$events_output/"
        fi
    done

    log_success "Node.js SDK generated at $output_dir"
}

# Generate all SDKs
generate_all() {
    local output_dir="${1:-$DEFAULT_OUTPUT_DIR}"
    log_info "Generating all SDKs..."

    generate_python "$output_dir/python"
    generate_java "$output_dir/java"
    generate_node "$output_dir/node"

    log_success "All SDKs generated in $output_dir"
}

# Clean generated files
clean() {
    local output_dir="${1:-$DEFAULT_OUTPUT_DIR}"
    log_info "Cleaning generated files in $output_dir..."
    rm -rf "$output_dir"
    log_success "Cleaned $output_dir"
}

# Show usage
usage() {
    cat << EOF
SDK Generation Script

Usage: $(basename "$0") <command> [options]

Commands:
  python [output-dir]   Generate Python SDK
  java [output-dir]     Generate Java SDK
  node [output-dir]     Generate Node.js/TypeScript SDK
  all [output-dir]      Generate all SDKs
  clean [output-dir]    Clean generated files

Options:
  output-dir    Output directory (default: ./generated/<language>)

Examples:
  $(basename "$0") python
  $(basename "$0") all ./dist
  $(basename "$0") clean

Requirements:
  - openapi-generator (brew install openapi-generator)
  - jq (brew install jq)
  - avro-tools (optional, for Avro schema compilation)

EOF
}

# Main
main() {
    if [ $# -lt 1 ]; then
        usage
        exit 1
    fi

    local command="$1"
    shift

    case "$command" in
        python)
            check_dependencies
            generate_python "$@"
            ;;
        java)
            check_dependencies
            generate_java "$@"
            ;;
        node|nodejs|typescript)
            check_dependencies
            generate_node "$@"
            ;;
        all)
            check_dependencies
            generate_all "$@"
            ;;
        clean)
            clean "$@"
            ;;
        -h|--help|help)
            usage
            ;;
        *)
            log_error "Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

main "$@"
