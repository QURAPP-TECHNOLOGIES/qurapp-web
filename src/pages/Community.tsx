import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Users, ExternalLink, Globe } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const Community = () => {
  useSEO({
    title: "Global Community - QurApp Technologies",
    description: "Join the QurApp global community across WhatsApp, Telegram, Khatmah recitations, and scholar ambassador programs.",
    url: "/community",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Banner */}
        <section className="py-20 border-b border-border/40 bg-gradient-to-b from-emerald-500/10 via-background to-background">
          <div className="container text-center max-w-3xl space-y-6">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-emerald-500/30 text-emerald-500 bg-emerald-500/10 text-xs font-semibold uppercase">
              Global Ummah Hub
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-foreground">
              Connect With Millions Worldwide
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Stay connected with daily updates, live community recitation events, Khatmah groups, and scholar channels.
            </p>
          </div>
        </section>

        {/* Community Channels */}
        <section className="py-16">
          <div className="container max-w-4xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/60 bg-card hover:border-emerald-500/40 transition-all">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-bold">WhatsApp Channel</CardTitle>
                  <CardDescription className="text-xs">Daily Ayah reflections, product updates & community news.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2">
                    <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer">
                      Join WhatsApp Channel <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card hover:border-blue-500/40 transition-all">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                    <Send className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-bold">Telegram Broadcast</CardTitle>
                  <CardDescription className="text-xs">Instant notifications for live audio Majlis rooms.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full gap-2 border-blue-500/30 text-blue-500 hover:bg-blue-500/10">
                    <a href="https://t.me" target="_blank" rel="noopener noreferrer">
                      Join Telegram Channel <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
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

export default Community;
