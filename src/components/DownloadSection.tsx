import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

const DownloadSection = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [subscriptionType, setSubscriptionType] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const contactValue = subscriptionType === "email" ? email : phoneNumber;
    if (!contactValue) return;

    // Validate inputs
    let payload = {};
    if (subscriptionType === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast({
          variant: "destructive",
          title: "Invalid Email Address",
          description: "Please enter a valid email address format (e.g. name@example.com).",
        });
        return;
      }
      payload = { email: email.trim(), devicePlatform: "web" };
    } else {
      // Validate phone number format (min length 7 digits plus international prefix)
      // react-international-phone value starts with "+" prefix, e.g. "+966555123456"
      const cleanPhone = phoneNumber.replace(/[\s\-()]/g, "");
      const phoneRegex = /^\+[0-9]{8,15}$/;
      if (!phoneRegex.test(cleanPhone)) {
        toast({
          variant: "destructive",
          title: "Invalid Phone Number",
          description: "Please enter a valid international phone number (min 7 digits after country code).",
        });
        return;
      }
      payload = { phoneNumber: cleanPhone, devicePlatform: "web" };
    }

    setIsSubmitting(true);
    try {
      const apiGatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiGatewayUrl}/api/v1/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        toast({
          title: "Already Registered",
          description: `This ${subscriptionType === "email" ? "email" : "phone number"} is already on the early access waitlist.`,
        });
        if (subscriptionType === "email") setEmail("");
        else setPhoneNumber("");
        return;
      }

      if (!res.ok) throw new Error("Failed to subscribe.");

      toast({
        title: "Joined the Waitlist!",
        description: `Thank you for subscribing. We will notify you via ${subscriptionType === "email" ? "email" : "SMS"} when QurApp is ready.`,
      });
      setEmail("");
      setPhoneNumber("");
    } catch (err) {
      console.error("Waitlist error:", err);
      toast({
        variant: "destructive",
        title: "Subscription Failed",
        description: "There was a problem signing you up. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="download" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background spotlights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-glow-spot blur-3xl opacity-20 pointer-events-none -z-10 animate-pulse" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center glass-premium p-8 md:p-12 rounded-[2.5rem] border border-primary/20 shadow-xl"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Be the First to Experience
            <br />
            <span className="text-gradient">QurApp</span>
          </h2>

          <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
            QurApp is currently under development. Join our exclusive global waitlist today to receive project updates, early beta access, and launch notifications.
          </p>

          {/* Subscription Type Toggle Tabs */}
          <div className="flex justify-center mb-6 gap-2 bg-muted/60 p-1 rounded-full max-w-[280px] mx-auto border border-border shadow-inner">
            <button
              type="button"
              onClick={() => setSubscriptionType("email")}
              className={`flex-1 py-1.5 px-4 rounded-full text-xs font-semibold transition-all ${subscriptionType === "email"
                  ? "bg-primary text-slate-950 shadow-md font-bold"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Email Address
            </button>
            <button
              type="button"
              onClick={() => setSubscriptionType("phone")}
              className={`flex-1 py-1.5 px-4 rounded-full text-xs font-semibold transition-all ${subscriptionType === "phone"
                  ? "bg-primary text-slate-950 shadow-md font-bold"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Phone Number
            </button>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6 items-center">
            {subscriptionType === "email" ? (
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 w-full px-5 py-3 rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm h-[48px] shadow-sm"
              />
            ) : (
              <div className="flex-1 w-full relative phone-input-light">
                <PhoneInput
                  defaultCountry="ng"
                  value={phoneNumber}
                  onChange={(phone) => setPhoneNumber(phone)}
                  inputClassName="w-full h-[48px] rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  className="w-full flex gap-2"
                  countrySelectorStyleProps={{
                    buttonClassName: "px-3 py-3 rounded-full border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 h-[48px] w-[64px] flex items-center justify-center",
                    dropdownStyleProps: {
                      className: "bg-card border border-border text-foreground rounded-lg shadow-xl",
                    },
                  }}
                />
              </div>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="rounded-full font-semibold px-6 shadow-lg shadow-primary/20 hover-lift h-[48px] w-full sm:w-auto"
            >
              {isSubmitting ? "Joining..." : "Join Waitlist"}
            </Button>
          </form>

          <p className="text-muted-foreground text-xs">
            100% Free • No Ads • Unsubscribe anytime
          </p>

          <p className="mt-8 text-primary font-medium italic text-sm">
            {t.download.tagline}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default DownloadSection;
