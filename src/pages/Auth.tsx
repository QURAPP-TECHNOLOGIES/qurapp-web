import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Lock, Phone, ArrowLeft, ArrowRight, Shield, CheckCircle2, RefreshCw, MessageSquare, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import logoOnLight from "@/assets/logo-onlight.png";
import { useSEO } from "@/hooks/useSEO";
import { apiGatewayUrl } from "@/lib/api";

// Validation schemas
const phoneSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, { message: "Please enter a valid E.164 phone number (e.g. +1234567890)" }),
});

type AuthStep = "phone" | "otp" | "success";
type DeliveryChannel = "whatsapp" | "sms";

const Auth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>("phone");
  const [isLoading, setIsLoading] = useState(false);

  useSEO({
    title: "Admin Sign In",
    description: "Sign in to the QurApp administrative management console.",
    url: "/auth",
    noindex: true,
  });

  // Form states
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [channel, setChannel] = useState<DeliveryChannel>("whatsapp");
  const [dispatchedChannel, setDispatchedChannel] = useState<string>("whatsapp");
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Error states
  const [errors, setErrors] = useState<{ phone?: string; otp?: string }>({});

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handlePhoneSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});

    const result = phoneSchema.safeParse({ phone: phone.trim() });
    if (!result.success) {
      setErrors({ phone: result.error.errors[0].message });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${apiGatewayUrl}/api/v1/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone.trim(),
          channel,
          preferredChannel: channel
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to send verification code");
      }

      const activeChannel = data.channel || channel;
      setDispatchedChannel(activeChannel);
      setResendCooldown(data.canResendInSeconds || 30);
      setStep("otp");

      const channelName = activeChannel === "whatsapp" ? "WhatsApp" : "SMS";
      toast.success(`Verification code sent via ${channelName} to ${phone}`);
    } catch (error: unknown) {
      console.error("OTP Request Error:", error);
      const isError = error instanceof Error;
      let friendlyMessage = isError ? error.message : "Failed to send verification code";
      if (isError && (error.message === "Failed to fetch" || error.name === "TypeError")) {
        friendlyMessage = "Connection error: Could not reach the authentication server. Please check your internet connection.";
      }
      setErrors({ phone: friendlyMessage });
      toast.error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (targetChannel?: DeliveryChannel) => {
    if (resendCooldown > 0 || isLoading) return;

    const channelToUse = targetChannel || (channel as DeliveryChannel);
    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${apiGatewayUrl}/api/v1/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone.trim(),
          channel: channelToUse,
          preferredChannel: channelToUse
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to resend code");
      }

      const activeChannel = data.channel || channelToUse;
      setChannel(channelToUse);
      setDispatchedChannel(activeChannel);
      setResendCooldown(data.canResendInSeconds || 30);

      const channelName = activeChannel === "whatsapp" ? "WhatsApp" : "SMS";
      toast.success(`New verification code sent via ${channelName}`);
    } catch (error: unknown) {
      console.error("OTP Resend Error:", error);
      const friendlyMessage = error instanceof Error ? error.message : "Could not resend code. Please try again later.";
      setErrors({ otp: friendlyMessage });
      toast.error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (otp.length !== 6) {
      setErrors({ otp: "Please enter the complete 6-digit code" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${apiGatewayUrl}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone.trim(),
          otp: otp.trim()
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data.message || data.error || "Invalid verification code";
        throw new Error(errorMsg);
      }

      // Check role permissions: must be Administrator to enter console
      const userRole = data.role || data.user?.role || (Array.isArray(data.roles) ? data.roles[0] : null) || "";
      const normalizedRole = typeof userRole === "string" ? userRole.trim().toLowerCase() : "";
      const isAdmin = ["admin", "super_admin", "superadmin", "administrator"].includes(normalizedRole);

      if (!isAdmin) {
        throw new Error("Access restricted: This portal is exclusively for QurApp administrators. Your account does not have administrative permissions.");
      }

      // Store authenticated credentials
      const accessToken = data.token?.accessToken || data.token || data.accessToken;
      const refreshToken = data.token?.refreshToken || data.refreshToken;

      if (accessToken) {
        localStorage.setItem("token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      localStorage.setItem("role", userRole || "Admin");

      setStep("success");
      toast.success("Welcome back, Administrator!");

      // Transition smoothly into management dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (error: unknown) {
      console.error("OTP Verification Error:", error);
      const isError = error instanceof Error;
      let friendlyMessage = isError ? error.message : "Verification failed";
      if (isError && (error.message === "Failed to fetch" || error.name === "TypeError")) {
        friendlyMessage = "Connection error: Could not reach the authentication server. Please check your network connection.";
      }
      setErrors({ otp: friendlyMessage });
      toast.error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block">
            <img src={logoOnLight} alt="QurApp" className="h-12 mx-auto" />
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated p-8"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Phone Number */}
            {step === "phone" && (
              <motion.div
                key="phone"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Admin Sign In</h1>
                  <p className="text-muted-foreground text-sm">
                    Enter your registered administrator phone number to receive a secure one-time verification code.
                  </p>
                </div>

                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="tel"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        enterKeyHint="next"
                        required
                        placeholder="+1234567890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`pl-10 ${errors.phone ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  {/* Channel Selection */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Delivery Channel</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setChannel("whatsapp")}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                          channel === "whatsapp"
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                        WhatsApp (Instant)
                      </button>
                      <button
                        type="button"
                        onClick={() => setChannel("sms")}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                          channel === "sms"
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <Smartphone className="h-3.5 w-3.5 text-primary" />
                        Direct SMS
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-2"
                    variant="primary"
                    size="lg"
                    disabled={isLoading || !phone.trim()}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending Code...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send Verification Code
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>

                <p className="mt-5 text-xs text-center text-muted-foreground">
                  Secured with real-time cryptographic OTP validation.
                </p>
              </motion.div>
            )}

            {/* Step 2: OTP Verification */}
            {step === "otp" && (
              <motion.div
                key="otp"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setErrors({});
                  }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Change Phone Number
                </button>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Enter Verification Code</h1>
                  <p className="text-muted-foreground text-sm">
                    Enter the 6-digit code dispatched via{" "}
                    <span className="font-semibold text-foreground">
                      {dispatchedChannel === "whatsapp" ? "WhatsApp" : "SMS"}
                    </span>{" "}
                    to <span className="font-semibold text-foreground">{phone}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpVerify} className="space-y-6">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      autoFocus
                      onChange={(value) => {
                        setOtp(value);
                        setErrors({});
                      }}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {errors.otp && (
                    <p className="text-sm text-destructive text-center">{errors.otp}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    variant="primary"
                    size="lg"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Verifying Code...
                      </span>
                    ) : (
                      "Verify & Sign In"
                    )}
                  </Button>

                  {/* Resend actions with real countdown */}
                  <div className="text-center space-y-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">Didn't receive the verification code?</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      {resendCooldown > 0 ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                          <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground/60" />
                          Resend available in {resendCooldown}s
                        </span>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleResendOtp("whatsapp")}
                            disabled={isLoading}
                            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                          >
                            <MessageSquare className="h-3 w-3 text-emerald-500" />
                            Resend via WhatsApp
                          </button>
                          <span className="text-muted-foreground text-xs">•</span>
                          <button
                            type="button"
                            onClick={() => handleResendOtp("sms")}
                            disabled={isLoading}
                            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                          >
                            <Smartphone className="h-3 w-3" />
                            Send via SMS
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {step === "success" && (
              <motion.div
                key="success"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                </motion.div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Access Granted</h1>
                <p className="text-muted-foreground mb-4">Administrator credentials authenticated successfully.</p>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <span className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Redirecting to management dashboard...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
