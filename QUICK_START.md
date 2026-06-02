# Quick Start Guide

## Running the Application

### Step 1: Start the Backend API

```powershell
# Navigate to the mock server directory
cd r:\Work\MS\mock_scm_fastapi_server

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Step 2: Start the React Application

```powershell
# Navigate to the project directory
cd r:\Work\PAI-Portal

# Install dependencies (if not already installed)
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Test Credentials

### Supplier Login
```
Email: supplier1@mockscm.com
Password: Password123
```

### Procurement Specialist Login
```
Email: ps1@mockscm.com
(MSAL - no password required)
```

### Admin Login
```
Email: admin@mockscm.com
(MSAL - no password required)
```

## Testing the Features

### 1. Login & Signup
- Visit `http://localhost:5173`
- Try both Supplier Portal and Procurement Cockpit logins
- Test the "Create Supplier Account" signup flow
- Verify portal switching works

### 2. Navigation
- Collapse/expand the sidebar (desktop)
- Test mobile responsiveness (resize browser)
- Navigate through all menu items

### 3. Purchase Orders
- Go to "PO Listing"
- Test search functionality
- Change status filter
- Toggle between Grid and List views
- Click on a PO to view details
- Navigate through tabs in PO details

### 4. Theme
- Toggle between light and dark themes using the header button
- Verify all components look good in both themes

## Troubleshooting

### API Connection Issues
If you see API errors:
1. Verify the backend server is running at `http://localhost:8000`
2. Check the `.env` file has correct `VITE_API_BASE_URL`
3. Check browser console for CORS errors

### Port Conflicts
If port 5173 is in use:
```powershell
# Vite will automatically try the next available port
# Or specify a different port:
npm run dev -- --port 3000
```

### TypeScript Errors
```powershell
# Run type checking
npm run typecheck

# If errors persist, try:
rm -rf node_modules package-lock.json
npm install
```

### Build Issues
```powershell
# Clear cache and rebuild
npm run build

# If issues persist:
rm -rf dist node_modules .vite
npm install
npm run build
```

## Development Tips

### Hot Module Replacement
Vite provides instant HMR - changes will reflect immediately without full page reload.

### Redux DevTools
Install Redux DevTools browser extension to inspect state changes.

### React Developer Tools
Install React DevTools browser extension to inspect component tree.

### API Inspection
- Use browser Network tab to inspect API calls
- Backend provides automatic API docs at `http://localhost:8000/docs`

## Next Steps

1. Review the implementation in `IMPLEMENTATION_SUMMARY.md`
2. Check the full documentation in `PROJECT_IMPLEMENTATION.md`
3. Explore the API reference in `apireference.md`
4. Start implementing placeholder pages (Chat, Delegation, Settings)
5. Add more features to existing pages

## Need Help?

- Check console for errors
- Review error messages carefully
- Verify all services are running
- Check API documentation at `http://localhost:8000/docs`
