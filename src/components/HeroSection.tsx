import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import featuredScreen from "@/assets/app-screenshots/featured-screen.png";
import { useLanguage } from "@/i18n/LanguageContext";
import AnimatedHeroBackground from "./hero/AnimatedHeroBackground";
import { useToast } from "@/hooks/use-toast";


const getRotatingHighlights = (lang: string, defaultHighlight: string) => {
  switch (lang) {
    case "ar":
      return ["— معًا", "— في انسجام", "— بالإيمان", "— عالميًا"];
    case "fa":
      return ["— با هم", "— در هماهنگی", "— در ایمان", "— در سراسر جهان"];
    case "ur":
      return ["— مل کر", "— ہم آہنگی میں", "— ایمان میں", "— عالمی سطح پر"];
    case "tr":
      return ["— Birlikte", "— Uyum İçinde", "— İmanla", "— Küresel Olarak"];
    case "fr":
      return ["— Ensemble", "— En Harmonie", "— En Foi", "— Globalement"];
    case "es":
      return ["— Juntos", "— En Armonía", "— En la Fe", "— Globalmente"];
    case "en":
    default:
      return ["— Together", "— In Harmony", "— In Faith", "— Globally"];
  }
};

const HeroSection = () => {
  const { t, language } = useLanguage();
  const highlights = getRotatingHighlights(language, t.hero.titleHighlight);
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightIndex((prev) => (prev + 1) % highlights.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [highlights.length]);

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Animated hero background */}
      <AnimatedHeroBackground />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-start"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
            >
              <span className="font-bold">🌙</span> {t.hero.badge}
            </motion.div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] mb-6 flex flex-col items-center lg:items-start min-h-[2.3em] sm:min-h-[2.4em] md:min-h-[2.5em] lg:min-h-[2.4em]">
              <span className="block mb-1">{t.hero.title}</span>
              <span className="relative inline-block h-[1.3em] overflow-hidden w-full lg:w-auto">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={highlights[highlightIndex]}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 right-0 lg:static text-gradient block w-full whitespace-nowrap"
                  >
                    {highlights[highlightIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-muted-foreground text-lg md:text-xl max-w-xl mb-10 leading-relaxed mx-auto lg:mx-0"
            >
              {t.hero.description}
            </motion.p>

            {/* Waitlist CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <Button
                asChild
                size="lg"
                className="rounded-full font-semibold px-8 shadow-lg shadow-primary/20 hover-lift h-[48px] w-full sm:w-auto"
              >
                <a href="#download">
                  Join Early Access Waitlist
                </a>
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-col sm:flex-row items-center gap-6 text-sm text-muted-foreground justify-center lg:justify-start"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-gold/20 border-2 border-background flex items-center justify-center text-xs font-semibold text-primary"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="font-medium">{t.hero.builtFor}</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-border" />
              <a href="#features" className="inline-flex items-center gap-1 text-primary hover:underline group font-medium">
                {t.hero.seeHow}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
              </a>
            </motion.div>
          </motion.div>

          {/* Right - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Warm gradient background behind phone */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[400px] h-[500px] rounded-[60px] bg-gradient-warm opacity-90 blur-sm" />
            </div>

            {/* Phone mockup */}
            <div className="relative z-10 w-[280px] md:w-[320px]">
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-foreground/10 bg-foreground/5">
                <img
                  src={featuredScreen}
                  alt="QurApp main screen showing live recitation rooms"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Decorative curved line */}
            <svg
              className="absolute bottom-0 start-0 w-48 h-48 text-muted opacity-30"
              viewBox="0 0 200 200"
              fill="none"
            >
              <path
                d="M10 190 Q 100 100 190 10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
