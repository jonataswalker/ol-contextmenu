# Contributing to ol-contextmenu

First off, thank you for considering contributing to ol-contextmenu! 🎉

We love contributions from the community. Whether it's a bug report, feature request, documentation improvement, or code contribution, every contribution is valuable.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When submitting a bug report, include:**

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment details:**
  - ol-contextmenu version
  - OpenLayers version
  - Browser and version
  - Operating system
- **Minimal reproduction example** (CodeSandbox, JSFiddle, or repository)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- **Clear use case** - Why is this needed?
- **Detailed description** - What should it do?
- **Examples** - How would it be used?
- **Alternatives considered** - What other solutions did you consider?

### Pull Requests

We actively welcome pull requests!

## Development Setup

### Prerequisites

- **Node.js**: 16.x or higher
- **npm**: 8.x or higher
- **Git**

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/ol-contextmenu.git
cd ol-contextmenu
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/jonataswalker/ol-contextmenu.git
```

### Install Dependencies

```bash
npm install
```

### Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:ui

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Build for production
npm run build
```

### Project Structure

```
ol-contextmenu/
├── src/
│   ├── main.ts           # Main entry point
│   ├── constants.ts      # Constants and defaults
│   ├── types.ts          # TypeScript type definitions
│   ├── helpers/          # Helper functions
│   └── sass/             # Styles
├── tests/                # Test files
│   ├── *.unit.spec.ts    # Unit tests
│   └── *.browser.spec.ts # Browser tests
├── examples/             # Example implementations
├── docs/                 # Documentation
└── dist/                 # Build output (generated)
```

## Pull Request Process

### 1. Create a Feature Branch

```bash
git checkout -b feature/my-new-feature
# or
git checkout -b fix/issue-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the [coding guidelines](#coding-guidelines)
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run linter
npm run lint

# Build to ensure no errors
npm run build
```

**All tests must pass before submitting a PR.**

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git commit -m "feat: add support for custom menu positioning

- Add new positioning API
- Update documentation
- Add tests for new feature

Fixes #123"
```

**Commit message format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code refactoring
- `style:` - Code style changes (formatting)
- `chore:` - Maintenance tasks

### 5. Push to Your Fork

```bash
git push origin feature/my-new-feature
```

### 6. Create Pull Request

1. Go to the [original repository](https://github.com/jonataswalker/ol-contextmenu)
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template:
   - Describe your changes
   - Reference related issues
   - Add screenshots if applicable
   - Check all boxes in the PR checklist

### 7. Code Review

- Maintainers will review your PR
- Address any requested changes
- Keep the PR up to date with the main branch

### 8. Merge

Once approved, a maintainer will merge your PR. Congratulations! 🎉

## Coding Guidelines

### TypeScript

- **Use TypeScript** for all new code
- **Export types** for public APIs
- **Avoid `any`** - use proper types
- **Document complex types** with comments

```typescript
// ✅ Good
interface MenuOptions {
    /** Width of the menu in pixels */
    width?: number;
    /** Default menu items */
    items?: Item[];
}

// ❌ Avoid
function doSomething(data: any) { ... }
```

### Code Style

We use ESLint for code style. Run `npm run lint:fix` to auto-fix issues.

**Key points:**
- **Indentation**: 4 spaces
- **Semicolons**: Required
- **Quotes**: Single quotes for strings
- **Line length**: 100 characters max
- **Naming**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and types
  - `UPPER_CASE` for constants

### Best Practices

- **Keep functions small** and focused
- **Avoid side effects** where possible
- **Use descriptive names** for variables and functions
- **Comment complex logic** but avoid obvious comments
- **Handle errors gracefully**
- **Validate inputs** for public APIs

## Testing

We use Vitest for testing with both unit and browser tests.

### Writing Tests

1. **Place tests** in the `tests/` directory
2. **Name test files**: `*.spec.ts` or `*.test.ts`
3. **Use descriptive test names**

```typescript
describe('ContextMenu', () => {
    it('should open menu on right-click', async () => {
        // Arrange
        const contextmenu = new ContextMenu();
        map.addControl(contextmenu);

        // Act
        dispatchContextMenu(viewport);
        await new Promise(resolve => setTimeout(resolve, 150));

        // Assert
        expect(contextmenu.isOpen()).toBe(true);
    });
});
```

### Test Coverage

- **Aim for high coverage** (>90%)
- **Test edge cases** and error conditions
- **Test TypeScript types** where applicable

### Running Specific Tests

```bash
# Run specific file
npx vitest run tests/instance.unit.spec.ts

# Run tests matching pattern
npx vitest run --grep "should open menu"
```

## Documentation

### Updating Docs

When adding features or changing behavior:

1. **Update README.md** if it affects basic usage
2. **Update API docs** in `docs/api-reference.md`
3. **Add examples** to `docs/examples.md`
4. **Update TypeScript docs** if types changed
5. **Add to CHANGELOG.md**

### Writing Documentation

- **Be clear and concise**
- **Include code examples**
- **Explain the "why" not just the "how"**
- **Use proper markdown formatting**
- **Keep it up to date**

## Getting Help

Need help with your contribution?

- 💬 **Ask questions** in your PR or issue
- 📖 **Read the docs** in the `/docs` directory
- 🔍 **Search existing issues** and PRs
- 👥 **Reach out to maintainers**

## Recognition

Contributors are recognized in:
- [Contributors Graph](https://github.com/jonataswalker/ol-contextmenu/graphs/contributors)
- Release notes (for significant contributions)

Thank you for contributing to ol-contextmenu! ❤️
