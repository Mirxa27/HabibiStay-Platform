import { BrowserRouter as Router, Routes, Route } from "react-router";
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
import ChatProvider from "./contexts/ChatContext";
import { CMSProvider } from "./contexts/CMSContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";
import ErrorBoundary from "./components/ErrorBoundary";
import { NotificationProvider } from "./components/NotificationSystem";

export default function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}