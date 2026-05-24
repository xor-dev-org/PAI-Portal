# PAI-Portal

**Procurement Management Portal for SCM** — A production-ready Vite + React + TypeScript starter with Redux Toolkit, MUI, and comprehensive testing.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646cff.svg)](https://vitejs.dev/)
[![MUI](https://img.shields.io/badge/MUI-5.15-007fff.svg)](https://mui.com/)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 24.16.0 (LTS)
- **npm** or **yarn** or **pnpm**

### Installation

1. **Clone or download the repository**

   ```bash
   cd PAI-Portal
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your API base URL and configuration.

4. **Run development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
PAI-Portal/
├── public/                 # Static assets
├── src/
│   ├── api/                # API layer
│   │   ├── axios.ts        # Configured Axios instance with interceptors
│   │   ├── types.ts        # Backend DTO types
│   │   ├── mappers.ts      # DTO ↔ Domain model mappers
│   │   └── services/       # Typed API service functions
│   │       ├── authService.ts
│   │       ├── purchaseOrderService.ts
│   │       └── supplierService.ts
│   ├── app/                # Redux store
│   │   ├── store.ts        # Store configuration
│   │   └── slices/         # Redux slices
│   │       └── authSlice.ts
│   ├── components/         # Reusable components
│   │   ├── common/         # ErrorBoundary, PrivateRoute
│   │   └── layout/         # AppLayout, Header, Sidebar
│   ├── features/           # Feature folders (domain-driven)
│   │   └── purchaseOrders/
│   │       ├── slice.ts             # Redux slice
│   │       ├── hooks.ts             # Custom hooks
│   │       └── components/          # Feature components
│   │           ├── PurchaseOrderDialog.tsx
│   │           └── PurchaseOrderFilters.tsx
│   ├── hooks/              # Shared custom hooks
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── useFetch.ts
│   │   └── usePagination.ts
│   ├── models/             # Domain models and enums
│   │   └── index.ts
│   ├── pages/              # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── PurchaseOrders.tsx
│   │   └── Suppliers.tsx
│   ├── routes/             # Router configuration
│   │   └── index.tsx
│   ├── services/           # Non-API services
│   │   └── logger.ts       # Structured logging
│   ├── theme/              # MUI theme and provider
│   │   ├── theme.ts
│   │   └── ThemeProvider.tsx
│   ├── tests/              # Test setup and utilities
│   │   ├── setup.ts
│   │   ├── test-utils.tsx
│   │   └── ...             # Test files
│   ├── utils/              # Helper functions
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example            # Environment variable template
├── .eslintrc.cjs           # ESLint configuration
├── .gitignore
├── .prettierrc             # Prettier configuration
├── index.html
├── package.json
├── tsconfig.json           # TypeScript configuration
├── tsconfig.node.json
├── vite.config.ts          # Vite configuration
├── vitest.config.ts        # Vitest configuration
└── README.md
```

---

## 🛠️ Tech Stack

| Category           | Technology                                           |
| ------------------ | ---------------------------------------------------- |
| **Language**       | TypeScript 5.5                                       |
| **Framework**      | React 18.3                                           |
| **Build Tool**     | Vite 5.3                                             |
| **UI Library**     | MUI 5.15 + MUI X (DataGrid, Charts, Date Pickers)   |
| **State**          | Redux Toolkit 2.2 + Context API (theme)             |
| **HTTP Client**    | Axios 1.7 (with interceptors)                        |
| **Routing**        | React Router 6.24                                    |
| **Testing**        | Vitest 1.6 + React Testing Library 15               |
| **Code Quality**   | ESLint 8.57 + Prettier 3.3 + Husky 9 + lint-staged  |
| **Utilities**      | date-fns 3.6, lodash-es 4.17, clsx 2.1              |

---

## 📜 Available Scripts

| Script            | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Start development server (localhost:3000)            |
| `npm run build`   | Build production bundle                              |
| `npm run preview` | Preview production build locally                     |
| `npm run lint`    | Run ESLint                                           |
| `npm run lint:fix`| Run ESLint and auto-fix issues                       |
| `npm run format`  | Format code with Prettier                            |
| `npm run typecheck` | Type-check TypeScript without emitting files       |
| `npm run test`    | Run tests once                                       |
| `npm run test:watch` | Run tests in watch mode                           |
| `npm run test:ui` | Run tests with Vitest UI                             |
| `npm run coverage`| Generate test coverage report                        |
| `npm run prepare` | Install Husky hooks (runs automatically after install) |

---

## 🌐 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# API Configuration
VITE_API_BASE_URL=https://api.example.com/v1
VITE_API_TIMEOUT=30000

# Authentication
VITE_AUTH_TOKEN_KEY=pai_access_token
VITE_AUTH_REFRESH_TOKEN_KEY=pai_refresh_token
VITE_AUTH_TOKEN_EXPIRY_KEY=pai_token_expiry

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_MOCK_API=false

# Telemetry (optional)
VITE_SENTRY_DSN=
VITE_APP_INSIGHTS_KEY=

# Environment
VITE_ENV=development
```

**Note:** All Vite environment variables must be prefixed with `VITE_` to be exposed to the client bundle.

---

## 🔐 Security & Authentication

### Token Storage

- Access and refresh tokens are stored in `localStorage` by default.
- **Production recommendation:** Use `httpOnly` cookies for tokens to prevent XSS attacks, or implement secure storage using libraries like `secure-ls`.

### Token Refresh Flow

The Axios interceptor automatically handles 401 responses:
1. Intercepts 401 errors
2. Attempts to refresh the access token using the refresh token
3. Retries the original request with the new token
4. Redirects to login if refresh fails

### CSRF & CORS

- Configure CSRF tokens in the Axios interceptor if your backend requires them.
- Ensure your backend API has proper CORS configuration for your frontend domain.
- Add secure headers (`X-Content-Type-Options`, `X-Frame-Options`, etc.) in production.

### Example: Secure Token Storage with httpOnly Cookies

Update `src/api/axios.ts`:

```typescript
// Remove localStorage token storage
// Configure Axios to include credentials
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests
});

// Remove Authorization header logic from interceptor
// Backend should set httpOnly cookies containing tokens
```

---

## 🎨 Theme Customization

The theme system uses MUI's theming and Context API for light/dark mode toggle.

### Customize Brand Colors

Edit `src/theme/theme.ts`:

```typescript
const brandColors = {
  primary: {
    main: '#1976d2',  // Change to your brand color
    light: '#42a5f5',
    dark: '#1565c0',
  },
  // ... other colors
};
```

### Toggle Theme

Use the `useThemeMode` hook:

```typescript
import { useThemeMode } from '@/theme/ThemeProvider';

function MyComponent() {
  const { mode, toggleTheme } = useThemeMode();
  return <button onClick={toggleTheme}>Toggle Theme</button>;
}
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# With UI
npm run test:ui

# Coverage report
npm run coverage
```

### Writing Tests

Example test using the custom render utility:

```typescript
import { render, screen } from '@/tests/test-utils';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Test Coverage

Coverage reports are generated in the `coverage/` directory. Open `coverage/index.html` in a browser to view detailed reports.

---

## 📊 State Management

### Redux Toolkit

- **Store:** `src/app/store.ts`
- **Slices:** Organized by domain (`authSlice`, `purchaseOrders/slice`)
- **Async Actions:** Use `createAsyncThunk` for API calls
- **Middleware:** Custom logging and error reporting middleware included

### Context API

- Used for theme management (`ThemeProvider`)
- Lightweight alternative for non-global state

### Example: Adding a New Redux Slice

1. Create slice file: `src/app/slices/mySlice.ts`
2. Register in store: `src/app/store.ts`
3. Create custom hook: `src/hooks/useMyFeature.ts`

```typescript
// mySlice.ts
import { createSlice } from '@reduxjs/toolkit';

const mySlice = createSlice({
  name: 'myFeature',
  initialState: {},
  reducers: {},
});

export default mySlice.reducer;

// store.ts
import myReducer from './slices/mySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    purchaseOrders: purchaseOrdersReducer,
    myFeature: myReducer, // Add here
  },
});
```

---

## 🔌 API Layer

### Axios Configuration

The centralized Axios instance (`src/api/axios.ts`) includes:
- **Base URL** from environment variables
- **Request interceptor:** Attaches access token and request ID
- **Response interceptor:** Handles token refresh, error mapping, retry logic
- **Global error handling**

### Creating a New Service

1. Define DTOs in `src/api/types.ts`
2. Create mappers in `src/api/mappers.ts`
3. Create service file in `src/api/services/myService.ts`

```typescript
// src/api/services/myService.ts
import apiClient from '@/api/axios';
import { MyModel } from '@/models';
import { ApiResponse, MyModelDTO } from '@/api/types';

export const myService = {
  async getAll(): Promise<MyModel[]> {
    const response = await apiClient.get<ApiResponse<MyModelDTO[]>>('/my-resource');
    return response.data.data.map(mapMyModelFromDTO);
  },
};
```

---

## 📝 Logging & Telemetry

### Logger Service

Structured logging with severity levels (DEBUG, INFO, WARN, ERROR):

```typescript
import { logger } from '@/services/logger';

logger.info('User logged in', { userId: '123' });
logger.error('API call failed', { error, endpoint: '/api/orders' });
```

### Integrating Sentry

Add Sentry transport:

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENV,
});

logger.addTransport((entry) => {
  if (entry.level === LogLevel.ERROR) {
    Sentry.captureException(new Error(entry.message), {
      extra: entry.context,
    });
  }
});
```

### Integrating Application Insights

```typescript
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: { connectionString: import.meta.env.VITE_APP_INSIGHTS_KEY },
});
appInsights.loadAppInsights();

logger.addTransport((entry) => {
  appInsights.trackTrace({
    message: entry.message,
    severityLevel: mapLogLevel(entry.level),
    properties: entry.context,
  });
});
```

---

## 🚦 CI/CD & Pre-commit Hooks

### Husky + lint-staged

Pre-commit hooks automatically:
- Run ESLint on staged files
- Format code with Prettier
- Type-check TypeScript

Pre-push hooks:
- Run full TypeScript type check

### GitHub Actions Example

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '24.16.0'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
```

---

## 🏗️ Extending the Starter

### Adding a New Feature

Follow the `purchaseOrders` feature pattern:

1. **Create feature folder:** `src/features/myFeature/`
2. **Add Redux slice:** `slice.ts`
3. **Add custom hook:** `hooks.ts`
4. **Add components:** `components/`
5. **Add API service:** `src/api/services/myFeatureService.ts`
6. **Add models:** Update `src/models/index.ts`
7. **Add tests:** `src/tests/features/myFeature/`
8. **Register in store:** `src/app/store.ts`
9. **Add route:** `src/routes/index.tsx`

### Adding a New Page

1. Create page component: `src/pages/MyPage.tsx`
2. Add route in `src/routes/index.tsx`
3. Add navigation item in `src/components/layout/Sidebar.tsx`

---

## 📦 Build & Deployment

### Build Output

```bash
npm run build
```

Output directory: `dist/`

### Environment-specific Builds

Use different `.env` files:
- `.env.development`
- `.env.staging`
- `.env.production`

Vite automatically loads the correct file based on mode.

### Deployment Targets

- **Static Hosting:** Netlify, Vercel, GitHub Pages, AWS S3 + CloudFront
- **Server Deployment:** Node.js with `serve` or similar
- **Docker:**

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** "Module not found" errors
- **Solution:** Ensure path aliases in `tsconfig.json` and `vite.config.ts` match

**Issue:** Tests failing with "Cannot find module '@/...'"
- **Solution:** Check `vitest.config.ts` has the same path aliases as `vite.config.ts`

**Issue:** Husky hooks not running
- **Solution:** Run `npm run prepare` to install hooks

**Issue:** ESLint/Prettier conflicts
- **Solution:** ESLint already extends `eslint-config-prettier` to disable conflicting rules

---

## 📄 License

This project is provided as-is for educational and starter purposes. Customize as needed for your organization.

---

## 🤝 Contributing

This is a starter template. Fork and customize for your needs!

### Development Workflow

1. Create a feature branch
2. Make changes
3. Run tests: `npm run test`
4. Run linter: `npm run lint`
5. Run type check: `npm run typecheck`
6. Commit (pre-commit hooks will run)
7. Push (pre-push hooks will run)
8. Create pull request

---

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [MUI Documentation](https://mui.com/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Vitest Documentation](https://vitest.dev/)
- [React Router Documentation](https://reactrouter.com/)

---

## 🙏 Acknowledgments

Built with modern best practices for enterprise React applications, focusing on:
- **Type safety** with TypeScript
- **Developer experience** with Vite and hot module replacement
- **Code quality** with ESLint, Prettier, and pre-commit hooks
- **Testing** with Vitest and React Testing Library
- **State management** with Redux Toolkit
- **Security** with token refresh patterns and secure-by-default API layer

---

**Happy coding! 🚀**
