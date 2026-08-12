import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

const StatsSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            {t.stats.title} <span className="text-gradient">{t.stats.titleHighlight}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t.stats.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-premium hover-glow-border p-8 md:p-12 rounded-3xl flex flex-wrap items-center justify-center gap-10 sm:gap-16 md:gap-24 relative overflow-hidden text-center"
        >
          {/* Subtle backdrop glows inside the stats panel */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-glow-spot blur-3xl pointer-events-none opacity-40 dark:opacity-25" />
          <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-glow-spot-emerald blur-3xl pointer-events-none opacity-40 dark:opacity-25" />

          {t.stats.items.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center relative z-10 hover-lift group cursor-pointer flex flex-col items-center justify-center min-w-[140px] sm:min-w-[180px]"
            >
              <div className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gradient mb-2 group-hover:scale-105 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-muted-foreground font-medium text-sm md:text-base">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
