import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import LoginPage from './components/login';
import HomePage from './components/home';
import ProductsPage from './components/product';
import AIDrawingPage from './components/aiDrawing';
import CustomerPage from './components/customer';
import SalesPage from './components/sales';
import InvoiceManager from './components/qlyhoadon/InvoiceManager';
import { CartProvider } from './components/product/Cart/CartContext';

const App = () => {

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');
    return token ? children : <Navigate to="/login" replace />;
  };

  // Public Route Component (redirect to home if already logged in)
  const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');
    return token ? <Navigate to="/home" replace /> : children;
  };

  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-design"
            element={
              <ProtectedRoute>
                <AIDrawingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <SalesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <InvoiceManager />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;

