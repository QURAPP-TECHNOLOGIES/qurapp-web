import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Loader2 } from "lucide-react";

// Direct import for immediate initial render
import CompanyHome from "./pages/CompanyHome";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Lazy-loaded routes for code splitting
const Products = lazy(() => import("./pages/Products"));
const QurAppProduct = lazy(() => import("./pages/QurAppProduct"));
const HisnulMuslim = lazy(() => import("./pages/HisnulMuslim"));
const QurAIProduct = lazy(() => import("./pages/QurAIProduct"));
const About = lazy(() => import("./pages/About"));
const Research = lazy(() => import("./pages/Research"));
const Community = lazy(() => import("./pages/Community"));
const Donate = lazy(() => import("./pages/Donate"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ForScholars = lazy(() => import("./pages/ForScholars"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Page loading fallback spinner
const PageLoader = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
    <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
    <p className="text-xs font-medium">Loading page...</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
