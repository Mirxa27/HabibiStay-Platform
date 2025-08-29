import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import HomePage from "@/react-app/pages/Home";
import StaysPage from "@/react-app/pages/Stays";
import OwnersPage from "@/react-app/pages/Owners";
import InvestPage from "@/react-app/pages/Invest";
import AboutPage from "@/react-app/pages/About";
import StoriesPage from "@/react-app/pages/Stories";
import BlogPage from "@/react-app/pages/Blog";
import ContactPage from "@/react-app/pages/Contact";
import PropertyDetailPage from "@/react-app/pages/PropertyDetail";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import PrivacyPage from "@/react-app/pages/Privacy";
import TermsPage from "@/react-app/pages/Terms";
import CookiesPage from "@/react-app/pages/Cookies";
import DashboardPage from "@/react-app/pages/Dashboard";
import AdminDashboardPage from "@/react-app/pages/AdminDashboard";
import ProfilePage from "@/react-app/pages/Profile";
import WishlistPage from "@/react-app/pages/Wishlist";
import PropertyFormPage from "@/react-app/pages/PropertyForm";
import PaymentSuccessPage from "@/react-app/pages/PaymentSuccess";
import PaymentCancelPage from "@/react-app/pages/PaymentCancel";
import ChatProvider from "@/react-app/contexts/ChatContext";
import Navbar from "@/react-app/components/Navbar";
import Footer from "@/react-app/components/Footer";
import ChatBot from "@/react-app/components/ChatBot";

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
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
              </Routes>
            </main>
            <Footer />
            <ChatBot />
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}
