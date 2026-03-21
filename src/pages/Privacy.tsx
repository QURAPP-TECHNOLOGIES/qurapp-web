import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSEO } from "@/hooks/useSEO";

const Privacy = () => {
  const { t } = useLanguage();
  
  useSEO({
    title: "Privacy Policy",
    description: "Read QurApp's privacy policy to understand how we collect, use, and protect your personal information. Your privacy matters to us.",
    url: "/privacy",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container max-w-3xl">
          <PageBreadcrumb items={[{ label: t.privacy.title }]} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t.privacy.title}
            </h1>
            <p className="text-muted-foreground mb-12">
              {t.privacy.lastUpdated} December 24, 2024
            </p>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{t.privacy.sections.introduction.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.privacy.sections.introduction.content}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{t.privacy.sections.infoCollect.title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t.privacy.sections.infoCollect.intro}
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  {t.privacy.sections.infoCollect.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{t.privacy.sections.howWeUse.title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t.privacy.sections.howWeUse.intro}
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  {t.privacy.sections.howWeUse.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{t.privacy.sections.dataSecurity.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.privacy.sections.dataSecurity.content}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{t.privacy.sections.yourRights.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.privacy.sections.yourRights.content}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{t.privacy.sections.contactUs.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.privacy.sections.contactUs.content}
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
