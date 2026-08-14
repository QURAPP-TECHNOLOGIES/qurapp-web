import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, ArrowRight } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

const QurAIProduct = () => {
  useSEO({
    title: "QurAI - Next Generation AI Islamic Learning Assistant",
    description: "Discover QurAI: Grounded in classical Islamic literature with strict scholar safety guardrails.",
    url: "/products/qurai",
  });

  const [subscriptionType, setSubscriptionType] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleWaitlist = async (e: React.FormEvent) => {
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
        description: `Thank you for subscribing. We will notify you via ${subscriptionType === "email" ? "email" : "SMS"} when QurAI is ready.`,
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Banner */}
        <section id="waitlist" className="py-20 border-b border-border/40 bg-gradient-to-b from-purple-500/10 via-background to-background animate-fade-up">
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

            {/* Subscription Type Toggle Tabs */}
            <div className="flex justify-center mb-4 gap-2 bg-purple-500/10 p-1 rounded-full max-w-[280px] mx-auto border border-purple-500/25 backdrop-blur-sm shadow-inner mt-6">
              <button
                type="button"
                onClick={() => setSubscriptionType("email")}
                className={`flex-1 py-1.5 px-4 rounded-full text-xs font-semibold transition-all ${subscriptionType === "email"
                    ? "bg-purple-600 text-white shadow-md font-bold"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Email Address
              </button>
              <button
                type="button"
                onClick={() => setSubscriptionType("phone")}
                className={`flex-1 py-1.5 px-4 rounded-full text-xs font-semibold transition-all ${subscriptionType === "phone"
                    ? "bg-purple-600 text-white shadow-md font-bold"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Phone Number
              </button>
            </div>

            {/* Early Access Form */}
            <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4 items-center">
              {subscriptionType === "email" ? (
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-card border-border/80 text-foreground h-[44px] rounded-full px-5 focus-visible:ring-purple-500/50"
                  required
                />
              ) : (
                <div className="flex-1 w-full relative phone-input-light">
                  <PhoneInput
                    defaultCountry="ng"
                    value={phoneNumber}
                    onChange={(phone) => setPhoneNumber(phone)}
                    inputClassName="w-full h-[44px] rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                    className="w-full flex gap-2"
                    countrySelectorStyleProps={{
                      buttonClassName: "px-3 py-3 rounded-full border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 h-[44px] w-[64px] flex items-center justify-center",
                      dropdownStyleProps: {
                        className: "bg-card border border-border text-foreground rounded-lg shadow-xl",
                      },
                    }}
                  />
                </div>
              )}
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 h-[44px] rounded-full shadow-lg shadow-purple-500/20 hover-lift">
                {isSubmitting ? "Joining..." : "Join Early Access"} <ArrowRight className="w-4 h-4" />
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
