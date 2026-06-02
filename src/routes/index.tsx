import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/common/PrivateRoute';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import PurchaseOrders from '@/pages/PurchaseOrders';
import PurchaseOrderDetails from '@/pages/PurchaseOrderDetails';
import Delegation from '@/pages/Delegation';
import Chat from '@/pages/Chat';
import Settings from '@/pages/Settings';
import { UserRole } from '@/models';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/purchase-orders"
          element={
            <PrivateRoute>
              <AppLayout>
                <PurchaseOrders />
              </AppLayout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/purchase-orders/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <PurchaseOrderDetails />
              </AppLayout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/delegation"
          element={
            <PrivateRoute allowedRoles={[UserRole.PROCUREMENT_SPECIALIST, UserRole.ADMIN]}>
              <AppLayout>
                <Delegation />
              </AppLayout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <AppLayout>
                <Chat />
              </AppLayout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
