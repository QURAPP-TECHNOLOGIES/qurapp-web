import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSEO } from "@/hooks/useSEO";
import {
  BookOpen,
  Smartphone,
  Share2,
  Bell,
  CheckCircle2,
  Zap,
  Volume2,
  ShieldCheck,
  Sparkles,
  Apple,
  Play,
  Globe,
  Monitor,
  Download
} from "lucide-react";

import duahScreen from "@/assets/app-screenshots/duah-screen.jpeg";
import duahCategory from "@/assets/app-screenshots/dua-cat.jpeg";
import hisnulMuslimScreen from "@/assets/app-screenshots/hisnul-muslim-screen.jpeg";
import tasbihScreen from "@/assets/app-screenshots/tasbih-screen.jpeg";

type DownloadLinks = {
  ios: string;
  android: string;
  mac: string;
  windows: string;
};

const defaultLinks: DownloadLinks = {
  ios: "https://apps.apple.com/app/hisnul-muslim/id123456789",
  android: "https://play.google.com/store/apps/details?id=com.hisnulmuslim.hisnul_muslim",
  mac: "https://github.com/QURAPP-TECHNOLOGIES/qurapp/releases/download/v1.0.0/HisnulMuslim-macOS.dmg",
  windows: "https://github.com/QURAPP-TECHNOLOGIES/qurapp/releases/download/v1.0.0/HisnulMuslim-Setup.exe"
};

const HisnulMuslim = () => {
  const { t, language } = useLanguage();
  const [downloadLinks, setDownloadLinks] = useState<DownloadLinks>(defaultLinks);

  useSEO({
    title: `${t.hisnulMuslimPage.title} - ${t.hisnulMuslimPage.subtitle} | Standalone Offline App`,
    description: t.hisnulMuslimPage.description,
    url: "/hisnul-muslim",
  });

  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const apiGatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiGatewayUrl}/api/v1/hisnul_muslim/config`);
        if (res.ok) {
          const data = await res.json();
          const d = data.downloads || {};
          setDownloadLinks({
            ios: data.iosUrl || d.ios || defaultLinks.ios,
            android: data.androidUrl || data.updateUrl || d.android || defaultLinks.android,
            mac: data.macUrl || d.mac || defaultLinks.mac,
            windows: data.windowsUrl || d.windows || defaultLinks.windows,
          });
        }
      } catch (err) {
        console.error("Failed to fetch dynamic Hisnul Muslim config:", err);
      }
    };
    fetchAppConfig();
  }, []);

  const getFeatureIcon = (index: number) => {
    switch (index) {
      case 0: return <BookOpen className="w-6 h-6" />;
      case 1: return <ShieldCheck className="w-6 h-6" />;
      case 2: return <Zap className="w-6 h-6" />;
      case 3: return <Bell className="w-6 h-6" />;
      case 4: return <Share2 className="w-6 h-6" />;
      case 5: return <Sparkles className="w-6 h-6" />;
      case 6: return <Globe className="w-6 h-6" />;
      case 7: return <Volume2 className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-24 pb-16 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">

          {/* Hero Section */}
          <section className="relative py-12 md:py-20 lg:py-24">
            {/* Background Glows */}
            <div className="absolute top-1/4 start-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full bg-primary/20 blur-3xl -z-10" />
            <div className="absolute top-1/2 end-1/4 translate-x-1/2 translate-y-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full bg-gold/15 blur-3xl -z-10" />

            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-7 text-center lg:text-start"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
                  <Smartphone className="w-4 h-4" />
                  <span>{t.hisnulMuslimPage.badge}</span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
                  {t.hisnulMuslimPage.title}
                  <span className="block text-gradient mt-2">{t.hisnulMuslimPage.subtitle}</span>
                </h1>

                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-8 leading-relaxed mx-auto lg:mx-0">
                  {t.hisnulMuslimPage.description}
                </p>

                {/* Direct Download Call-To-Actions (iOS, Android, Mac, Windows) */}
                <div className="flex flex-col space-y-3 mb-8">
                  <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground font-semibold">
                    Download Native Apps
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0">
                    <Button asChild size="lg" className="font-medium group justify-start">
                      <a href={downloadLinks.mac} target="_blank" rel="noreferrer">
                        <Apple className="w-5 h-5 me-2.5 text-primary-foreground group-hover:scale-110 transition-transform" />
                        <div className="text-start leading-tight">
                          <div className="text-[10px] opacity-80 uppercase">Download for</div>
                          <div className="text-sm font-bold">macOS (.dmg)</div>
                        </div>
                      </a>
                    </Button>

                    <Button asChild variant="outline" size="lg" className="font-medium group justify-start border-blue-500/30 hover:bg-blue-500/10">
                      <a href={downloadLinks.windows} target="_blank" rel="noreferrer">
                        <Monitor className="w-5 h-5 me-2.5 text-blue-500 group-hover:scale-110 transition-transform" />
                        <div className="text-start leading-tight">
                          <div className="text-[10px] text-muted-foreground uppercase">Download for</div>
                          <div className="text-sm font-bold text-foreground">Windows (.exe)</div>
                        </div>
                      </a>
                    </Button>

                    <Button asChild variant="outline" size="lg" className="font-medium group justify-start">
                      <a href={downloadLinks.ios} target="_blank" rel="noreferrer">
                        <Apple className="w-5 h-5 me-2.5 group-hover:scale-110 transition-transform" />
                        <div className="text-start leading-tight">
                          <div className="text-[10px] text-muted-foreground uppercase">App Store</div>
                          <div className="text-sm font-bold">iOS Devices</div>
                        </div>
                      </a>
                    </Button>

                    <Button asChild variant="outline" size="lg" className="font-medium group justify-start">
                      <a href={downloadLinks.android} target="_blank" rel="noreferrer">
                        <Play className="w-5 h-5 me-2.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                        <div className="text-start leading-tight">
                          <div className="text-[10px] text-muted-foreground uppercase">Google Play</div>
                          <div className="text-sm font-bold">Android Devices</div>
                        </div>
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Direct Verification Metrics */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>100% Free & No Ads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>100% Offline Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-primary" />
                    <span>Mobile & Desktop Native</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Real Device Frame Screenshot */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-5 flex justify-center relative"
              >
                {/* Visual Glow Background */}
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                  <div className="w-[300px] h-[400px] sm:w-[350px] sm:h-[450px] rounded-[50px] bg-gradient-to-br from-primary/20 via-gold/10 to-primary/5 opacity-80 blur-2xl" />
                </div>

                {/* Smartphone Mockup */}
                <div className="relative w-[280px] sm:w-[310px] rounded-[2.5rem] p-3 bg-gradient-to-b from-border/80 via-border/40 to-border/80 border border-border/80 shadow-2xl shadow-primary/10">
                  <div className="relative rounded-[2rem] overflow-hidden bg-background border border-border/40">
                    <img
                      src={hisnulMuslimScreen}
                      alt="Hisnul Muslim Main Interface"
                      className="w-full h-auto object-cover rounded-[2rem] shadow-inner"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Real Screenshots Showcase Gallery */}
          <section className="py-16 md:py-24 border-t border-border/50">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold">Native Interface</span>
              <h2 className="text-3xl md:text-4xl font-bold font-display mt-2 mb-4">
                Designed for Peace, Built for Daily Adhkar
              </h2>
              <p className="text-muted-foreground text-lg">
                Explore authentic supplications, high-quality audio recitations, and digital tasbih in a clean, ad-free mobile & desktop interface.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Showcase 1: Main App Categories */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="group flex flex-col bg-card border border-border/60 rounded-3xl p-4 hover:border-primary/40 hover:shadow-xl transition-all"
              >
                <div className="relative rounded-2xl overflow-hidden bg-muted mb-4 border border-border/40">
                  <img
                    src={duahCategory}
                    alt="Authentic Adhkar Categories"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="px-2 pb-2 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full inline-block">
                    Categorized Adhkar
                  </span>
                  <h3 className="text-lg font-bold font-display">130+ Authentic Categories</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Browse Morning & Evening Adhkar, Travel, Prayer, and Protection supplications directly from Hisnul Muslim.
                  </p>
                </div>
              </motion.div>

              {/* Showcase 2: Recitation & Audio */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="group flex flex-col bg-card border border-border/60 rounded-3xl p-4 hover:border-primary/40 hover:shadow-xl transition-all"
              >
                <div className="relative rounded-2xl overflow-hidden bg-muted mb-4 border border-border/40">
                  <img
                    src={duahScreen}
                    alt="Dua Recitation and Audio Player"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="px-2 pb-2 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full inline-block">
                    Audio & Text
                  </span>
                  <h3 className="text-lg font-bold font-display">Crisp Arabic & Audio Stream</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Read elegant Arabic typography with English transliterations, translations, reference Hadiths, and crystal-clear audio.
                  </p>
                </div>
              </motion.div>

              {/* Showcase 3: Digital Tasbih */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="group flex flex-col bg-card border border-border/60 rounded-3xl p-4 hover:border-primary/40 hover:shadow-xl transition-all"
              >
                <div className="relative rounded-2xl overflow-hidden bg-muted mb-4 border border-border/40">
                  <img
                    src={tasbihScreen}
                    alt="Digital Tasbih Counter"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="px-2 pb-2 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-full inline-block">
                    Digital Tasbih
                  </span>
                  <h3 className="text-lg font-bold font-display">Smart Tasbih Counter</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Track your daily zikr counters with haptic feedback, custom targets (33, 100, custom), and session history.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Features Grid */}
          <section id="features" className="py-16 md:py-20 border-t border-border/50 relative">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
                {t.hisnulMuslimPage.featuresTitle}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t.hisnulMuslimPage.featuresSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {t.hisnulMuslimPage.features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group flex flex-col items-start"
                >
                  <div className="p-3 rounded-xl bg-primary/10 text-primary mb-5 group-hover:scale-110 transition-transform">
                    {getFeatureIcon(idx)}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Promotional Download CTA Area */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 md:p-12 lg:p-16 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-card to-gold/10 border border-primary/25 shadow-xl text-center max-w-4xl mx-auto relative overflow-hidden"
            >
              {/* Decorative graphic */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />

              <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">
                Start Your Daily Azhkar Habit Today
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
                Download the fully private, offline-first Hisnul Muslim app now. Available for Mobile (iOS & Android) and Desktop (macOS & Windows), 100% free with zero ads.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                <Button asChild size="lg" className="font-medium group">
                  <a href={downloadLinks.mac} target="_blank" rel="noreferrer">
                    <Apple className="w-4 h-4 me-2 group-hover:scale-110 transition-transform" />
                    macOS (.dmg)
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="font-medium group border-blue-500/30 hover:bg-blue-500/10">
                  <a href={downloadLinks.windows} target="_blank" rel="noreferrer">
                    <Monitor className="w-4 h-4 me-2 text-blue-500 group-hover:scale-110 transition-transform" />
                    Windows (.exe)
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="font-medium group">
                  <a href={downloadLinks.ios} target="_blank" rel="noreferrer">
                    <Apple className="w-4 h-4 me-2 group-hover:scale-110 transition-transform" />
                    iOS App Store
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="font-medium group">
                  <a href={downloadLinks.android} target="_blank" rel="noreferrer">
                    <Play className="w-4 h-4 me-2 text-emerald-500 group-hover:scale-110 transition-transform" />
                    Google Play
                  </a>
                </Button>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HisnulMuslim;
