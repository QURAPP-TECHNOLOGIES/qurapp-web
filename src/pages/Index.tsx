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

const Index = () => {
  useSEO({
    title: "QurApp - #1 Islamic Social Media App | Connect Through the Holy Quran",
    description: "Join millions of Muslims worldwide in live audio rooms. Recite, listen, and discuss the Holy Quran together in a beautiful spiritual community.",
    url: "/",
  });
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero - First impression and value proposition */}
        <HeroSection />
        
        {/* Features - Show what the app does (main value proposition) */}
        <FeaturesSection />
        
        {/* How It Works - Process and steps */}
        <HowItWorksSection />
        
        {/* Feature Highlights - Specific features in detail */}
        <AIMentorSection />
        <NotificationsSection />
        
        {/* Target Audience - Who it's for */}
        <AudienceSection />
        <LanguagesSection />
        
        {/* Social Proof - Build trust with numbers and testimonials */}
        <StatsSection />
        <TestimonialsSection />
        
        {/* FAQ - Address common questions */}
        <FAQSection />
        
        {/* Final CTA - Download/Join */}
        <DownloadSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;