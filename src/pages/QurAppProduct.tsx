import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AIMentorSection from "@/components/AIMentorSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AudienceSection from "@/components/AudienceSection";
import LanguagesSection from "@/components/LanguagesSection";
import NotificationsSection from "@/components/NotificationsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import StatsSection from "@/components/StatsSection";
import FAQSection from "@/components/FAQSection";
import DownloadSection from "@/components/DownloadSection";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const QurAppProduct = () => {
  useSEO({
    title: "QurApp - #1 Islamic Social Media & Quran Learning Platform",
    description: "Join millions of Muslims worldwide in live audio rooms. Recite, listen, and discuss the Holy Quran together in a beautiful spiritual community.",
    url: "/products/qurapp",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero - First impression and value proposition */}
        <HeroSection />
        
        {/* Features - Show what the app does */}
        <FeaturesSection />
        
        {/* How It Works - Process and steps */}
        <HowItWorksSection />
        
        {/* Feature Highlights - Specific features in detail */}
        <AIMentorSection />
        <NotificationsSection />
        
        {/* Target Audience */}
        <AudienceSection />
        <LanguagesSection />
        
        {/* Social Proof */}
        <StatsSection />
        <TestimonialsSection />
        
        {/* FAQ */}
        <FAQSection />
        
        {/* Final CTA - Download/Join */}
        <DownloadSection />
      </main>
      <Footer />
    </div>
  );
};

export default QurAppProduct;
