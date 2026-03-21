import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Bot, Shield, Heart, Sparkles, BookOpen, Bell, MessageCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

const AIMentorSection = () => {
  const { t } = useLanguage();
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const chatMessages = [
    { type: "user" as const, message: t.aiMentor.chat.userMessage1 },
    { type: "ai" as const, message: t.aiMentor.chat.aiResponse1 },
    { type: "user" as const, message: t.aiMentor.chat.userMessage2 },
    { type: "ai" as const, message: t.aiMentor.chat.aiResponse2 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setCurrentMessage((prev) => (prev + 1) % chatMessages.length);
      }, 1500);
    }, 5000);

    return () => clearInterval(interval);
  }, [chatMessages.length]);

  const features = [
    {
      icon: Bell,
      title: t.aiMentor.features.reminders.title,
      description: t.aiMentor.features.reminders.description,
    },
    {
      icon: Heart,
      title: t.aiMentor.features.personalized.title,
      description: t.aiMentor.features.personalized.description,
    },
    {
      icon: BookOpen,
      title: t.aiMentor.features.learning.title,
      description: t.aiMentor.features.learning.description,
    },
    {
      icon: MessageCircle,
      title: t.aiMentor.features.companion.title,
      description: t.aiMentor.features.companion.description,
    },
  ];

  const badges = [
    { icon: Shield, label: t.aiMentor.badges.sahihOnly },
    { icon: CheckCircle2, label: t.aiMentor.badges.noFatwa },
    { icon: Heart, label: t.aiMentor.badges.adabFirst },
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">{t.aiMentor.badge}</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t.aiMentor.title}{" "}
            <span className="text-gradient">{t.aiMentor.titleHighlight}</span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            {t.aiMentor.description}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Chat Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-2 lg:order-1"
          >
            <div className="relative max-w-sm mx-auto">
              {/* Side Buttons - Left (Volume) */}
              <div className="absolute -left-[3px] top-28 flex flex-col gap-3 z-10">
                <div className="w-[3px] h-8 bg-border rounded-l-sm" />
                <div className="w-[3px] h-12 bg-border rounded-l-sm" />
                <div className="w-[3px] h-12 bg-border rounded-l-sm" />
              </div>
              
              {/* Side Button - Right (Power) */}
              <div className="absolute -right-[3px] top-36 z-10">
                <div className="w-[3px] h-16 bg-border rounded-r-sm" />
              </div>

              {/* Phone Frame */}
              <div className="bg-gradient-to-b from-muted to-card rounded-[3rem] p-[3px] shadow-2xl border border-border/30">
                <div className="bg-card rounded-[2.85rem] p-2">
                  <div className="bg-background rounded-[2.5rem] overflow-hidden h-[580px] flex flex-col relative">
                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                      <div className="bg-foreground w-28 h-8 rounded-full flex items-center justify-center gap-2 shadow-inner">
                        <div className="w-2.5 h-2.5 rounded-full bg-background/20" />
                        <div className="w-3.5 h-3.5 rounded-full bg-background/30 ring-1 ring-background/10" />
                      </div>
                    </div>
                    
                    {/* Status Bar Padding */}
                    <div className="h-14 flex-shrink-0" />
                    
                    {/* Chat Header */}
                    <div className="bg-primary/10 px-5 py-3 flex items-center gap-3 border-b border-border/50 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Bot className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{t.aiMentor.chatHeader.title}</h4>
                        <p className="text-xs text-muted-foreground">{t.aiMentor.chatHeader.subtitle}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-xs text-accent">{t.aiMentor.chatHeader.online}</span>
                      </div>
                    </div>

                    {/* Chat Messages - Fixed height with scroll */}
                    <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
                      {chatMessages.slice(0, currentMessage + 1).map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                              msg.type === "user"
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-secondary text-secondary-foreground rounded-bl-md"
                            }`}
                          >
                            {msg.message}
                          </div>
                        </motion.div>
                      ))}
                      
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-secondary px-4 py-3 rounded-2xl rounded-bl-md">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Chat Input - Fixed at bottom */}
                    <div className="px-4 pb-6 flex-shrink-0">
                      <div className="bg-secondary rounded-full px-4 py-3 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground flex-1">{t.aiMentor.chatInput}</span>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-primary-foreground" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Home Indicator */}
                    <div className="pb-2 flex-shrink-0 flex justify-center">
                      <div className="w-32 h-1 bg-foreground/20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute -right-4 top-20 bg-card rounded-xl p-3 shadow-lg border border-border/50 max-w-[200px]"
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Bell className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{t.aiMentor.notification.title}</p>
                    <p className="text-xs text-muted-foreground">{t.aiMentor.notification.message}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="order-1 lg:order-2"
          >
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="bg-card rounded-xl p-5 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Islamic Authenticity Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-accent/10 rounded-xl p-5 border border-accent/20"
            >
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                {t.aiMentor.authenticityTitle}
              </h4>
              <div className="flex flex-wrap gap-3">
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-background rounded-full border border-border/50"
                  >
                    <badge.icon className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">{badge.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {t.aiMentor.authenticityDescription}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIMentorSection;