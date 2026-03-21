import { motion } from "framer-motion";
import { Users, GraduationCap, BookOpen, Heart, Building2, Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const icons = [Users, GraduationCap, BookOpen, Heart, Building2, Globe];

const AudienceSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {t.audience.title} <span className="text-gradient">{t.audience.titleHighlight}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.audience.description}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.audience.items.map((audience, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:shadow-card transition-all duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold mb-1">{audience.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{audience.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
