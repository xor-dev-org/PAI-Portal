# PAI-Portal - Procurement Management Portal

A modern, responsive React application for Supply Chain Management with dual-portal authentication (Supplier Portal and Procurement Cockpit).

## Features

### 🔐 Authentication
- **Dual Portal Login System**
  - Supplier Portal with email/password authentication
  - Procurement Cockpit with MSAL authentication for Procurement Specialists
  - Easy portal switching on login page
  - Supplier self-signup capability

### 📋 Purchase Order Management
- **PO Listing Page**
  - Grid and List view toggle
  - Advanced filtering (status, delivery date, search)
  - Pagination support
  - Responsive card layout (4 cards per row on desktop)
  - Click-through to PO details

- **PO Details Page**
  - Comprehensive PO information display
  - Tabbed interface:
    - PO Details (with line items table)
    - MRP Exceptions
    - Shipment & Tracking (placeholder)
    - Documents (placeholder)
    - Revision History (placeholder)
  - Back navigation to listing

### 🎨 UI/UX
- **Collapsible Sidebar Navigation**
  - Dashboard
  - PO Listing
  - Delegation (placeholder)
  - Chat (placeholder)
  - Settings (placeholder)
  - Expandable/collapsible on desktop
  - Mobile-responsive drawer

- **Modern Material-UI Components**
  - Consistent design system
  - Dark/Light theme toggle
  - Responsive layouts for all screen sizes
  - Beautiful gradients and shadows
  - Icon-rich interface

### 🔧 Technical Features
- TypeScript for type safety
- Redux Toolkit for state management
- Axios with interceptors for API calls
- Protected routes with authentication
- Reusable component architecture
- Responsive design (mobile, tablet, desktop)

## Tech Stack

- **Frontend Framework**: React 18.3+ with TypeScript
- **UI Library**: Material-UI (MUI) v5 + MUI X DataGrid
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

## Project Structure

```
src/
├── api/
│   ├── axios.ts                 # Axios instance with interceptors
│   ├── types.ts                 # API type definitions
│   └── services/
│       ├── authService.ts       # Authentication API calls
│       └── purchaseOrderService.ts  # PO API calls
├── app/
│   ├── store.ts                 # Redux store configuration
│   └── slices/
│       └── authSlice.ts         # Auth state management
├── components/
│   ├── common/
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── POCard.tsx          # PO card component
│   │   ├── POFilters.tsx       # Filter toolbar
│   │   └── PrivateRoute.tsx    # Route protection
│   └── layout/
│       ├── AppLayout.tsx        # Main layout wrapper
│       ├── Header.tsx           # App header with user menu
│       └── Sidebar.tsx          # Collapsible navigation
├── hooks/
│   ├── useAuth.ts              # Auth hook
│   ├── useDebounce.ts
│   ├── useFetch.ts
│   └── usePagination.ts
├── models/
│   └── index.ts                # TypeScript interfaces and types
├── pages/
│   ├── Chat.tsx                # Chat placeholder
│   ├── Dashboard.tsx           # Dashboard with stats
│   ├── Delegation.tsx          # Delegation placeholder
│   ├── Login.tsx               # Dual-portal login
│   ├── PurchaseOrderDetails.tsx # PO details with tabs
│   ├── PurchaseOrders.tsx      # PO listing with filters
│   ├── Settings.tsx            # Settings placeholder
│   └── Signup.tsx              # Supplier registration
├── routes/
│   └── index.tsx               # Route configuration
├── theme/
│   ├── theme.ts                # MUI theme configuration
│   └── ThemeProvider.tsx       # Theme context provider
├── utils/
│   └── helpers.ts              # Utility functions
├── App.tsx                     # Root component
└── main.tsx                    # Application entry point
```

## Getting Started

### Prerequisites
- Node.js >= 24.16.0
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd PAI-Portal
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Create .env file
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run coverage` - Generate test coverage report

## API Integration

The application connects to a backend API (mock or real) at the configured `VITE_API_BASE_URL`.

### Authentication Endpoints

#### MSAL Login (Procurement Specialist/Admin)
```
POST /auth/msal/login
Body: { "email": "ps1@mockscm.com" }
```

#### Supplier Login
```
POST /auth/supplier/login
Body: { "email": "supplier@example.com", "password": "Password123" }
```

#### Supplier Signup
```
POST /auth/supplier/signup
Body: {
  "supplier_number": "SUPNUM-010",
  "name": "Company Name",
  "email": "email@example.com",
  "password": "Password123",
  "address": "Address",
  "site": "Site Location"
}
```

### Purchase Order Endpoints

#### Get PO List
```
GET /po?page=1&page_size=12&status=APPROVED&supplier_id=SUP-001
```

#### Get PO by ID
```
GET /po/{po_id}
```

## User Roles

### Supplier
- Access to supplier portal
- View assigned purchase orders
- Track shipments
- Communicate via chat

### Procurement Specialist
- Access to procurement cockpit
- Manage assigned purchase orders
- View and update PO status
- Delegate tasks

### Admin
- Full system access
- Supplier management
- PO reassignment
- System administration

## Component Reusability

Key reusable components:
- `POCard` - Purchase order card display
- `POFilters` - Filter toolbar for PO listing
- `LoadingSpinner` - Loading indicator
- `PrivateRoute` - Protected route wrapper

## Responsive Design

The application is fully responsive:
- **Mobile (< 600px)**: Single column layout, hamburger menu
- **Tablet (600px - 960px)**: 2-column grid, collapsible sidebar
- **Desktop (> 960px)**: 4-column grid, full sidebar

## Future Enhancements

- [ ] Real-time chat functionality
- [ ] Document management system
- [ ] Advanced filtering and search
- [ ] Shipment tracking integration
- [ ] Notification system
- [ ] Analytics dashboard
- [ ] Export capabilities
- [ ] Bulk operations

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run coverage
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License.

## Support

For support, email support@example.com or create an issue in the repository.
