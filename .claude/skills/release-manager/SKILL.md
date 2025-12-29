# Release Manager Skill

## Purpose
Manage SDK releases across all languages, including versioning, changelogs, and publishing.

## When to Use
- When preparing a new SDK release
- When updating version numbers
- When generating changelogs
- When publishing to package registries

## Release Checklist

### Pre-Release
- [ ] All tests passing (Python, Node.js, Java)
- [ ] Version numbers updated consistently
- [ ] CHANGELOG.md updated
- [ ] Breaking changes documented
- [ ] Migration guide if needed
- [ ] Documentation updated

### Version Updates
- [ ] `packages/python/pyproject.toml` - version field
- [ ] `packages/node/package.json` - version field
- [ ] `packages/java/pom.xml` - version element
- [ ] Root version file if applicable

### Changelog
- [ ] Follows Keep a Changelog format
- [ ] All changes categorized (Added, Changed, Fixed, Removed)
- [ ] Breaking changes highlighted
- [ ] Links to relevant issues/PRs

### Publishing
- [ ] Python: PyPI via `twine upload`
- [ ] Node.js: npm via `npm publish`
- [ ] Java: Maven Central via `mvn deploy`

## Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR - Breaking changes
MINOR - New features (backwards compatible)
PATCH - Bug fixes (backwards compatible)
```

### Breaking Changes Examples
- Removing a public method
- Changing method signature
- Changing exception types
- Renaming classes/modules

### Minor Changes Examples
- Adding new methods
- Adding new optional parameters
- Adding new modules
- Deprecating (not removing) features

### Patch Changes Examples
- Bug fixes
- Performance improvements
- Documentation updates
- Dependency updates (non-breaking)

## Changelog Template

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature description

### Changed
- Changed feature description

### Fixed
- Bug fix description

### Removed
- Removed feature description

## [1.2.0] - 2024-01-15

### Added
- Email module with template support
- Settings module for tenant configuration
- Webhooks module with signature verification
- API Keys module with rate limiting
```

## Release Commands

### Python
```bash
cd packages/python
# Update version in pyproject.toml
poetry build
poetry publish --dry-run  # Verify
poetry publish            # Publish to PyPI
```

### Node.js
```bash
cd packages/node
# Update version in package.json
npm run build
npm pack --dry-run        # Verify
npm publish               # Publish to npm
```

### Java
```bash
cd packages/java
# Update version in pom.xml
mvn clean package
mvn deploy -DskipTests    # Publish to Maven Central
```

## Git Tagging

```bash
# Create version tag
git tag -a v1.2.0 -m "Release version 1.2.0"

# Push tag
git push origin v1.2.0

# List tags
git tag -l "v*"
```

## Pre-Release Versions

```
1.2.0-alpha.1   # Alpha release
1.2.0-beta.1    # Beta release
1.2.0-rc.1      # Release candidate
```

## Dependency Updates

Before release, check for dependency updates:

```bash
# Python
poetry show --outdated

# Node.js
npm outdated

# Java
mvn versions:display-dependency-updates
```
