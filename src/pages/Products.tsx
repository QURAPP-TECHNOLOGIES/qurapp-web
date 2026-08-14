import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Volume2, Bot, ArrowRight, CheckCircle2 } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const Products = () => {
  useSEO({
    title: "Our Products - QurApp Technologies Ecosystem",
    description: "Discover QurApp's suite of Islamic digital tools: QurApp social platform, Hisnul Muslim audio, QurAI mentor, and open research.",
    url: "/products",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Header Banner */}
        <section className="py-16 md:py-24 border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container text-center max-w-3xl space-y-4">
            <Badge variant="outline" className="px-3.5 py-1 rounded-full border-primary/30 text-primary bg-primary/10 text-xs font-semibold">
              Product Suite
            </Badge>
            <h1 className="text-4xl font-extrabold font-display tracking-tight text-foreground sm:text-5xl">
              Software Built for Spiritual Growth
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Explore our growing suite of applications designed with ethical AI, zero advertisements, and beautiful modern interfaces.
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-20">
          <div className="container space-y-16">

            {/* Product 1: QurApp */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-border/60 rounded-3xl p-8 md:p-12 bg-card shadow-lg hover:border-primary/40 transition-all">
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-display">QurApp</h2>
                    <p className="text-xs text-muted-foreground font-mono">Global Quran Social Platform</p>
                  </div>
                  <Badge variant="outline" className="ml-auto text-xs text-amber-500 border-amber-500/30 bg-amber-500/10">In Development</Badge>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  QurApp is a global platform in active development designed to connect Muslims worldwide through live audio rooms, collaborative Quran recitation, multi-lingual translations, and interactive Tajweed learning.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Live Audio Majlis Rooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>AI Tajweed Voice Feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>15+ Translation Languages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Global Khatmah Tracking</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Button asChild size="lg" className="w-full sm:w-auto gap-2 justify-center">
                    <Link to="/products/qurapp" className="flex items-center justify-center gap-2">
                      <span className="truncate">Preview QurApp Roadmap</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-2xl p-8 border border-primary/20 flex flex-col justify-center space-y-4">
                <div className="text-center space-y-2">
                  <span className="text-4xl font-extrabold text-primary font-display">Roadmap</span>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Under Active Development</p>
                </div>
                <div className="h-px bg-border" />
                <div className="text-center space-y-1">
                  <span className="text-sm font-semibold text-foreground">Coming Soon to Mobile & Web</span>
                  <p className="text-xs text-muted-foreground">Stay tuned for public beta access</p>
                </div>
              </div>
            </div>

            {/* Product 2: Hisnul Muslim */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-border/60 rounded-3xl p-8 md:p-12 bg-card shadow-lg hover:border-blue-500/40 transition-all">
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-display">Hisnul Muslim</h2>
                    <p className="text-xs text-muted-foreground font-mono">Daily Supplications & Adhkar</p>
                  </div>
                  <Badge className="ml-auto text-xs bg-emerald-600 hover:bg-emerald-700 text-white">Live App</Badge>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  A standalone, 100% offline-ready supplication app built directly from authentic Hadith sources, available as native apps for Mobile (iOS & Android) and Desktop (macOS, Windows, Linux).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>290+ Supplications & Duas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Audio Recitations & Local Cache</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Mobile (iOS & Android)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Desktop (macOS, Windows, Linux)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Button asChild size="lg" variant="outline" className="w-full sm:w-auto gap-2 justify-center border-blue-500/30 text-blue-500 hover:bg-blue-500/10">
                    <Link to="/products/hisnul-muslim" className="flex items-center justify-center gap-2">
                      <span className="truncate">View App Details</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-transparent rounded-2xl p-8 border border-blue-500/20 flex flex-col justify-center space-y-4">
                <div className="text-center space-y-2">
                  <span className="text-4xl font-extrabold text-blue-500 font-display">100%</span>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Offline & Native Platform Support</p>
                </div>
                <div className="h-px bg-border" />
                <div className="text-center space-y-1">
                  <span className="text-sm font-semibold text-foreground">Mobile & Desktop Only</span>
                  <p className="text-xs text-muted-foreground">iOS, Android, macOS, Windows & Linux</p>
                </div>
              </div>
            </div>

            {/* Product 3: QurAI */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-border/60 rounded-3xl p-8 md:p-12 bg-card shadow-lg hover:border-purple-500/40 transition-all">
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-display">QurAI</h2>
                    <p className="text-xs text-muted-foreground font-mono">AI Islamic Learning Engine</p>
                  </div>
                  <Badge variant="outline" className="ml-auto text-xs text-purple-400 border-purple-500/30">Research</Badge>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  An advanced AI mentor powered by verified classical Islamic manuscripts (Shamela Library). Provides authentic, cited answers to queries regarding Quranic verses, Tafsir, and Hadith.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Exact Manuscript Citation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Scholar Guardrail Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Natural Voice Conversation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Multi-Language NLP</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Button asChild size="lg" variant="outline" className="w-full sm:w-auto gap-2 justify-center border-purple-500/30 text-purple-500 hover:bg-purple-500/10">
                    <Link to="/products/qurai" className="flex items-center justify-center gap-2">
                      <span className="truncate">View AI Preview</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-transparent rounded-2xl p-8 border border-purple-500/20 flex flex-col justify-center space-y-4">
                <div className="text-center space-y-2">
                  <span className="text-4xl font-extrabold text-purple-500 font-display">0.00%</span>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Hallucination Rate Target</p>
                </div>
                <div className="h-px bg-border" />
                <div className="text-center space-y-1">
                  <span className="text-sm font-semibold text-foreground">Strict Grounding</span>
                  <p className="text-xs text-muted-foreground">Every response cites volume & page number</p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
