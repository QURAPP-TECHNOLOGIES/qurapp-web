import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Heart, Users, Award, BookOpen, Globe } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const About = () => {
  useSEO({
    title: "About Us - QurApp Technologies",
    description: "Learn about QurApp Technologies: our mission, ethical principles, scholar oversight, and team dedicated to serving the global Muslim Ummah.",
    url: "/about",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Banner Section */}
        <section className="py-20 border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container text-center max-w-3xl space-y-6">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/30 text-primary bg-primary/10 text-xs font-semibold uppercase">
              Our Story & Mission
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-foreground">
              Building Technology for the Ummah
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              QurApp Technologies is an independent organization dedicated to engineering state-of-the-art digital tools, AI models, and community platforms that empower Muslims worldwide.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="container space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-bold font-display">Our Core Principles</h2>
              <p className="text-muted-foreground">The foundational guidelines that govern everything we design and build.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-border/60 bg-card">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                    <Heart className="w-6 h-6 fill-amber-500/20" />
                  </div>
                  <CardTitle className="text-xl font-bold">Ad-Free & Ethical</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  We refuse to sell user data or display intrusive commercial ads inside spiritual tools. Our sustainability model relies on community support.
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                    <Award className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Scholarly Accuracy</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  All Quranic text, translations, audio recitations, and AI models are continuously audited by verified Islamic scholars.
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Globe className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Global Accessibility</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  Designing offline-first capabilities, low-bandwidth audio streaming, and multi-lingual interfaces for Muslims across every continent.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
