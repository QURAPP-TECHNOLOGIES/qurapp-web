import { useState, useEffect, useCallback } from "react";
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
  ExternalLink, Globe, Landmark, Mail, User, Copy, Users,
  Loader2
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

interface CampaignStats {
  totalUsd: number;
  totalNgn: number;
  donorCount: number;
  percentage: number;
  goalUsd: number;
  goalNgn: number;
}

const Donate = () => {
  useSEO({
    title: "Support the QurApp Mission - QurApp Technologies",
    description: "Help us keep QurApp 100% ad-free, secure, and accessible to millions of Muslims worldwide.",
    url: "/donate",
  });

  const { toast } = useToast();
  const [region, setRegion] = useState<"international" | "nigeria">("nigeria");
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");

  // Amounts for International ($USD) vs Nigeria (₦NGN)
  const usdAmounts = [10, 25, 50, 100, 250];
  // The min amount for NGN is 5000
  const ngnAmounts = [5000, 10000, 15000, 25000, 50000];

  // Crypto addresses from env variables with standard fallbacks
  const cryptoAddresses = {
    usdt: import.meta.env.VITE_CRYPTO_USDT_ADDRESS || "TYP5xV4Z83H2M9QurAppDonations",
    eth: import.meta.env.VITE_CRYPTO_ETH_ADDRESS || "0x89A293E37b38938QurAppDonations",
    btc: import.meta.env.VITE_CRYPTO_BTC_ADDRESS || "bc1q93e37d83928qurappdonations"
  };

  // Bank transfer details from env variables with standard fallbacks
  const bankDetails = {
    kuda: {
      name: import.meta.env.VITE_BANK_KUDA_NAME || "Kuda Bank",
      accountNumber: import.meta.env.VITE_BANK_KUDA_ACCOUNT_NUMBER || "3003376509",
      accountName: import.meta.env.VITE_BANK_KUDA_ACCOUNT_NAME || "QURAPP TECHNOLOGIES LTD"
    },
    taj: {
      name: import.meta.env.VITE_BANK_TAJ_NAME || "Taj Bank",
      accountNumber: import.meta.env.VITE_BANK_TAJ_ACCOUNT_NUMBER || "0013928718",
      accountName: import.meta.env.VITE_BANK_TAJ_ACCOUNT_NAME || "QURAPP TECHNOLOGIES LTD"
    }
  };

  // Pre-set amounts mapped to Paystack Plan Codes
  const paystackPlans: Record<string, Record<number, string>> = {
    NGN: {
      5000: import.meta.env.VITE_PAYSTACK_PLAN_NGN_5000 || "PLN_ngn_5000",
      10000: import.meta.env.VITE_PAYSTACK_PLAN_NGN_10000 || "PLN_ngn_10000",
      15000: import.meta.env.VITE_PAYSTACK_PLAN_NGN_15000 || "PLN_ngn_15000",
      25000: import.meta.env.VITE_PAYSTACK_PLAN_NGN_25000 || "PLN_ngn_25000",
      50000: import.meta.env.VITE_PAYSTACK_PLAN_NGN_50000 || "PLN_ngn_50000"
    },
    USD: {
      10: import.meta.env.VITE_PAYSTACK_PLAN_USD_10 || "PLN_usd_10",
      25: import.meta.env.VITE_PAYSTACK_PLAN_USD_25 || "PLN_usd_25",
      50: import.meta.env.VITE_PAYSTACK_PLAN_USD_50 || "PLN_usd_50",
      100: import.meta.env.VITE_PAYSTACK_PLAN_USD_100 || "PLN_usd_100",
      250: import.meta.env.VITE_PAYSTACK_PLAN_USD_250 || "PLN_usd_250"
    }
  };

  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "stripe" | "paypal" | "crypto" | "paystack" | "flutterwave" | "bank_transfer"
  >("paystack");

  const [selectedBank, setSelectedBank] = useState<"kuda" | "taj">("kuda");
  const [transferRef, setTransferRef] = useState("");
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [transferConfirmed, setTransferConfirmed] = useState(false);

  const [selectedCrypto, setSelectedCrypto] = useState<"usdt" | "eth" | "btc">("usdt");
  const [cryptoRef, setCryptoRef] = useState("");
  const [isSubmittingCrypto, setIsSubmittingCrypto] = useState(false);
  const [cryptoConfirmed, setCryptoConfirmed] = useState(false);

  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const apiGatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${apiGatewayUrl}/api/v1/donations/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to load donation campaign stats:", e);
    } finally {
      setLoadingStats(false);
    }
  }, [apiGatewayUrl]);

  useEffect(() => {
    fetchStats();

    // Generate a simple session ID if not present in sessionStorage
    let sessionId = sessionStorage.getItem("donations_session_id");
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("donations_session_id", sessionId);
    }

    const searchParams = new URLSearchParams(window.location.search);
    const utmSource = searchParams.get("utm_source") || searchParams.get("source") || "";
    const utmMedium = searchParams.get("utm_medium") || searchParams.get("medium") || "";
    const utmCampaign = searchParams.get("utm_campaign") || searchParams.get("campaign") || "";
    const utmContent = searchParams.get("utm_content") || searchParams.get("content") || "";

    fetch(`${apiGatewayUrl}/api/v1/donations/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "DONATION_PAGE_VIEWED",
        sessionId,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent
      })
    }).catch(e => console.error("Failed to log page view event:", e));
  }, [fetchStats, apiGatewayUrl]);

  const handleRegionChange = (regionVal: "international" | "nigeria") => {
    setRegion(regionVal);
    setCustomAmount("");
    if (regionVal === "nigeria") {
      setSelectedAmount(5000);
      setPaymentMethod("paystack");
    } else {
      setSelectedAmount(25);
      setPaymentMethod("paystack");
    }
  };

  const currencySymbol = region === "nigeria" ? "₦" : "$";
  const currencyCode = region === "nigeria" ? "NGN" : "USD";
  const activeAmounts = region === "nigeria" ? ngnAmounts : usdAmounts;
  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const emitEvent = useCallback(async (eventType: string, extra: any = {}) => {
    try {
      let sessionId = sessionStorage.getItem("donations_session_id");
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem("donations_session_id", sessionId);
      }

      const searchParams = new URLSearchParams(window.location.search);
      const utmSource = searchParams.get("utm_source") || searchParams.get("source") || "";
      const utmMedium = searchParams.get("utm_medium") || searchParams.get("medium") || "";
      const utmCampaign = searchParams.get("utm_campaign") || searchParams.get("campaign") || "";
      const utmContent = searchParams.get("utm_content") || searchParams.get("content") || "";

      await fetch(`${apiGatewayUrl}/api/v1/donations/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          sessionId,
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
          currency: currencyCode,
          amount: currentAmount,
          paymentMethod,
          ...extra
        })
      });
    } catch (e) {
      console.error(`Failed to log donation event: ${eventType}`, e);
    }
  }, [apiGatewayUrl, currencyCode, currentAmount, paymentMethod]);

  const loadPaystack = () => {
    return new Promise<boolean>((resolve) => {
      if ((window as any).PaystackPop) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
      if (existingScript) {
        let attempts = 0;
        const check = () => {
          if ((window as any).PaystackPop) {
            resolve(true);
          } else if (attempts < 20) {
            attempts++;
            setTimeout(check, 100);
          } else {
            resolve(false);
          }
        };
        check();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => {
        let attempts = 0;
        const check = () => {
          if ((window as any).PaystackPop) {
            resolve(true);
          } else if (attempts < 10) {
            attempts++;
            setTimeout(check, 50);
          } else {
            resolve(false);
          }
        };
        check();
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSavePaystackDonation = async (reference: string) => {
    try {
      const apiRes = await fetch(`${apiGatewayUrl}/api/v1/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: donorName || "Anonymous Sender",
          email: donorEmail,
          amount: currentAmount,
          currency: currencyCode,
          paymentMethod: "paystack",
          reference: reference,
          frequency: frequency,
          utmSource: new URLSearchParams(window.location.search).get("utm_source") || new URLSearchParams(window.location.search).get("source") || "",
          utmMedium: new URLSearchParams(window.location.search).get("utm_medium") || new URLSearchParams(window.location.search).get("medium") || "",
          utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign") || new URLSearchParams(window.location.search).get("campaign") || "",
          utmContent: new URLSearchParams(window.location.search).get("utm_content") || new URLSearchParams(window.location.search).get("content") || ""
        })
      });

      if (apiRes.ok) {
        toast({
          title: "Contribution Successful!",
          description: "Jazak Allah Khair for supporting QurApp Technologies."
        });
        fetchStats(); // Update stats live!
      } else {
        throw new Error("Failed to save donation.");
      }
    } catch (e) {
      console.error("Donation record error:", e);
      toast({
        title: "Payment Received",
        description: `Payment complete, ref: ${reference}. Thank you!`
      });
    }
    setIsModalOpen(false);
  };

  const handleProceedPayment = async () => {
    emitEvent("DONATION_CHECKOUT_STARTED");
    if (paymentMethod === "paystack") {
      if (!donorEmail) {
        toast({
          variant: "destructive",
          title: "Email Required",
          description: "Please enter your email address to receive your payment confirmation."
        });
        return;
      }

      toast({
        title: "Loading Paystack...",
        description: "Launching secure payment window..."
      });

      const loaded = await loadPaystack();
      if (!loaded) {
        toast({
          variant: "destructive",
          title: "Payment Gateway Error",
          description: "Failed to load Paystack script. Please check your internet connection."
        });
        return;
      }

      const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_d3a86377317e0ef75bf227efd7d3d86ef8e3a4b0";

      let planCode: string | undefined = undefined;

      if (frequency === "monthly") {
        const currencyKey = currencyCode.toUpperCase();
        const presetPlans = paystackPlans[currencyKey];
        planCode = presetPlans ? presetPlans[currentAmount] : undefined;

        if (!planCode) {
          toast({
            variant: "destructive",
            title: "Custom Monthly Supporter",
            description: "To donate monthly, please select one of our preset supporter tiers. Custom amounts are only supported for one-time contributions."
          });
          return;
        }
      }

      let isSuccess = false;

      try {
        const handler = (window as any).PaystackPop.setup({
          key: paystackPublicKey,
          email: donorEmail,
          amount: Math.round(currentAmount * 100),
          currency: currencyCode,
          plan: planCode,
          metadata: {
            utm_source: new URLSearchParams(window.location.search).get("utm_source") || new URLSearchParams(window.location.search).get("source") || "",
            utm_medium: new URLSearchParams(window.location.search).get("utm_medium") || new URLSearchParams(window.location.search).get("medium") || "",
            utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign") || new URLSearchParams(window.location.search).get("campaign") || "",
            utm_content: new URLSearchParams(window.location.search).get("utm_content") || new URLSearchParams(window.location.search).get("content") || "",
            frequency: frequency,
            donor_name: donorName || "Anonymous Sender",
            custom_fields: [
              {
                display_name: "Donor Name",
                variable_name: "donor_name",
                value: donorName || "Anonymous Sender"
              }
            ]
          },
          callback: function (response: any) {
            isSuccess = true;
            handleSavePaystackDonation(response.reference);
          },
          onClose: function () {
            if (!isSuccess) {
              emitEvent("DONATION_PAYMENT_FAILED");
              // Re-open our dialog modal so user can retry or adjust choices
              setIsModalOpen(true);
              toast({
                title: "Transaction Cancelled",
                description: "Payment checkout was not completed."
              });
            }
          }
        });

        if (handler && typeof handler.openIframe === 'function') {
          // Temporarily close Shadcn Dialog to release pointer-events & scroll locks
          setIsModalOpen(false);
          handler.openIframe();
        } else {
          throw new Error("Paystack setup returned an invalid handler instance.");
        }
      } catch (err: any) {
        console.error("Paystack popup setup failed:", err);
        toast({
          variant: "destructive",
          title: "Payment Setup Failed",
          description: err.message || "Failed to initialize Paystack checkout popup."
        });
      }
    } else if (paymentMethod === "bank_transfer") {
      await handleConfirmTransfer();
    } else if (paymentMethod === "crypto") {
      await handleConfirmCrypto();
    }
  };

  const handleConfirmTransfer = async () => {
    if (!donorEmail) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address to help us identify your manual transfer."
      });
      return;
    }
    setIsSubmittingTransfer(true);
    try {
      const res = await fetch(`${apiGatewayUrl}/api/v1/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: donorName || "Anonymous Sender",
          email: donorEmail,
          amount: currentAmount,
          currency: "NGN",
          paymentMethod: `bank_transfer (${selectedBank.toUpperCase()})`,
          reference: transferRef || `TRF-${selectedBank.toUpperCase()}-${Date.now()}`,
          frequency: frequency,
          utmSource: new URLSearchParams(window.location.search).get("utm_source") || new URLSearchParams(window.location.search).get("source") || "",
          utmMedium: new URLSearchParams(window.location.search).get("utm_medium") || new URLSearchParams(window.location.search).get("medium") || "",
          utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign") || new URLSearchParams(window.location.search).get("campaign") || "",
          utmContent: new URLSearchParams(window.location.search).get("utm_content") || new URLSearchParams(window.location.search).get("content") || ""
        })
      });
      if (!res.ok) throw new Error("Failed to log transfer receipt.");
      toast({
        title: "Transfer Logged!",
        description: `Thank you! Our operations team will verify the transfer in our ${selectedBank.toUpperCase()} account within 24 hours.`,
      });
      setTransferConfirmed(true);
      setTransferRef("");
      fetchStats(); // Update stats live!
      setTimeout(() => {
        setIsModalOpen(false);
        setTransferConfirmed(false);
      }, 3000);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Failed to submit transfer confirmation. Please try again."
      });
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const handleConfirmCrypto = async () => {
    if (!donorEmail) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address to initialize the secure crypto checkout."
      });
      return;
    }
    setIsSubmittingCrypto(true);
    try {
      const res = await fetch(`${apiGatewayUrl}/api/v1/donations/nowpayments-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: donorName || "Anonymous Sender",
          email: donorEmail,
          amount: currentAmount,
          currency: currencyCode,
          frequency: frequency,
          utmSource: new URLSearchParams(window.location.search).get("utm_source") || new URLSearchParams(window.location.search).get("source") || "",
          utmMedium: new URLSearchParams(window.location.search).get("utm_medium") || new URLSearchParams(window.location.search).get("medium") || "",
          utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign") || new URLSearchParams(window.location.search).get("campaign") || "",
          utmContent: new URLSearchParams(window.location.search).get("utm_content") || new URLSearchParams(window.location.search).get("content") || ""
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to initialize NOWPayments session.");
      }

      const { invoiceUrl } = await res.json();
      if (!invoiceUrl) throw new Error("Invoice checkout URL is missing.");

      toast({
        title: "Redirecting...",
        description: "Launching secure crypto payment window. Complete your payment in the new tab."
      });

      // Close the Radix UI dialog modal to release body pointer scroll locks
      setIsModalOpen(false);

      // Open the invoice URL in a new window/tab
      window.open(invoiceUrl, "_blank");

    } catch (e: any) {
      console.error("Crypto payment initialization failed:", e);
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: e.message || "Failed to start crypto payment session. Please try again."
      });
    } finally {
      setIsSubmittingCrypto(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`
    });
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
              Support the QurApp Mission
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Help us build technology that brings Muslims closer to the Qur’an and authentic Islamic knowledge—free from advertisements, intrusive tracking, and paywalls.
            </p>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Every contribution helps us build, operate, and keep QurApp accessible to Muslims around the world.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container max-w-4xl space-y-10">
            {/* Live Progress Tracker Card */}
            <Card className="border-amber-500/20 bg-card/60 backdrop-blur-md shadow-lg overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  QurApp Operational Sustainability Campaign
                </CardTitle>
                <CardDescription>
                  Help us fund the cloud infrastructure, API security, and essential operations required to maintain a seamless, high-performance platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingStats ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-muted-foreground">Calculating live progress...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-amber-500 font-bold">{stats?.percentage || 0}% Raised</span>
                        <span className="text-muted-foreground">Goal: $7,680 (₦10,598,400)</span>
                      </div>
                      <div className="w-full h-3.5 bg-muted rounded-full overflow-hidden border border-border shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${stats?.percentage || 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-2.5">
                        {stats?.donorCount && stats.donorCount > 0 
                          ? `${stats.donorCount} supporter${stats.donorCount > 1 ? 's' : ''} have already joined the mission.` 
                          : "We're just getting started. Every contribution moves us closer."}
                      </p>
                    </div>

                    {/* Stats Rows */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                      <div className="bg-background/40 p-3.5 rounded-xl border border-border/50 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Raised USD</p>
                        <p className="text-lg font-bold text-foreground mt-1">
                          ${(stats?.totalUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="bg-background/40 p-3.5 rounded-xl border border-border/50 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Raised NGN</p>
                        <p className="text-lg font-bold text-foreground mt-1">
                          ₦{(stats?.totalNgn || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="bg-background/40 p-3.5 rounded-xl border border-border/50 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Remaining</p>
                        <p className="text-lg font-bold text-foreground mt-1">
                          ${Math.max(0, 7680 - (stats?.totalUsd || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="bg-background/40 p-3.5 rounded-xl border border-border/50 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Supporters</p>
                        <p className="text-lg font-bold text-foreground mt-1 flex items-center justify-center gap-1.5">
                          <Users className="w-4 h-4 text-emerald-500" />
                          {stats?.donorCount || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Donation Form & Tiers */}
            <Card className="border-amber-500/30 bg-card shadow-2xl overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/60 text-center pb-8 space-y-4">
                <CardTitle className="text-2xl font-bold font-display">Choose Your Contribution</CardTitle>
                <CardDescription>
                  Your support ensures we stay ad-free, secure, and available for the global Ummah.
                </CardDescription>

                {/* Region Selector (International vs Nigeria) */}
                <div className="flex justify-center pt-2">
                  <div className="bg-background p-1.5 rounded-2xl flex items-center gap-1.5 border border-border shadow-inner">
                    <button
                      onClick={() => handleRegionChange("international")}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${region === "international"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <Globe className="w-4 h-4" /> International ($USD)
                    </button>
                    <button
                      onClick={() => handleRegionChange("nigeria")}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${region === "nigeria"
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
                  <div className="bg-muted/60 p-1.5 rounded-xl flex items-center gap-1.5 border border-border">
                    <button
                      onClick={() => {
                        setFrequency("monthly");
                        emitEvent("DONATION_FREQUENCY_SELECTED", { metadata: { frequency: "monthly" } });
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${frequency === "monthly"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <span>Monthly Supporter</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wide uppercase ${frequency === "monthly"
                        ? "bg-slate-950/20 text-slate-950"
                        : "bg-amber-500/20 text-amber-500"
                        }`}>Sustainer 🌙</span>
                    </button>
                    <button
                      onClick={() => {
                        setFrequency("one-time");
                        emitEvent("DONATION_FREQUENCY_SELECTED", { metadata: { frequency: "one-time" } });
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${frequency === "one-time"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      One-time Support
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 sm:p-8 space-y-8">
                {frequency === "monthly" && (
                  <p className="text-xs text-amber-500/80 text-center font-medium bg-amber-500/5 py-2.5 px-4 rounded-xl border border-amber-500/10 max-w-sm mx-auto">
                    Become a monthly Sustainer to help us cover recurring infrastructure costs and keep QurApp free for everyone.
                  </p>
                )}
                {/* Amount Selectors */}
                <div className="grid grid-cols-2 min-[380px]:grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {activeAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount("");
                        emitEvent("DONATION_AMOUNT_SELECTED", { amount: amt });
                      }}
                      className={`py-3 px-2 rounded-xl font-bold font-display text-sm sm:text-base border transition-all ${selectedAmount === amt && !customAmount
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
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        if (e.target.value) {
                          emitEvent("DONATION_AMOUNT_SELECTED", { amount: parseFloat(e.target.value) || 0 });
                        }
                      }}
                      className="pl-8 text-center font-bold text-lg"
                    />
                  </div>
                </div>

                {/* Submit Trigger Modal */}
                <div className="pt-4 text-center">
                  <Button
                    size="lg"
                    onClick={() => {
                      setTransferConfirmed(false);
                      setTransferRef("");
                      setCryptoConfirmed(false);
                      setCryptoRef("");
                      setIsModalOpen(true);
                    }}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 sm:px-10 text-sm sm:text-base shadow-xl shadow-amber-500/20 gap-2 justify-center"
                  >
                    <Heart className="w-5 h-5 fill-slate-950 shrink-0" />
                    <span className="truncate">
                      {frequency === "monthly"
                        ? `Donate ${currencySymbol}${currentAmount.toLocaleString()} / month`
                        : `Donate ${currencySymbol}${currentAmount.toLocaleString()} Once`}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Cost Breakdown Card & Flyer Asset details */}
            <Card className="border-border/60 bg-card overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/40 pb-5">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-primary animate-pulse" />
                  Where Your Support Goes
                </CardTitle>
                <CardDescription>
                  Your contributions help fund the infrastructure and essential services required to operate QurApp.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                      <div>
                        <p className="font-semibold text-foreground">🎙️ Real-Time Audio Infrastructure</p>
                        <p className="text-[10px] text-muted-foreground">Powers QurApp's live Qur'an recitation rooms and Majlis sessions.</p>
                      </div>
                    </div>
                    <span className="font-bold text-foreground">$500/mo</span>
                  </div>

                  <div className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-600" />
                      <div>
                        <p className="font-semibold text-foreground">⚙️ Core Platform Infrastructure</p>
                        <p className="text-[10px] text-muted-foreground">Databases, API services, notifications, authentication and platform operations.</p>
                      </div>
                    </div>
                    <span className="font-bold text-foreground">$112/mo</span>
                  </div>

                  <div className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-500" />
                      <div>
                        <p className="font-semibold text-foreground">☁️ Storage & Supporting Services</p>
                        <p className="text-[10px] text-muted-foreground">File storage, backups, CDN and other essential services.</p>
                      </div>
                    </div>
                    <span className="font-bold text-foreground">$28/mo</span>
                  </div>
                </div>

                <div className="flex justify-between items-center font-bold text-base p-4 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl">
                  <span>Current Monthly Infrastructure Target:</span>
                  <span>$640</span>
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
                  <CardTitle className="text-base font-bold">QurApp Infrastructure</CardTitle>
                  <CardDescription className="text-xs">
                    Powering live recitation rooms, APIs, databases, AI services, and the technology behind the platform.
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
                    Supporting a trusted environment for learning from verified scholars.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/60 bg-card">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base font-bold">100% Ad-Free</CardTitle>
                  <CardDescription className="text-xs">
                    No third-party advertising, intrusive tracking, or advertising networks will be introduced into the QurApp experience.
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
                Support the QurApp Mission
              </DialogTitle>
              <DialogDescription>
                You're supporting QurApp with <strong>{currencySymbol}{currentAmount.toLocaleString()} {currencyCode}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Optional Donor Information */}
              <div className="space-y-3 p-3.5 rounded-xl bg-muted/30 border border-border">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-500" /> Donor Email</span>
                    {paymentMethod === "paystack" || paymentMethod === "bank_transfer" || paymentMethod === "stripe" || paymentMethod === "crypto" ? (
                      <span className="text-[10px] text-red-500 font-bold">* Required</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
                    )}
                  </div>
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
                    <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
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
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setPaymentMethod("paystack");
                        emitEvent("DONATION_METHOD_SELECTED", { paymentMethod: "paystack" });
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${paymentMethod === "paystack"
                        ? "border-amber-500 bg-amber-500/10 text-amber-500"
                        : "border-border text-muted-foreground hover:border-foreground"
                        }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Card (Paystack)</span>
                    </button>

                    {/* PayPal option commented out for now
                    <button
                      onClick={() => {
                        setPaymentMethod("paypal");
                        emitEvent("DONATION_METHOD_SELECTED", { paymentMethod: "paypal" });
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === "paypal"
                          ? "border-amber-500 bg-amber-500/10 text-amber-500"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      <Wallet className="w-5 h-5" />
                      <span>PayPal</span>
                    </button>
                    */}

                    <button
                      onClick={() => {
                        setPaymentMethod("crypto");
                        emitEvent("DONATION_METHOD_SELECTED", { paymentMethod: "crypto" });
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${paymentMethod === "crypto"
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
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setPaymentMethod("paystack");
                        emitEvent("DONATION_METHOD_SELECTED", { paymentMethod: "paystack" });
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${paymentMethod === "paystack"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                        : "border-border text-muted-foreground hover:border-foreground"
                        }`}
                    >
                      <CreditCard className="w-5 h-5 text-emerald-500" />
                      <span>Paystack</span>
                    </button>

                    {/* Flutterwave option commented out for now
                    <button
                      onClick={() => {
                        setPaymentMethod("flutterwave");
                        emitEvent("DONATION_METHOD_SELECTED", { paymentMethod: "flutterwave" });
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === "flutterwave"
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      <Wallet className="w-5 h-5 text-orange-500" />
                      <span>Flutterwave</span>
                    </button>
                    */}

                    <button
                      onClick={() => {
                        setPaymentMethod("bank_transfer");
                        emitEvent("DONATION_METHOD_SELECTED", { paymentMethod: "bank_transfer" });
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${paymentMethod === "bank_transfer"
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
                {paymentMethod === "paystack" && region === "international" && (
                  <p className="text-xs text-muted-foreground text-center">
                    🔒 Secure international card checkout powered by Paystack. Accepts global credit/debit cards.
                  </p>
                )}
                {paymentMethod === "crypto" && (
                  <div className="text-xs space-y-3 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/25">
                    <p className="font-bold text-indigo-500 text-sm">Crypto Checkout (NOWPayments)</p>
                    <p className="text-muted-foreground leading-relaxed">
                      You will be redirected to the secure **NOWPayments** checkout window, where you can choose to pay in **Bitcoin (BTC)**, **Ethereum (ETH)**, **USDT**, or any of their 100+ supported cryptocurrencies.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      🔒 Secure crypto payment powered by NOWPayments.
                    </p>
                  </div>
                )}

                {/* Nigeria descriptions */}
                {paymentMethod === "paystack" && (
                  <p className="text-xs text-muted-foreground text-center">
                    🟢 Paystack: Accepts all Nigerian debit cards (Mastercard, Visa, Verve), Bank Transfers, and USSD.
                  </p>
                )}
                {paymentMethod === "bank_transfer" && (
                  <div className="text-xs space-y-3 bg-background p-4 rounded-xl border border-border">
                    <p className="font-bold text-foreground">Select Recipient Bank for Local Transfer:</p>

                    {/* Bank Tabs Selector */}
                    <div className="grid grid-cols-2 gap-2 bg-muted/40 p-1 rounded-lg border border-border/60">
                      <button
                        type="button"
                        onClick={() => setSelectedBank("kuda")}
                        className={`py-1.5 rounded-md text-[11px] font-bold transition-all ${selectedBank === "kuda"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Kuda Bank
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBank("taj")}
                        className={`py-1.5 rounded-md text-[11px] font-bold transition-all ${selectedBank === "taj"
                          ? "bg-amber-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Taj Bank
                      </button>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Bank Name:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-foreground">
                            {selectedBank === "kuda" ? bankDetails.kuda.name : bankDetails.taj.name}
                          </strong>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(
                              selectedBank === "kuda" ? bankDetails.kuda.name : bankDetails.taj.name,
                              "Bank name"
                            )}
                            className="text-primary hover:text-primary-foreground p-0.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Account Name:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-foreground">
                            {selectedBank === "kuda" ? bankDetails.kuda.accountName : bankDetails.taj.accountName}
                          </strong>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(
                              selectedBank === "kuda" ? bankDetails.kuda.accountName : bankDetails.taj.accountName,
                              "Account name"
                            )}
                            className="text-primary hover:text-primary-foreground p-0.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Account Number:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-foreground font-mono text-emerald-500 text-sm">
                            {selectedBank === "kuda" ? bankDetails.kuda.accountNumber : bankDetails.taj.accountNumber}
                          </strong>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(
                              selectedBank === "kuda" ? bankDetails.kuda.accountNumber : bankDetails.taj.accountNumber,
                              "Account number"
                            )}
                            className="text-primary hover:text-primary-foreground p-0.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {!transferConfirmed ? (
                      <div className="space-y-2 pt-2 border-t mt-2">
                        <p className="font-semibold text-foreground text-[11px]">Confirm Transfer Receipt:</p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g. Reference No / Sender Name"
                            value={transferRef}
                            onChange={(e) => setTransferRef(e.target.value)}
                            className="h-8 text-xs bg-card"
                          />
                          <Button
                            size="sm"
                            type="button"
                            disabled={isSubmittingTransfer}
                            onClick={handleConfirmTransfer}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 px-3"
                          >
                            {isSubmittingTransfer ? "Sending..." : "Notify Transfer"}
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Enter your transaction reference or bank transfer name, and click notify once sent.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-center rounded-lg font-semibold text-xs">
                        ✓ Transfer receipt logged successfully!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {paymentMethod !== "bank_transfer" && (
                <Button
                  onClick={handleProceedPayment}
                  disabled={isSubmittingCrypto}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2"
                >
                  {isSubmittingCrypto ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Initializing...
                    </>
                  ) : (
                    <>
                      Proceed to Checkout <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default Donate;
