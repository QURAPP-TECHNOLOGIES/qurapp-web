import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Apple, Play, ChevronRight, Monitor } from "lucide-react";
import featuredScreen from "@/assets/app-screenshots/featured-screen.png";
import { useLanguage } from "@/i18n/LanguageContext";
import AnimatedHeroBackground from "./hero/AnimatedHeroBackground";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Animated hero background */}
      {/* <AnimatedHeroBackground /> */}

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

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
              {t.hero.title}
              <br />
              <span className="text-gradient">{t.hero.titleHighlight}</span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-muted-foreground text-lg md:text-xl max-w-xl mb-10 leading-relaxed mx-auto lg:mx-0"
            >
              {t.hero.description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center gap-3 mb-12 justify-center lg:justify-start"
            >
              <Button size="lg" className="group">
                <Apple className="w-5 h-5 me-2 group-hover:scale-110 transition-transform" />
                {t.hero.appStore}
              </Button>
              <Button variant="outline" size="lg" className="group">
                <Play className="w-5 h-5 me-2 group-hover:scale-110 transition-transform" />
                {t.hero.googlePlay}
              </Button>
              <Button variant="secondary" size="lg" className="group">
                <Monitor className="w-5 h-5 me-2 group-hover:scale-110 transition-transform" />
                {t.hero.desktop}
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
