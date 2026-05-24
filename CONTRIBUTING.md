# Contributing to PAI-Portal

Thank you for your interest in contributing to PAI-Portal! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/PAI-Portal.git
   cd PAI-Portal
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/my-feature
   ```

## Code Standards

### TypeScript

- Use strict TypeScript — no `any` types unless absolutely necessary
- Define interfaces for all data structures
- Use type guards for runtime type checking

### Component Guidelines

- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components small and focused (single responsibility)
- Use TypeScript props interfaces

### State Management

- Use Redux Toolkit for global state
- Use Context API for theme and configuration
- Use local state for component-specific data
- Keep state normalized and minimal

### Testing

- Write tests for all new features
- Aim for >80% code coverage
- Test user interactions, not implementation details
- Use React Testing Library best practices

### Code Style

- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep files under 300 lines when possible

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add supplier filtering
fix: resolve token refresh issue
docs: update API documentation
test: add tests for auth slice
refactor: simplify purchase order service
style: format code with prettier
chore: update dependencies
```

## Pull Request Process

1. **Update tests** — ensure all tests pass
2. **Update documentation** — update README if needed
3. **Run quality checks**
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```
4. **Create PR** with a clear description
5. **Link issues** if applicable
6. **Request review**

## Project Structure Guidelines

### Adding a New Feature

Follow the feature folder pattern:

```
src/features/myFeature/
├── slice.ts              # Redux slice
├── hooks.ts              # Custom hooks
├── components/           # Feature components
│   └── MyComponent.tsx
└── __tests__/           # Tests
    └── slice.test.ts
```

### Adding a New API Service

1. Define DTOs in `src/api/types.ts`
2. Add mappers in `src/api/mappers.ts`
3. Create service in `src/api/services/myService.ts`
4. Add tests in `src/tests/api/myService.test.ts`

## Questions?

Feel free to open an issue for any questions or clarifications!
