import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { 
  Heart, ShieldCheck, Cpu, Award, Sparkles, CreditCard, 
  Wallet, ExternalLink, Globe, Landmark, Mail, User
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useToast } from "@/hooks/use-toast";

const Donate = () => {
  useSEO({
    title: "Support Our Mission - QurApp Technologies",
    description: "Help us keep QurApp 100% ad-free, secure, and accessible to millions of Muslims worldwide.",
    url: "/donate",
  });

  const { toast } = useToast();
  const [region, setRegion] = useState<"international" | "nigeria">("international");
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("monthly");
  
  // Amounts for International ($USD) vs Nigeria (₦NGN)
  const usdAmounts = [10, 25, 50, 100, 250];
  const ngnAmounts = [2500, 5000, 10000, 25000, 50000];

  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "stripe" | "paypal" | "crypto" | "paystack" | "flutterwave" | "bank_transfer"
  >("stripe");

  const handleRegionChange = (newRegion: "international" | "nigeria") => {
    setRegion(newRegion);
    setCustomAmount("");
    if (newRegion === "nigeria") {
      setSelectedAmount(5000);
      setPaymentMethod("paystack");
    } else {
      setSelectedAmount(25);
      setPaymentMethod("stripe");
    }
  };

  const currencySymbol = region === "nigeria" ? "₦" : "$";
  const currencyCode = region === "nigeria" ? "NGN" : "USD";
  const activeAmounts = region === "nigeria" ? ngnAmounts : usdAmounts;
  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleProceedPayment = () => {
    toast({
      title: "Connecting to Payment Gateway...",
      description: `Initiating ${currencySymbol}${currentAmount.toLocaleString()} ${currencyCode} contribution via ${paymentMethod.toUpperCase()}${donorEmail ? ` (Receipt: ${donorEmail})` : ''}.`,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Banner Section */}
        <section className="py-20 border-b border-border/40 bg-gradient-to-b from-amber-500/10 via-background to-background">
          <div className="container text-center max-w-3xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Heart className="w-8 h-8 fill-amber-500" />
            </div>
            <Badge variant="outline" className="px-4 py-1 rounded-full border-amber-500/30 text-amber-500 bg-amber-500/10 text-xs font-semibold">
              Ad-Free & Ethically Funded
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-foreground">
              Support Our Mission
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We believe Quranic learning and daily supplications should never be compromised by advertisements, data tracking, or paywalls. Your generosity keeps the platform free for the entire Ummah.
            </p>
          </div>
        </section>

        {/* Donation Form & Tiers */}
        <section className="py-16">
          <div className="container max-w-4xl space-y-12">
            <Card className="border-amber-500/30 bg-card shadow-2xl overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/60 text-center pb-8 space-y-4">
                <CardTitle className="text-2xl font-bold font-display">Choose Support Amount</CardTitle>
                <CardDescription>
                  Select your location region, frequency, and contribution tier to sustain our servers and AI models.
                </CardDescription>

                {/* Region Selector (International vs Nigeria) */}
                <div className="flex justify-center pt-2">
                  <div className="bg-background p-1.5 rounded-2xl flex items-center gap-1.5 border border-border shadow-inner">
                    <button
                      onClick={() => handleRegionChange("international")}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                        region === "international"
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Globe className="w-4 h-4" /> International ($USD)
                    </button>
                    <button
                      onClick={() => handleRegionChange("nigeria")}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                        region === "nigeria"
                          ? "bg-emerald-600 text-white shadow-md"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-sm">🇳🇬</span> Nigeria (₦NGN)
                    </button>
                  </div>
                </div>

                {/* Frequency Toggle */}
                <div className="flex justify-center pt-2">
                  <div className="bg-muted/60 p-1 rounded-xl flex items-center gap-1 border border-border">
                    <button
                      onClick={() => setFrequency("monthly")}
                      className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                        frequency === "monthly"
                          ? "bg-amber-500 text-slate-950 shadow-md"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Monthly Supporter
                    </button>
                    <button
                      onClick={() => setFrequency("one-time")}
                      className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                        frequency === "one-time"
                          ? "bg-amber-500 text-slate-950 shadow-md"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      One-time Contribution
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                {/* Amount Selectors */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {activeAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount("");
                      }}
                      className={`py-3.5 px-4 rounded-xl font-bold font-display text-base sm:text-lg border transition-all ${
                        selectedAmount === amt && !customAmount
                          ? "border-amber-500 bg-amber-500/10 text-amber-500 shadow-sm"
                          : "border-border/60 hover:border-amber-500/40 text-foreground bg-background"
                      }`}
                    >
                      {currencySymbol}{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="space-y-2 max-w-xs mx-auto">
                  <label className="text-xs text-muted-foreground font-medium text-center block">
                    Or enter custom amount ({currencySymbol} {currencyCode})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                      {currencySymbol}
                    </span>
                    <Input
                      type="number"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="pl-8 text-center font-bold text-lg"
                    />
                  </div>
                </div>

                {/* Submit Trigger Modal */}
                <div className="pt-4 text-center">
                  <Button 
                    size="lg" 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-10 text-base shadow-xl shadow-amber-500/20 gap-2"
                  >
                    <Heart className="w-5 h-5 fill-slate-950" /> 
                    {frequency === "monthly" 
                      ? `Donate ${currencySymbol}${currentAmount.toLocaleString()} / month` 
                      : `Donate ${currencySymbol}${currentAmount.toLocaleString()} Once`}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transparency / Where funds go */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border/60 bg-card">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base font-bold">Cloud & AI Infrastructure</CardTitle>
                  <CardDescription className="text-xs">
                    Powering real-time audio rooms, streaming audio CDNs, and vector database GPU clusters.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/60 bg-card">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                    <Award className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base font-bold">Scholar Verification</CardTitle>
                  <CardDescription className="text-xs">
                    Supporting our board of verified Islamic scholars who review content and AI guardrails.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/60 bg-card">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base font-bold">100% Ad-Free Guarantee</CardTitle>
                  <CardDescription className="text-xs">
                    No third-party ad networks, tracking pixels, or data sales will ever be introduced.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Modal: Interactive Payment Selector */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Heart className="w-5 h-5 text-amber-500 fill-amber-500" />
                Complete Your Contribution
              </DialogTitle>
              <DialogDescription>
                Select your payment gateway for <strong>{currencySymbol}{currentAmount.toLocaleString()} {currencyCode}</strong> ({frequency}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Optional Donor Information */}
              <div className="space-y-3 p-3.5 rounded-xl bg-muted/30 border border-border">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-500" /> Donor Email</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Optional (for receipt)</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. donor@example.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="h-9 text-xs bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-amber-500" /> Donor Name</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Optional (or leave blank)</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Brother Ahmad or Anonymous"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="h-9 text-xs bg-background"
                  />
                </div>
              </div>

              {/* Payment Methods for International */}
              {region === "international" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod("stripe")}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === "stripe"
                          ? "border-amber-500 bg-amber-500/10 text-amber-500"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Card (Stripe)</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("paypal")}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === "paypal"
                          ? "border-amber-500 bg-amber-500/10 text-amber-500"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      <Wallet className="w-5 h-5" />
                      <span>PayPal</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("crypto")}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === "crypto"
                          ? "border-amber-500 bg-amber-500/10 text-amber-500"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Crypto</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Methods for Nigeria */}
              {region === "nigeria" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod("paystack")}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === "paystack"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-emerald-500" />
                      <span>Paystack</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("flutterwave")}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === "flutterwave"
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      <Wallet className="w-5 h-5 text-orange-500" />
                      <span>Flutterwave</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === "bank_transfer"
                          ? "border-blue-500 bg-blue-500/10 text-blue-500"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      <Landmark className="w-5 h-5 text-blue-500" />
                      <span>Bank Transfer</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Gateway details */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Region:</span>
                  <span className="text-foreground font-bold">
                    {region === "nigeria" ? "🇳🇬 Nigeria (NGN)" : "🌐 International (USD)"}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="text-foreground font-bold">{currencySymbol}{currentAmount.toLocaleString()} {currencyCode}</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Frequency:</span>
                  <span className="text-amber-500 capitalize font-bold">{frequency}</span>
                </div>
                {donorEmail && (
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">Receipt Email:</span>
                    <span className="text-foreground font-mono truncate max-w-[180px]">{donorEmail}</span>
                  </div>
                )}
                <div className="h-px bg-border my-2" />

                {/* International descriptions */}
                {paymentMethod === "stripe" && (
                  <p className="text-xs text-muted-foreground text-center">
                    🔒 You will be securely redirected to Stripe checkout to complete your credit/debit card payment.
                  </p>
                )}
                {paymentMethod === "paypal" && (
                  <p className="text-xs text-muted-foreground text-center">
                    🔒 You will be securely redirected to PayPal for instant processing.
                  </p>
                )}
                {paymentMethod === "crypto" && (
                  <p className="text-xs text-muted-foreground text-center font-mono">
                    Crypto wallet address: 0x89A...QurApp (USDT / ETH / BTC)
                  </p>
                )}

                {/* Nigeria descriptions */}
                {paymentMethod === "paystack" && (
                  <p className="text-xs text-muted-foreground text-center">
                    🟢 Paystack: Accepts all Nigerian debit cards (Mastercard, Visa, Verve), Bank Transfers, and USSD.
                  </p>
                )}
                {paymentMethod === "flutterwave" && (
                  <p className="text-xs text-muted-foreground text-center">
                    🦋 Flutterwave: Secure checkout for Nigerian Bank Transfer, Cards, and Mobile Money.
                  </p>
                )}
                {paymentMethod === "bank_transfer" && (
                  <div className="text-xs space-y-1 bg-background p-3 rounded-lg border border-border">
                    <p className="font-bold text-foreground">QurApp Local Bank Transfer (Nigeria):</p>
                    <p className="text-muted-foreground">Bank: <strong className="text-foreground">GTBank / Zenith Bank</strong></p>
                    <p className="text-muted-foreground">Account Name: <strong className="text-foreground">QurApp Technologies</strong></p>
                    <p className="text-muted-foreground font-mono">Account No: <strong className="text-emerald-500">0123456789</strong></p>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleProceedPayment}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2"
              >
                Proceed to Payment Gateway <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default Donate;
