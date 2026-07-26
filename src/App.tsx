import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import CompanyHome from "./pages/CompanyHome";
import Products from "./pages/Products";
import QurAppProduct from "./pages/QurAppProduct";
import HisnulMuslim from "./pages/HisnulMuslim";
import QurAIProduct from "./pages/QurAIProduct";
import About from "./pages/About";
import Research from "./pages/Research";
import Community from "./pages/Community";
import Donate from "./pages/Donate";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ForScholars from "./pages/ForScholars";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Parent Organization Home */}
            <Route path="/" element={<CompanyHome />} />

            {/* Ecosystem Products Catalog & Pages */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/qurapp" element={<QurAppProduct />} />
            <Route path="/products/hisnul-muslim" element={<HisnulMuslim />} />
            <Route path="/products/qurai" element={<QurAIProduct />} />

            {/* Backward Compatibility Route for Hisnul Muslim */}
            <Route path="/hisnul-muslim" element={<Navigate to="/products/hisnul-muslim" replace />} />

            {/* Organization Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/research" element={<Research />} />
            <Route path="/community" element={<Community />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/for-scholars" element={<ForScholars />} />

            {/* Blog & News */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

            {/* Legal & Contact */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth & Admin Control Plane */}
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
