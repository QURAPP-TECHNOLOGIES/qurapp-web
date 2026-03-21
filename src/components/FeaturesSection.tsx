import { motion } from "framer-motion";
import featuredScreen from "@/assets/app-screenshots/featured-screen.png";
import liveEventScreen from "@/assets/app-screenshots/live-event-screen.png";
import dailyStreakUI from "@/assets/app-screenshots/khatmah-recom.png";
import { useLanguage } from "@/i18n/LanguageContext";

const images = [liveEventScreen, dailyStreakUI, featuredScreen];
const imageAlts = [
  "QurApp Khatmah rooms for collective Quran recitation",
  "QurApp Majlis sessions with verified scholars",
  "QurApp daily streaks and habit tracking",
];

const FeaturesSection = () => {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container">
        <div className="space-y-32 md:space-y-48">
          {t.features.items.map((feature, index) => {
            const reverse = index % 2 === 1;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
              >
                {/* Phone Mockup - Right side when reverse, Left side otherwise */}
                <div className={`relative flex items-center justify-center self-center min-h-[400px] md:min-h-[500px] ${reverse ? "lg:col-start-2 lg:row-start-1" : "lg:col-start-1 lg:row-start-1"}`}>
                  {/* Purple gradient background */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[350px] h-[450px] rounded-[50px] bg-gradient-purple opacity-20 blur-xl" />
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10 w-[260px] md:w-[300px]"
                  >
                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-muted bg-muted">
                      <img
                        src={images[index]}
                        alt={imageAlts[index]}
                        className="w-full h-auto"
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Text Content - Left side when reverse, Right side otherwise */}
                <div className={`flex flex-col justify-center self-center text-center lg:text-start min-h-[400px] md:min-h-[500px] ${reverse ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-2 lg:row-start-1"}`}>
                  <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                    {feature.title}
                    <br />
                    <span className="text-gradient">{feature.subtitle}</span>
                  </h2>
                  <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8">
                    {feature.description}
                  </p>
                  <a
                    href="#download"
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
                  >
                    {t.features.joinMovement}
                    <span className="rtl:rotate-180">→</span>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
