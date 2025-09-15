import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import HomePage from "./pages/Home";
import StaysPage from "./pages/Stays";
import OwnersPage from "./pages/Owners";
import InvestPage from "./pages/Invest";
import AboutPage from "./pages/About";
import StoriesPage from "./pages/Stories";
import BlogPage from "./pages/Blog";
import ContactPage from "./pages/Contact";
import PropertyDetailPage from "./pages/PropertyDetail";
import AuthCallbackPage from "./pages/AuthCallback";
import PrivacyPage from "./pages/Privacy";
import TermsPage from "./pages/Terms";
import CookiesPage from "./pages/Cookies";
import DashboardPage from "./pages/Dashboard";
import AdminDashboardPage from "./pages/AdminDashboard";
import ProfilePage from "./pages/Profile";
import WishlistPage from "./pages/Wishlist";
import PropertyFormPage from "./pages/PropertyForm";
import PaymentSuccessPage from "./pages/PaymentSuccess";
import PaymentCancelPage from "./pages/PaymentCancel";
import CMSPage from "./pages/CMSPage";
import SetupWizardPage from "./pages/SetupWizard";
import ChatProvider from "./contexts/ChatContext";
import { CMSProvider } from "./contexts/CMSContext";
import { SetupProvider, useSetup } from "./contexts/SetupContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";
import ErrorBoundary from "./components/ErrorBoundary";
import { NotificationProvider } from "./components/NotificationSystem";

function AppContent() {
  const { setupStatus, loading, error } = useSetup();

  // Show loading state while checking setup
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HabibiStay...</p>
        </div>
      </div>
    );
  }

  // Show error state if setup check failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If setup is needed, redirect all routes to setup wizard
  if (setupStatus?.needs_setup) {
    return (
      <Router>
        <Routes>
          <Route path="/setup" element={<SetupWizardPage />} />
          <Route path="*" element={<Navigate to="/setup" replace />} />
        </Routes>
      </Router>
    );
  }

  // Normal app routing when setup is complete
  return (
    <AuthProvider>
      <ChatProvider>
        <CMSProvider>
          <NotificationProvider>
            <Router>
              <div className="min-h-screen bg-white">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/stays" element={<StaysPage />} />
                    <Route path="/owners" element={<OwnersPage />} />
                    <Route path="/invest" element={<InvestPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/stories" element={<StoriesPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/property/:id" element={<PropertyDetailPage />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/cookies" element={<CookiesPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/properties/new" element={<PropertyFormPage />} />
                    <Route path="/properties/:id/edit" element={<PropertyFormPage />} />
                    <Route path="/payment/success" element={<PaymentSuccessPage />} />
                    <Route path="/payment/cancel" element={<PaymentCancelPage />} />
                    <Route path="/page/:slug" element={<CMSPage />} />
                    {/* Redirect setup to home if already setup */}
                    <Route path="/setup" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
                <ChatBot />
              </div>
            </Router>
          </NotificationProvider>
        </CMSProvider>
      </ChatProvider>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SetupProvider>
        <AppContent />
      </SetupProvider>
    </ErrorBoundary>
  );
}