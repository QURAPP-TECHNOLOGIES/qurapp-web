import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { languages as languagesList } from "@/i18n/types";

const LanguagesSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Globe className="w-5 h-5" />
            <span className="font-medium">{t.languages.badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t.languages.title} <span className="text-gradient">{t.languages.titleHighlight}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.languages.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto"
        >
          {languagesList.map((lang, index) => (
            <motion.div
              key={lang.code}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-card rounded-full border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-default"
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="text-sm font-medium text-foreground">{lang.nativeName}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LanguagesSection;
