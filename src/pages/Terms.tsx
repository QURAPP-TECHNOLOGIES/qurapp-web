import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSEO } from "@/hooks/useSEO";

const Terms = () => {
  const { t } = useLanguage();
  
  useSEO({
    title: "Terms of Service",
    description: "Read QurApp's terms of service to understand the rules and guidelines for using our Islamic social media platform.",
    url: "/terms",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container max-w-3xl">
          <PageBreadcrumb items={[{ label: t.terms.title }]} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t.terms.title}
            </h1>
            <p className="text-muted-foreground mb-12">
              {t.terms.lastUpdated} December 24, 2024
            </p>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{t.terms.sections.agreement.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.terms.sections.agreement.content}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{t.terms.sections.useLicense.title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t.terms.sections.useLicense.intro}
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  {t.terms.sections.useLicense.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{t.terms.sections.userAccounts.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.terms.sections.userAccounts.content}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{t.terms.sections.contentSection.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.terms.sections.contentSection.content}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{t.terms.sections.disclaimer.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.terms.sections.disclaimer.content}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{t.terms.sections.limitations.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.terms.sections.limitations.content}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{t.terms.sections.changes.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.terms.sections.changes.content}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{t.terms.sections.contactUs.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.terms.sections.contactUs.content}
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

export default Terms;
