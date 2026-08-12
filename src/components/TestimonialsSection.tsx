import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const TestimonialsSection = () => {
  const { t } = useLanguage();

  return (
    <section id="testimonials" className="py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {t.testimonials.title} <span className="text-gradient">{t.testimonials.titleHighlight}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.testimonials.quote}
            <span className="block mt-2 text-primary font-medium">{t.testimonials.quoteSource}</span>
          </p>
        </motion.div>

        {/* Testimonials items grid commented out until real reviews are available */}
      </div>
    </section>
  );
};

export default TestimonialsSection;
