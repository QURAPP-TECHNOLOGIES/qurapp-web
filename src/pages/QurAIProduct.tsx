import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const QurAIProduct = () => {
  useSEO({
    title: "QurAI - Next Generation AI Islamic Learning Assistant",
    description: "Discover QurAI: Grounded in classical Islamic literature with strict scholar safety guardrails.",
    url: "/products/qurai",
  });

  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast({
      title: "Waitlist Signup Received!",
      description: "Thank you for your interest in QurAI. We will notify you as soon as early access opens.",
    });
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Banner */}
        <section className="py-20 border-b border-border/40 bg-gradient-to-b from-purple-500/10 via-background to-background">
          <div className="container text-center max-w-3xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/10">
              <Bot className="w-8 h-8" />
            </div>
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-purple-500/30 text-purple-400 bg-purple-500/10 text-xs font-semibold uppercase">
              QurAI Learning Mentor
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-foreground">
              AI Grounded in Authentic Classical Knowledge
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Experience the power of natural AI interaction trained specifically on classical manuscript indexes (Shamela Library) with strict scholar alignment protocols.
            </p>

            {/* Early Access Form */}
            <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-card border-border/80 text-foreground"
                required
              />
              <Button type="submit" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2">
                Join Early Access <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default QurAIProduct;
