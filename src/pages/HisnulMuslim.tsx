import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBreadcrumb from "@/components/PageBreadcrumb";
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
  Download, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Apple,
  Play,
  Globe
} from "lucide-react";

const HisnulMuslim = () => {
  const { t, language } = useLanguage();
  const isRtl = ["ar", "fa", "ur"].includes(language);

  useSEO({
    title: `${t.hisnulMuslimPage.title} - ${t.hisnulMuslimPage.subtitle} | Standalone Offline App`,
    description: t.hisnulMuslimPage.description,
    url: "/hisnul-muslim",
  });

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
          <PageBreadcrumb items={[{ label: t.hisnulMuslimPage.title }]} />

          {/* Hero Section */}
          <section className="relative py-12 md:py-20 lg:py-24">
            {/* Background Gradients */}
            <div className="absolute top-1/4 start-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full bg-primary/20 blur-3xl -z-10" />
            <div className="absolute top-1/2 end-1/4 translate-x-1/2 translate-y-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full bg-gold/15 blur-3xl -z-10" />

            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Copy */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-7 text-center lg:text-start"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
                  <Smartphone className="w-4 h-4" />
                  <span>{t.hisnulMuslimPage.badge}</span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
                  {t.hisnulMuslimPage.title}
                  <span className="block text-gradient mt-2">{t.hisnulMuslimPage.subtitle}</span>
                </h1>

                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-10 leading-relaxed mx-auto lg:mx-0">
                  {t.hisnulMuslimPage.description}
                </p>

                {/* Direct Download Call-To-Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
                  <Button size="lg" className="w-full sm:w-auto font-medium group">
                    <Apple className="w-5 h-5 me-2 group-hover:scale-110 transition-transform" />
                    {t.hisnulMuslimPage.appStore}
                  </Button>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto font-medium group">
                    <Play className="w-5 h-5 me-2 group-hover:scale-110 transition-transform" />
                    {t.hisnulMuslimPage.googlePlay}
                  </Button>
                </div>

                {/* Direct Verification Metrics */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>100% Free & No Ads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Works Offline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Android & iOS</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Interactive App Interface Preview */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-5 flex justify-center relative"
              >
                {/* Visual Glassmorphism Container */}
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                  <div className="w-[300px] h-[400px] sm:w-[350px] sm:h-[450px] rounded-[50px] bg-gradient-to-br from-primary/10 to-gold/10 opacity-70 blur-xl" />
                </div>

                {/* Custom CSS Smartphone Frame */}
                <div className="relative w-[280px] h-[560px] sm:w-[310px] sm:h-[620px] rounded-[3rem] border-[10px] border-foreground/15 shadow-2xl bg-card overflow-hidden flex flex-col font-sans select-none">
                  {/* Dynamic Island / Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                    <div className="w-8 h-1 bg-neutral-900 rounded-full" />
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                  </div>

                  {/* App Navigation Status Bar */}
                  <div className="h-10 pt-4 px-6 flex justify-between items-center text-[10px] font-semibold text-muted-foreground bg-card/60 backdrop-blur-md border-b border-border/30 z-20">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-muted-foreground rounded-sm" />
                      <span className="w-3.5 h-2 bg-muted-foreground rounded-sm" />
                    </div>
                  </div>

                  {/* App Screen Content */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/30 scrollbar-none text-start">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/20">
                      <div>
                        <h3 className="text-xs text-muted-foreground font-semibold">WELCOME TO</h3>
                        <h2 className="text-base font-bold font-display text-gradient">{t.hisnulMuslimPage.title}</h2>
                      </div>
                      <div className="flex gap-1">
                        <span className="p-1 rounded bg-muted text-foreground text-[8px] font-bold">EN</span>
                        <span className="p-1 rounded bg-primary/20 text-primary text-[8px] font-bold">🌙</span>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-card border border-border/50 text-center">
                        <div className="text-[10px] text-muted-foreground">Streak</div>
                        <div className="text-sm font-bold text-primary">15 Days 🔥</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-card border border-border/50 text-center">
                        <div className="text-[10px] text-muted-foreground">Reminders</div>
                        <div className="text-sm font-bold text-green-500">Active 🔔</div>
                      </div>
                    </div>

                    {/* Module 1: Fortress of the Muslim (Duas) */}
                    <div className="p-3 rounded-2xl bg-card border border-border/60 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-lg" />
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold">{isRtl ? 'حصن المسلم' : 'Fortress of the Muslim'}</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground mb-3">Daily Supplications & Remembrance categories</p>
                      
                      {/* Mini Category Chips */}
                      <div className="space-y-1.5 text-[9px]">
                        <div className="flex items-center justify-between p-1.5 rounded-lg bg-muted/50 border border-border/30">
                          <span className="font-medium">1. Morning Supplications</span>
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded-lg bg-muted/50 border border-border/30">
                          <span className="font-medium">2. Evening Supplications</span>
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    {/* Module 2: Digital Tasbih */}
                    <div className="p-3 rounded-2xl bg-card border border-border/60 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gold/5 rounded-full blur-lg" />
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-gold" />
                        <span className="text-xs font-bold">{isRtl ? 'مسبحة الكترونية' : 'Digital Tasbih'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between bg-muted/30 p-2 rounded-xl border border-border/20 mt-1">
                        <div>
                          <div className="text-[8px] text-muted-foreground">Current Session</div>
                          <div className="text-xs font-bold font-mono text-foreground">SubhanAllah</div>
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-primary/30 flex items-center justify-center font-mono text-[11px] font-bold text-primary bg-primary/5">
                          33
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Device Home Bar */}
                  <div className="h-4 bg-card flex items-center justify-center pb-1">
                    <div className="w-24 h-1 bg-muted-foreground/30 rounded-full" />
                  </div>
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
              {/* Abstract decorative graphic */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />

              <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">
                Start Your Daily Azhkar Habit Today
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
                Download the fully private, offline-first Hisnul Muslim app now. Available on Android and iOS, absolutely free with zero ads.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="w-full sm:w-auto font-medium group">
                  <Apple className="w-5 h-5 me-2 group-hover:scale-110 transition-transform" />
                  {t.hisnulMuslimPage.appStore}
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-medium group">
                  <Play className="w-5 h-5 me-2 group-hover:scale-110 transition-transform" />
                  {t.hisnulMuslimPage.googlePlay}
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
