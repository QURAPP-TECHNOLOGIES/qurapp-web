import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  CheckCircle, 
  Users, 
  Video, 
  MessageSquare, 
  Calendar,
  Award,
  BookOpen,
  Globe,
  ArrowRight,
  FileText,
  UserCheck
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSEO } from "@/hooks/useSEO";

const verificationIcons = [FileText, BookOpen, UserCheck, Award];
const majlisIcons = [Video, Calendar, Users, MessageSquare, Globe, Shield];

const ForScholars = () => {
  const { t } = useLanguage();
  
  useSEO({
    title: "For Scholars - Join Our Verified Scholar Program",
    description: "Become a verified scholar on QurApp. Share your knowledge, host Quranic discussions, and connect with Muslims worldwide through our platform.",
    keywords: "Islamic scholars, verified scholars, Quran teachers, Islamic education, scholar program",
    url: "/for-scholars",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <PageBreadcrumb items={[{ label: t.header.forScholars }]} />
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Shield className="w-5 h-5" />
              <span className="font-medium">{t.forScholars.badge}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              {t.forScholars.heroTitle} <span className="text-gradient">{t.forScholars.heroTitleHighlight}</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t.forScholars.heroDescription}
            </p>
            <Button size="lg" className="gap-2">
              {t.forScholars.applyButton}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Button>
          </motion.div>

          {/* Verification Process */}
          <section className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t.forScholars.verificationTitle}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t.forScholars.verificationDescription}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.forScholars.verificationSteps.map((step, index) => {
                const Icon = verificationIcons[index];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <div className="card-elevated p-6 h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {index + 1}
                        </div>
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                    {index < t.forScholars.verificationSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -end-3 w-6 h-0.5 bg-border" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Majlis Features */}
          <section className="mb-20 py-16 -mx-4 px-4 bg-primary/5 rounded-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t.forScholars.majlisTitle} <span className="text-gradient">{t.forScholars.majlisTitleHighlight}</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t.forScholars.majlisDescription}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {t.forScholars.majlisFeatures.map((feature, index) => {
                const Icon = majlisIcons[index];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  {t.forScholars.benefitsTitle} <span className="text-gradient">{t.forScholars.benefitsTitleHighlight}</span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  {t.forScholars.benefitsDescription}
                </p>
                <ul className="space-y-4">
                  {t.forScholars.benefits.map((benefit, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="card-elevated p-8"
              >
                <h3 className="text-2xl font-bold text-foreground mb-4">{t.forScholars.readyTitle}</h3>
                <p className="text-muted-foreground mb-6">
                  {t.forScholars.readyDescription}
                </p>
                <div className="space-y-4">
                  {t.forScholars.requirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{req}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-6 gap-2">
                  {t.forScholars.startApplication}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Button>
              </motion.div>
            </div>
          </section>

          {/* FAQ for Scholars */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t.forScholars.commonQuestions}
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-4">
              {t.forScholars.scholarFaq.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-elevated p-6"
                >
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ForScholars;
