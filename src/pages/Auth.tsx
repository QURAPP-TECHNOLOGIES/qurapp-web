import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Lock, Phone, ArrowLeft, ArrowRight, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import logoOnLight from "@/assets/logo-onlight.png";
import { useSEO } from "@/hooks/useSEO";

// Validation schemas
const phoneSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, { message: "Please enter a valid phone number" }),
});

type AuthStep = "phone" | "otp" | "success";

const Auth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>("phone");
  const [isLoading, setIsLoading] = useState(false);

  useSEO({
    title: "Login",
    description: "Sign in to your QurApp account to access your Islamic community and continue your spiritual journey.",
    url: "/auth",
    noindex: true,
  });

  // Form states
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  // Error states
  const [errors, setErrors] = useState<{ phone?: string; otp?: string }>({});

  const SIMULATED_OTP = "123456";

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = phoneSchema.safeParse({ phone });
    if (!result.success) {
      setErrors({ phone: result.error.errors[0].message });
      return;
    }

    setIsLoading(true);
    try {
      const apiGatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiGatewayUrl}/api/v1/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || "Failed to send OTP");
      }

      toast.success(`OTP sent to ${phone}.`);
      setStep("otp");
    } catch (error: any) {
      console.error("OTP Request Error:", error);
      setErrors({ phone: error.message });
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (otp.length !== 6) {
      setErrors({ otp: "Please enter the complete 6-digit code" });
      return;
    }

    setIsLoading(true);
    try {
      // In development/demo, we might still accept SIMULATED_OTP but usually we go to backend
      const apiGatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiGatewayUrl}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, otp }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || "Invalid OTP code");
      }

      const data = await res.json();

      // Store tokens
      if (data.token?.accessToken) {
        localStorage.setItem("token", data.token.accessToken);
      }
      if (data.token?.refreshToken) {
        localStorage.setItem("refreshToken", data.token.refreshToken);
      }
      if (data.role) {
        localStorage.setItem("role", data.role);
      }

      setStep("success");
      toast.success("Login successful!");

      // Redirect after showing success
      setTimeout(() => {
        navigate(data.role === 'Admin' ? "/dashboard" : "/");
      }, 2000);
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      setErrors({ otp: error.message });
      toast.error(error.message);
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
                  <h1 className="text-2xl font-bold text-foreground mb-2">Sign In</h1>
                  <p className="text-muted-foreground">Enter your phone number to receive a verification code</p>
                </div>

                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
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

                  <Button
                    type="submit"
                    className="w-full"
                    variant="primary"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending code...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send Verification Code
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>

                <p className="mt-4 text-xs text-center text-muted-foreground">
                  We'll send a 6-digit code to verify your identity
                </p>
              </motion.div>
            )}

            {/* Step 3: OTP Verification */}
            {step === "otp" && (
              <motion.div
                key="otp"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <button
                  onClick={() => setStep("phone")}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Enter Verification Code</h1>
                  <p className="text-muted-foreground">
                    We sent a 6-digit code to <span className="font-medium text-foreground">{phone}</span>
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
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
                    onClick={handleOtpVerify}
                    className="w-full"
                    variant="primary"
                    size="lg"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify & Sign In"
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      className="text-sm text-primary hover:underline"
                      onClick={() => {
                        toast.info(`Demo OTP: ${SIMULATED_OTP}`);
                      }}
                    >
                      Didn't receive code? Resend
                    </button>
                  </div>
                </div>

                {/* Demo hint */}
                <div className="mt-6 p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-xs text-center text-accent-foreground/80">
                    <strong>Demo Mode:</strong> Use code <span className="font-mono font-bold">{SIMULATED_OTP}</span> to continue
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
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
                <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back!</h1>
                <p className="text-muted-foreground mb-4">You've successfully signed in</p>
                <p className="text-sm text-muted-foreground">Redirecting you to the app...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
