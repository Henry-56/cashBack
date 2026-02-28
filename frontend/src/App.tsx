import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { LoadingOverlay } from './components/LoadingOverlay';
import { setOnLoadingChange } from './api/client';

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
import TermsAndConditions from './pages/TermsAndConditions';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize socket connection outside to avoid multiple connections across re-renders
import socket from './api/socket';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Component to check if terms are accepted before allowing access
const RequireTerms = ({ children }: { children: React.ReactNode }) => {
  const termsAccepted = localStorage.getItem('termsAccepted') === 'true';
  if (!termsAccepted) return <Navigate to="/terms" replace />;
  return children;
};

function AppRoutes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    // Connect Axios to Loading Context
    setOnLoadingChange((show) => {
      if (show) showLoading();
      else hideLoading();
    });
  }, [showLoading, hideLoading]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    const showPremiumToast = (title: string, message: string, icon: React.ReactNode, path: string, colorClass: string = 'bg-[var(--accent)]') => {
      toast.custom((t: any) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-premium rounded-[2rem] pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
        >
          <div className="flex-1 w-0 p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className={`h-12 w-12 rounded-2xl ${colorClass} flex items-center justify-center text-[var(--primary)] font-black text-xl shadow-inner`}>
                  {icon}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
                  {title}
                </p>
                <p className="mt-1 text-xs text-gray-500 font-medium leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-100">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate(path);
              }}
              className="w-full border border-transparent rounded-none rounded-r-[2rem] px-6 flex items-center justify-center text-xs font-black uppercase tracking-widest text-[var(--primary)] hover:bg-gray-50 transition-colors"
            >
              Ver
            </button>
          </div>
        </div>
      ), { duration: 6000 });
    };

    socket.on('new_loan_request', (data: any) => {
      if (user && data.userId === user.id) return;
      showPremiumToast(
        "Nueva Oportunidad",
        data.message,
        "$",
        "/market",
        "bg-teal-50"
      );
    });

    socket.on('loan_funded', (data: any) => {
      if (user && data.borrowerId === user.id) {
        showPremiumToast(
          "¡Préstamo Financiado!",
          data.message,
          "✓",
          "/",
          "bg-indigo-50"
        );
      }
    });

    socket.on('payment_received', (data: any) => {
      if (user && data.targetUserId === user.id) {
        showPremiumToast(
          "Pago Recibido",
          data.message,
          "S/.",
          "/",
          "bg-emerald-50"
        );
      }
    });

    socket.on('loan_active', (data: any) => {
      if (user && data.targetUserId === user.id) {
        showPremiumToast(
          "Préstamo Activo",
          data.message,
          "⚡",
          "/",
          "bg-amber-50"
        );
      }
    });

    socket.on('payment_rejected', (data: any) => {
      if (user && data.targetUserId === user.id) {
        showPremiumToast(
          "Pago Rechazado",
          data.message,
          "!",
          "/",
          "bg-red-50"
        );
      }
    });

    socket.on('loan_lending_rejected', (data: any) => {
      if (user && data.targetUserId === user.id) {
        showPremiumToast(
          "Solicitud Cancelada",
          data.message,
          "✕",
          "/",
          "bg-gray-100"
        );
      }
    });

    socket.on('loan_completed', (data: any) => {
      if (user && (data.borrowerId === user.id || data.lenderId === user.id)) {
        showPremiumToast(
          "¡Préstamo Finalizado!",
          data.message,
          "🎉",
          "/",
          "bg-teal-100"
        );
      }
    });

    return () => {
      socket.off('new_loan_request');
      socket.off('loan_funded');
      socket.off('payment_received');
      socket.off('loan_active');
      socket.off('payment_rejected');
      socket.off('loan_lending_rejected');
      socket.off('loan_completed');
      socket.off('connect');
    };
  }, [user, navigate]);

  return (
    <Routes>
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<RequireTerms><Login /></RequireTerms>} />
      <Route path="/register" element={<RequireTerms><Register /></RequireTerms>} />
      <Route
        path="/dashboard"
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
      <LoadingProvider>
        <AuthProvider>
          <Router>
            <Toaster position="top-right" />
            <LoadingOverlay />
            <div className="bg-[var(--bg-light)] min-h-screen text-[var(--text-main)]">
              <AppRoutes />
            </div>
          </Router>
        </AuthProvider>
      </LoadingProvider>
    </QueryClientProvider>
  );
}

export default App;
