import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { ThemeProvider } from '@/theme/ThemeProvider';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import AppRoutes from '@/routes';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
