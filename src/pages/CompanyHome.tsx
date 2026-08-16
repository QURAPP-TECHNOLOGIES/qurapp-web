import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles, Heart, BookOpen, Volume2, Bot, ShieldCheck,
  Users, ArrowRight, CheckCircle2, Globe, Cpu, Award
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { motion } from "framer-motion";
import AnimatedHeroBackground from "@/components/hero/AnimatedHeroBackground";

const CompanyHome = () => {
  useSEO({
    title: "QurApp Technologies - Building Technology for the Ummah",
    description: "Building technology that helps Muslims learn, practice and live Islam. Ad-free, ethically driven, and built for global impact.",
    url: "/",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden border-b border-border/40 min-h-[85vh] flex items-center">
          {/* Animated Hero Background */}
          {/* <AnimatedHeroBackground /> */}

          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/30 text-primary bg-primary/10 text-xs font-semibold tracking-wide uppercase">
                  QurApp Technologies Ecosystem
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-foreground leading-[1.15]"
              >
                Building technology that helps Muslims <span className="text-gradient">learn, practice and live</span> Islam.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
              >
                An ecosystem of ad-free, ethically designed digital applications powered by modern AI infrastructure and verified Islamic scholarship.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              >
                <Button asChild size="lg" className="w-full sm:w-auto text-base gap-2 shadow-lg shadow-primary/20 hover-lift">
                  <Link to="/products">
                    Explore Ecosystem <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-base gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover-lift">
                  <Link to="/donate">
                    <Heart className="w-4 h-4 fill-amber-500/20" /> Support Our Mission
                  </Link>
                </Button>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="pt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-muted-foreground"
              >
                <div className="flex items-center gap-2 hover-lift cursor-pointer">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>100% Ad-Free Commitment</span>
                </div>
                <div className="flex items-center gap-2 hover-lift cursor-pointer">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span>Scholar Verified Content</span>
                </div>
                <div className="flex items-center gap-2 hover-lift cursor-pointer">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>Global Community</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Products Grid */}
        <section className="py-24 relative overflow-hidden bg-muted/10 border-b border-border/40">
          {/* Subtle background glow spots */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-glow-spot blur-3xl opacity-30 dark:opacity-20 pointer-events-none" />
          <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-glow-spot-emerald blur-3xl opacity-30 dark:opacity-20 pointer-events-none" />

          <div className="container space-y-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto space-y-3"
            >
              <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight">Our Product Ecosystem</h2>
              <p className="text-muted-foreground">
                Purpose-built tools designed to serve every aspect of daily Islamic learning, supplication, and community connection.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Product 1: QurApp */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex"
              >
                <Card className="relative group overflow-hidden glass-premium hover-glow-border hover-lift cursor-pointer flex flex-col justify-between w-full transition-all duration-500">
                  <div>
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold transition-colors group-hover:text-gold">QurApp</CardTitle>
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold text-amber-500 border-amber-500/30 bg-amber-500/10">In Development</Badge>
                      </div>
                      <CardDescription className="text-sm pt-1">
                        Global Quran learning and social platform in active development. Connecting Muslims in live audio rooms and Tajweed practice.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Live Audio Majlis Rooms
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Interactive AI Tajweed Mentor
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Multi-lingual Translations
                      </div>
                    </CardContent>
                  </div>
                  <div className="p-6 pt-0 mt-4">
                    <Button asChild className="w-full gap-2 hover-lift" variant="outline">
                      <Link to="/products/qurapp">
                        Preview Product <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* Product 2: Hisnul Muslim */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex"
              >
                <Card className="relative group overflow-hidden glass-premium hover-glow-border-blue hover-lift cursor-pointer flex flex-col justify-between w-full transition-all duration-500">
                  <div>
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                        <Volume2 className="w-6 h-6" />
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold transition-colors group-hover:text-blue-400">Hisnul Muslim</CardTitle>
                        <Badge className="text-[10px] uppercase font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/20">Live App</Badge>
                      </div>
                      <CardDescription className="text-sm pt-1">
                        Complete daily adhkar and authentic supplications app. Native mobile (iOS/Android) and desktop apps with 100% offline support.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> 130+ Authentic Categories
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Mobile (iOS/Android) & Desktop
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> 100% Offline & High Quality Audio
                      </div>
                    </CardContent>
                  </div>
                  <div className="p-6 pt-0 mt-4">
                    <Button asChild className="w-full gap-2 hover-lift" variant="outline">
                      <Link to="/products/hisnul-muslim">
                        View App Details <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* Product 3: QurAI */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex"
              >
                <Card className="relative group overflow-hidden glass-premium hover-glow-border-purple hover-lift cursor-pointer flex flex-col justify-between w-full transition-all duration-500">
                  <div>
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-3 group-hover:scale-110 transition-transform">
                        <Bot className="w-6 h-6" />
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold transition-colors group-hover:text-purple-400">QurAI</CardTitle>
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold text-purple-400 border-purple-500/30">Research Phase</Badge>
                      </div>
                      <CardDescription className="text-sm pt-1">
                        Next-generation AI assistant built on verified classical Islamic knowledge (Shamela library) with strict alignment safeguards.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Grounded in Classical Tafsir & Hadith
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Scholar AI Guardrails & Oversight
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Natural Voice & Text Interface
                      </div>
                    </CardContent>
                  </div>
                  <div className="p-6 pt-0 mt-4">
                    <Button asChild className="w-full gap-2 hover-lift" variant="outline">
                      <Link to="/products/qurai">
                        View AI Research <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Research & Innovation Pillar */}
        <section className="py-24 relative overflow-hidden border-b border-border/40">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <Badge variant="outline" className="px-3.5 py-1 rounded-full border-primary/30 text-primary bg-primary/10 text-xs font-semibold">
                  QurApp Research Innovations
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-foreground">
                  Pioneering Ethical AI & Infrastructure for Islamic Knowledge
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We don't just build apps — we conduct foundational research on high-performance vector search, classical manuscript indexing, and AI alignment for Islamic jurisprudence.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-4 items-start hover-lift cursor-pointer p-2 rounded-xl transition-all duration-300">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0 border border-primary/15">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">Shamela Library Vector Engine</h4>
                      <p className="text-xs text-muted-foreground leading-normal mt-0.5">
                        High-throughput semantic indexing across thousands of classical Islamic volumes in Arabic, Urdu, and English.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start hover-lift cursor-pointer p-2 rounded-xl transition-all duration-300">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0 border border-emerald-500/15">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">Scholar Alignment Framework</h4>
                      <p className="text-xs text-muted-foreground leading-normal mt-0.5">
                        Systematic evaluation datasets ensuring AI responses strictly adhere to authentic scholar consensus.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button asChild variant="outline" className="gap-2 hover-lift">
                    <Link to="/research">
                      Read Our Whitepapers <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>

              {/* Research visual container */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative rounded-2xl glass-premium hover-glow-border-emerald p-8 shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-glow-spot-emerald blur-3xl -z-0 pointer-events-none opacity-40" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-4">
                    <span className="font-mono text-xs text-muted-foreground">qurapp-research / alignment-eval.v2</span>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500 bg-emerald-500/5">100% Passed</Badge>
                  </div>
                  <pre className="font-mono text-xs text-muted-foreground bg-muted/30 p-4 rounded-lg overflow-x-auto leading-relaxed border border-border/20">
                    {`{
  "model": "qurapp-scholar-v1",
  "eval_dataset": "shamela-fiqh-hadith-v4",
  "citation_accuracy": "99.4%",
  "hallucination_rate": "0.00%",
  "scholarly_verification": "APPROVED"
}`}
                  </pre>
                  <p className="text-xs text-muted-foreground italic">
                    Our AI models cite exact manuscript page numbers and volume references from verified classical archives.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Ad-Free Ethical Commitment Banner */}
        <section className="py-24 relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-background/40 to-primary/5 backdrop-blur-md" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-glow-spot blur-3xl opacity-30 dark:opacity-20 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="container relative z-10 text-center max-w-3xl space-y-6"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto hover-lift cursor-pointer">
              <Heart className="w-6 h-6 fill-amber-500" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight">Why We Are 100% Ad-Free</h2>
            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
              We believe the Holy Quran and daily supplications should never be monetized through intrusive pop-ups, user tracking, or advertisement networks. Our platform is sustained entirely through voluntary community support and ethical funding.
            </p>
            <div className="pt-2">
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2 shadow-lg shadow-amber-500/20 hover-lift">
                <Link to="/donate">
                  Support Our Mission <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CompanyHome;
