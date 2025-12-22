import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useEffect } from 'react';

import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import LoanRequest from './pages/LoanRequest';
import PaymentFlow from './pages/PaymentFlow';
import LoanList from './pages/LoanList';
import Documents from './pages/Documents';
import LendFlow from './pages/LendFlow';
import LoanMarket from './pages/LoanMarket';

const queryClient = new QueryClient();

// Initialize socket connection outside to avoid multiple connections across re-renders
const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001');

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('new_loan_request', (data: any) => {
      // Filter out own requests
      if (user && data.userId === user.id) return;

      toast.custom((t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--primary)] font-bold">
                  $
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Nueva Solicitud de Préstamo
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {data.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-light)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              Ver
            </button>
          </div>
        </div>
      ), { duration: 5000 });
    });

    return () => {
      socket.off('new_loan_request');
      socket.off('connect');
    };
  }, [user]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan/new"
        element={
          <ProtectedRoute>
            <LoanRequest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/new"
        element={
          <ProtectedRoute>
            <PaymentFlow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pay/:loanId"
        element={
          <ProtectedRoute>
            <PaymentFlow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loans"
        element={
          <ProtectedRoute>
            <LoanList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/market"
        element={
          <ProtectedRoute>
            <LoanMarket />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lend/:id"
        element={
          <ProtectedRoute>
            <LendFlow />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <div className="bg-[var(--bg-light)] min-h-screen text-[var(--text-main)]">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
