import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";

// Dashboard Layout & Pages
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import CustomersPage from "@/pages/dashboard/CustomersPage";
import ProductsPage from "@/pages/dashboard/ProductsPage";
import SubscriptionsPage from "@/pages/dashboard/SubscriptionsPage";
import InvoicesPage from "@/pages/dashboard/InvoicesPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
            <Route path="/customers" element={<DashboardLayout><CustomersPage /></DashboardLayout>} />
            <Route path="/products" element={<DashboardLayout><ProductsPage /></DashboardLayout>} />
            <Route path="/subscriptions" element={<DashboardLayout><SubscriptionsPage /></DashboardLayout>} />
            <Route path="/invoices" element={<DashboardLayout><InvoicesPage /></DashboardLayout>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
