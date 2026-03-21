import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Apple, Play, Monitor } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const DownloadSection = () => {
  const { t } = useLanguage();

  return (
    <section id="download" className="py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
            {t.download.title}
            <br />
            <span className="text-gradient">{t.download.titleHighlight}</span>
          </h2>

          <p className="text-muted-foreground text-lg md:text-xl mb-4 leading-relaxed">
            {t.download.description1}
            <br />
            {t.download.description2}
          </p>
          
          <p className="text-foreground font-medium text-lg mb-10">
            {t.download.description3}
          </p>

          {/* Mobile Apps */}
          <p className="text-sm font-medium text-muted-foreground mb-3">{t.download.mobileApps}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button size="lg" className="w-full sm:w-auto group px-8">
              <Apple className="w-5 h-5 me-2 group-hover:scale-110 transition-transform" />
              {t.download.appStore}
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto group px-8">
              <Play className="w-5 h-5 me-2 group-hover:scale-110 transition-transform" />
              {t.download.googlePlay}
            </Button>
          </div>

          {/* Desktop Apps */}
          <p className="text-sm font-medium text-muted-foreground mb-3">{t.download.desktopApps}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto group px-8">
              <Apple className="w-5 h-5 me-2 group-hover:scale-110 transition-transform" />
              {t.download.macDownload}
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto group px-8">
              <Monitor className="w-5 h-5 me-2 group-hover:scale-110 transition-transform" />
              {t.download.windowsDownload}
            </Button>
          </div>

          <p className="text-muted-foreground text-sm">
            {t.download.freeDownload}
          </p>
          
          <p className="mt-8 text-primary font-medium italic">
            {t.download.tagline}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default DownloadSection;
