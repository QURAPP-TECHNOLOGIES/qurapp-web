import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Search,
  Trash2,
  Calendar,
  Laptop,
  AlertTriangle,
  Loader2,
  Phone,
  FileText,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/api";

type Subscriber = {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  devicePlatform: string;
  createdAt: string;
};

type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "replied" | "ignored";
  replyMessage: string | null;
  repliedAt: string | null;
  createdAt: string;
};

type DonationRecord = {
  id: string;
  name: string | null;
  email: string | null;
  amount: number;
  currency: string;
  paymentMethod: string;
  reference: string | null;
  status: string;
  createdAt: string;
};

export function EmailManagement() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "inquiries" | "email-templates" | "sms-templates" | "donations">("list");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);

  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [approvingDonationId, setApprovingDonationId] = useState<string | null>(null);

  const { toast } = useToast();
  const apiGatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/waitlist`);
      if (res.ok) {
        const data: Subscriber[] = await res.json();
        setSubscribers(data);
      } else {
        throw new Error("Failed to fetch waitlist subscribers from backend.");
      }
    } catch (error: any) {
      console.error("Error fetching waitlist:", error);
      toast({
        title: "Error Loading Waitlist",
        description: error?.message || String(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [apiGatewayUrl, toast]);

  const fetchInquiries = useCallback(async () => {
    setInquiriesLoading(true);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/contact`);
      if (res.ok) {
        const data: ContactInquiry[] = await res.json();
        setInquiries(data);
      } else {
        throw new Error("Failed to fetch contact inquiries.");
      }
    } catch (error: any) {
      console.error("Error fetching inquiries:", error);
      toast({
        title: "Error Loading Inquiries",
        description: error?.message || String(error),
        variant: "destructive",
      });
    } finally {
      setInquiriesLoading(false);
    }
  }, [apiGatewayUrl, toast]);

  const fetchDonations = useCallback(async () => {
    setDonationsLoading(true);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/donations`);
      if (res.ok) {
        const data: DonationRecord[] = await res.json();
        setDonations(data);
      } else {
        throw new Error("Failed to fetch donation records.");
      }
    } catch (error: any) {
      console.error("Error fetching donations:", error);
      toast({
        title: "Error Loading Donations",
        description: error?.message || String(error),
        variant: "destructive",
      });
    } finally {
      setDonationsLoading(false);
    }
  }, [apiGatewayUrl, toast]);

  useEffect(() => {
    if (activeTab === "list") {
      fetchSubscribers();
    } else if (activeTab === "inquiries") {
      fetchInquiries();
    } else if (activeTab === "donations") {
      fetchDonations();
    }
  }, [activeTab, fetchSubscribers, fetchInquiries, fetchDonations]);

  const handleApproveDonation = async (id: string) => {
    setApprovingDonationId(id);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/donations/${id}/approve`, {
        method: "POST"
      });

      if (res.ok) {
        const result = await res.json();
        toast({
          title: "Donation Approved",
          description: "Transaction status updated to SUCCESS.",
        });
        setDonations((prev) =>
          prev.map((item) => (item.id === id ? result.data : item))
        );
      } else {
        throw new Error("Failed to approve donation transaction.");
      }
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error?.message || String(error),
        variant: "destructive",
      });
    } finally {
      setApprovingDonationId(null);
    }
  };

  const handleDeleteDonation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this donation record?")) return;
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/donations/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setDonations((prev) => prev.filter((item) => item.id !== id));
        toast({
          title: "Record Deleted",
          description: "Donation transaction record removed.",
        });
      } else {
        throw new Error("Failed to delete donation record.");
      }
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error?.message || String(error),
        variant: "destructive",
      });
    }
  };

  const handleReplyInquiry = async (id: string) => {
    if (!replyText.trim()) return;
    setSendingReplyId(id);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/contact/${id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ replyMessage: replyText }),
      });

      if (res.ok) {
        const result = await res.json();
        toast({
          title: "Reply Dispatched",
          description: "Response sent via Resend API and status updated to Replied.",
        });
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? result.data : item))
        );
        setSelectedInquiry(null);
        setReplyText("");
      } else {
        const errData = await res.json();
        throw new Error(errData?.message || "Failed to submit reply email.");
      }
    } catch (error: any) {
      toast({
        title: "Reply Failed",
        description: error?.message || String(error),
        variant: "destructive",
      });
    } finally {
      setSendingReplyId(null);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact message?")) return;
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/contact/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setInquiries((prev) => prev.filter((item) => item.id !== id));
        toast({
          title: "Inquiry Deleted",
          description: "Contact inquiry deleted successfully.",
        });
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
        }
      } else {
        throw new Error("Failed to delete contact inquiry.");
      }
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error?.message || String(error),
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    setIsDeletingId(id);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/waitlist/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSubscribers((prev) => prev.filter((sub) => sub.id !== id));
        toast({
          title: "Subscriber Removed",
          description: "Waitlist entry deleted successfully.",
        });
      } else {
        throw new Error("Failed to delete subscriber entry.");
      }
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error?.message || String(error),
        variant: "destructive",
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied!",
      description: "Template copied to clipboard.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSubscribers = subscribers.filter((sub) => {
    const query = searchQuery.toLowerCase();
    const emailVal = sub.email || "";
    const phoneVal = sub.phoneNumber || "";
    const platformVal = sub.devicePlatform || "";
    return (
      emailVal.toLowerCase().includes(query) ||
      phoneVal.toLowerCase().includes(query) ||
      platformVal.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Ready-made Templates data
  const emailTemplates = [
    {
      id: "email-welcome",
      title: "1. Welcome & Confirmation Email",
      description: "Dispatched automatically to subscribers upon waitlist registration.",
      subject: "You're on the list! Welcome to QurApp 🌙",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the QurApp Waitlist</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;500&display=swap');
    body { margin: 0; padding: 0; background-color: #FAF8F6; font-family: 'Open Sans', Arial, sans-serif; }
    .main-table { background-color: #ffffff; margin: 40px auto; width: 100%; max-width: 600px; border-radius: 24px; border: 1px solid #EAE2D8; overflow: hidden; }
    .header-banner { background-color: #1C130C; padding: 40px 20px; text-align: center; border-bottom: 3px solid #D4AF37; }
    .header-logo { width: 64px; height: 64px; }
    .header-title { font-family: 'Montserrat', sans-serif; color: #D4AF37; font-size: 24px; margin: 12px 0 0 0; }
    .content-body { padding: 40px 30px; }
    .headline { font-family: 'Montserrat', sans-serif; color: #1C130C; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; }
    .paragraph { color: #5C524A; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
    .highlight-box { background-color: #FAF6F2; border-left: 4px solid #D4AF37; border-radius: 8px; padding: 20px; margin-bottom: 28px; }
    .cta-button { background-color: #D4AF37; color: #ffffff !important; display: inline-block; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 30px; border-radius: 30px; }
    .footer { text-align: center; padding: 30px 20px; background-color: #1C130C; color: #A3968C; font-size: 12px; }
    .footer a { color: #D4AF37; text-decoration: none; }
  </style>
</head>
<body>
  <table width="100%" bgcolor="#FAF8F6">
    <tr>
      <td>
        <table class="main-table" align="center" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header-banner">
              <img class="header-logo" src="https://api.qurapp.com/public/logo-hsn.png" alt="QurApp Logo">
              <h1 class="header-title">QurApp</h1>
            </td>
          </tr>
          <tr>
            <td class="content-body">
              <h2 class="headline">You're on the list! Welcome to QurApp. 🌙</h2>
              <p class="paragraph">Assalamu Alaikum,</p>
              <p class="paragraph">Thank you for joining our exclusive early access waitlist. QurApp is building the world's first dedicated, ad-free Islamic social networking platform, designed to reconnect the global Ummah with the Holy Quran.</p>
              <div class="highlight-box">
                <p class="paragraph" style="margin: 0; font-weight: 700; color: #1C130C;">What to expect next:</p>
                <p class="paragraph" style="margin: 5px 0 0 0; font-size: 14px;">We are actively polishing our beta. You will receive priority access keys, invites to scholar-led live audio Majlis sessions, and notification digests before our public app store releases.</p>
              </div>
              <p class="paragraph">In the meantime, feel free to follow our news feed and read our scientific research publications.</p>
              <p align="center" style="margin: 30px 0;"><a class="cta-button" href="https://qurapp.com/blog" target="_blank">Explore Our Blog</a></p>
              <p class="paragraph" style="margin-bottom: 0;">Warm regards,<br><strong>The QurApp Team</strong></p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p style="margin-bottom: 12px;"><a href="https://qurapp.com/privacy">Privacy Policy</a> | <a href="https://qurapp.com/terms">Terms</a> | <a href="https://qurapp.com/contact">Support</a></p>
              <p>© 2026 QurApp Technologies. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    {
      id: "email-update",
      title: "2. Product & Feature Update Email",
      description: "Send updates about design previews, scholarship verification, or new features.",
      subject: "QurApp Progress Update: Verification for Scholars & Beta Milestones 🌙",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>QurApp Updates</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;500&display=swap');
    body { margin: 0; padding: 0; background-color: #FAF8F6; font-family: 'Open Sans', Arial, sans-serif; }
    .main-table { background-color: #ffffff; margin: 40px auto; width: 100%; max-width: 600px; border-radius: 24px; border: 1px solid #EAE2D8; overflow: hidden; }
    .header-banner { background-color: #1C130C; padding: 35px 20px; text-align: center; border-bottom: 3px solid #D4AF37; }
    .header-title { font-family: 'Montserrat', sans-serif; color: #D4AF37; font-size: 22px; margin: 0; }
    .content-body { padding: 40px 30px; }
    .headline { font-family: 'Montserrat', sans-serif; color: #1C130C; font-size: 20px; font-weight: 700; margin-bottom: 20px; }
    .paragraph { color: #5C524A; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
    .card-box { background-color: #FAF6F2; border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid #EAE2D8; }
    .cta-button { background-color: #1C130C; color: #D4AF37 !important; display: inline-block; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 30px; border-radius: 30px; border: 1px solid #D4AF37; }
    .footer { text-align: center; padding: 30px 20px; background-color: #1C130C; color: #A3968C; font-size: 12px; }
  </style>
</head>
<body>
  <table width="100%" bgcolor="#FAF8F6">
    <tr>
      <td>
        <table class="main-table" align="center" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header-banner">
              <h1 class="header-title">QurApp Progress Update</h1>
            </td>
          </tr>
          <tr>
            <td class="content-body">
              <h2 class="headline">Building Verification Systems for Certified Scholars 📜</h2>
              <p class="paragraph">Assalamu Alaikum,</p>
              <p class="paragraph">We wanted to share some exciting progress with our waitlist community. Over the past few weeks, our engineering team has been focused on building our dedicated Islamic Scholar Verification Workflow.</p>
              
              <div class="card-box">
                <p style="margin: 0 0 10px 0; font-family: 'Montserrat', sans-serif; font-weight: 700; color: #1C130C; font-size: 16px;">Key Highlights:</p>
                <ul style="margin: 0; padding-left: 20px; color: #5C524A; font-size: 14px; line-height: 1.6;">
                  <li><strong>Verified Profiles:</strong> Credentials validation to protect the integrity of knowledge shared.</li>
                  <li><strong>Scholar-Led Audio Rooms:</strong> Guided recite-along sessions with authenticated Qaris.</li>
                  <li><strong>Ad-Free Experience:</strong> Maintaining a pure environment for religious reflection.</li>
                </ul>
              </div>

              <p class="paragraph">We are on track to open the private TestFlight and Android Beta soon. Thank you for your continued support.</p>
              <p align="center" style="margin: 30px 0;"><a class="cta-button" href="https://qurapp.com/blog" target="_blank">Read Our Full Dev Blog</a></p>
              <p class="paragraph" style="margin-bottom: 0;">Warm regards,<br><strong>The QurApp Team</strong></p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p>© 2026 QurApp Technologies. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    {
      id: "email-beta",
      title: "3. Beta Access Invitation Email",
      description: "Send invitation instructions to waitlisted users when TestFlight or Google Play is ready.",
      subject: "Your beta invitation code is ready! Join QurApp today 🌙",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>QurApp Beta Invite</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;500&display=swap');
    body { margin: 0; padding: 0; background-color: #FAF8F6; font-family: 'Open Sans', Arial, sans-serif; }
    .main-table { background-color: #ffffff; margin: 40px auto; width: 100%; max-width: 600px; border-radius: 24px; border: 1px solid #EAE2D8; overflow: hidden; }
    .header-banner { background-color: #1C130C; padding: 35px 20px; text-align: center; border-bottom: 3px solid #D4AF37; }
    .header-title { font-family: 'Montserrat', sans-serif; color: #D4AF37; font-size: 22px; margin: 0; }
    .content-body { padding: 40px 30px; }
    .headline { font-family: 'Montserrat', sans-serif; color: #1C130C; font-size: 20px; font-weight: 700; margin-bottom: 20px; }
    .code-box { background-color: #FAF6F2; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0; border: 1px dashed #D4AF37; font-family: monospace; font-size: 24px; font-weight: bold; color: #1C130C; letter-spacing: 2px; }
    .cta-button { background-color: #D4AF37; color: #ffffff !important; display: inline-block; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 35px; border-radius: 30px; }
    .footer { text-align: center; padding: 30px 20px; background-color: #1C130C; color: #A3968C; font-size: 12px; }
  </style>
</head>
<body>
  <table width="100%" bgcolor="#FAF8F6">
    <tr>
      <td>
        <table class="main-table" align="center" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header-banner">
              <h1 class="header-title">QurApp Beta Release</h1>
            </td>
          </tr>
          <tr>
            <td class="content-body">
              <h2 class="headline">Assalamu Alaikum! You're invited to the Beta 🌙</h2>
              <p class="paragraph">The wait is over. As part of our early access waitlist, we are thrilled to invite you to the private beta release of QurApp.</p>
              
              <p class="paragraph" style="margin-bottom: 0;">Below is your exclusive beta access code:</p>
              <div class="code-box">QURAPP-BETA-786</div>

              <p class="paragraph">Please download the application from the TestFlight (iOS) or Play Store Beta (Android) using the link below, and enter your access code upon registration.</p>
              <p align="center" style="margin: 30px 0;"><a class="cta-button" href="https://qurapp.com/beta" target="_blank">Download QurApp Beta</a></p>
              <p class="paragraph" style="margin-bottom: 0;">Jazak Allah Khair,<br><strong>The QurApp Team</strong></p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p>© 2026 QurApp Technologies. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    }
  ];

  const smsTemplates = [
    {
      id: "sms-welcome",
      title: "1. Waitlist Confirmation SMS",
      description: "Send confirmation message immediately after phone waitlist registration.",
      text: "QurApp: Assalamu Alaikum! You're on the early access waitlist. We will notify you via SMS when our private beta is ready. Follow updates at https://qurapp.com/blog 🌙"
    },
    {
      id: "sms-majlis",
      title: "2. Live Majlis Start Alert SMS",
      description: "Notify users about a live scholar recitation or Q&A room.",
      text: "QurApp: A new live scholar audio Majlis session is starting now! Join our community to listen and recite together: https://app.qurapp.com/majlis 🌙"
    },
    {
      id: "sms-launch",
      title: "3. Product Launch Announcement SMS",
      description: "Send to all registered users upon official launch.",
      text: "QurApp: Assalamu Alaikum! QurApp is now officially launched. Reconnect with the Holy Quran. Download now on iOS and Android: https://qurapp.com/download 🌙"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-display">Waitlist & Templates</h2>
          <p className="text-muted-foreground">Manage early access subscriptions and copy outreach message templates</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
            <Mail className="h-3 w-3" />
            {subscribers.length} Registered
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 border-b-2 text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === "list"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="h-4 w-4" />
          Subscribers List
        </button>
        <button
          onClick={() => setActiveTab("inquiries")}
          className={`px-4 py-2 border-b-2 text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === "inquiries"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Contact Inquiries
        </button>
        <button
          onClick={() => setActiveTab("donations")}
          className={`px-4 py-2 border-b-2 text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === "donations"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart className="h-4 w-4" />
          Donation History
        </button>
        <button
          onClick={() => setActiveTab("email-templates")}
          className={`px-4 py-2 border-b-2 text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === "email-templates"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          Email Templates
        </button>
        <button
          onClick={() => setActiveTab("sms-templates")}
          className={`px-4 py-2 border-b-2 text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === "sms-templates"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Phone className="h-4 w-4" />
          SMS/Phone Templates
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {/* Search Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, phone, or platform..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm">Loading waitlist subscriptions...</p>
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-40 text-yellow-500" />
                <p className="text-base font-medium">No waitlist subscriptions found</p>
                <p className="text-xs mt-1">Submissions via the QurApp Landing Page will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/40 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      <th className="p-4 font-semibold">Contact Info</th>
                      <th className="p-4 font-semibold">Registered Platform</th>
                      <th className="p-4 font-semibold">Type</th>
                      <th className="p-4 font-semibold">Registration Date</th>
                      <th className="p-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-sm">
                    {filteredSubscribers.map((sub, index) => (
                      <motion.tr
                        key={sub.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="p-4 font-medium text-foreground">
                          <div className="flex flex-col">
                            {sub.email && (
                              <span className="flex items-center gap-1.5 text-foreground">
                                <Mail className="h-3.5 w-3.5 opacity-60 text-primary" />
                                {sub.email}
                              </span>
                            )}
                            {sub.phoneNumber && (
                              <span className="flex items-center gap-1.5 text-muted-foreground text-xs mt-0.5">
                                <Phone className="h-3.5 w-3.5 opacity-60 text-green-500" />
                                {sub.phoneNumber}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 capitalize">
                          <div className="flex items-center gap-1.5">
                            <Laptop className="h-3.5 w-3.5 opacity-60" />
                            <span>{sub.devicePlatform}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {sub.email && sub.phoneNumber ? (
                            <Badge variant="secondary" className="text-xs bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                              Dual Waitlist
                            </Badge>
                          ) : sub.email ? (
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                              Email Only
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                              Mobile Only
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 opacity-60" />
                            <span>{formatDate(sub.createdAt)}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            disabled={isDeletingId === sub.id}
                            onClick={() => handleDeleteSubscriber(sub.id)}
                          >
                            {isDeletingId === sub.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "email-templates" && (
        <div className="grid grid-cols-1 gap-6">
          {emailTemplates.map((tmpl) => (
            <div key={tmpl.id} className="bg-card rounded-xl border border-border/50 p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-foreground font-display">{tmpl.title}</h3>
                  <p className="text-sm text-muted-foreground">{tmpl.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleCopy(tmpl.id, tmpl.html)}
                  >
                    {copiedId === tmpl.id ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-xs space-y-1.5 bg-muted/40 p-3 rounded-lg border">
                <div><span className="font-semibold text-muted-foreground uppercase text-[10px]">Subject:</span> <span className="text-foreground">{tmpl.subject}</span></div>
                <div><span className="font-semibold text-muted-foreground uppercase text-[10px]">From:</span> <span className="text-foreground">QurApp &lt;welcome@qurapp.com&gt;</span></div>
              </div>

              {/* Collapsible/Boxed Code Preview */}
              <div className="relative rounded-lg overflow-hidden border bg-zinc-950 p-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                  <span className="text-xs text-white/50 font-mono">HTML Source Code</span>
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    Responsive Table Layout
                  </span>
                </div>
                <pre className="text-xs font-mono text-zinc-300 max-h-48 overflow-y-auto whitespace-pre-wrap select-all">
                  {tmpl.html}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "sms-templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {smsTemplates.map((tmpl) => (
            <div key={tmpl.id} className="bg-card rounded-xl border border-border/50 p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-bold text-foreground font-display">{tmpl.title}</h3>
                  <Badge variant="secondary" className="font-mono text-[10px]">SMS Text</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{tmpl.description}</p>
                <div className="bg-zinc-950 text-zinc-200 p-4 rounded-lg border border-border font-sans text-sm min-h-24 whitespace-pre-wrap leading-relaxed select-all">
                  {tmpl.text}
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleCopy(tmpl.id, tmpl.text)}
                >
                  {copiedId === tmpl.id ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Text</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "inquiries" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            {inquiriesLoading ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm">Loading contact inquiries...</p>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-40 text-yellow-500" />
                <p className="text-base font-medium">No contact inquiries found</p>
                <p className="text-xs mt-1">Submissions via the QurApp Contact Page will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/40 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      <th className="p-4 font-semibold">Sender Details</th>
                      <th className="p-4 font-semibold">Subject</th>
                      <th className="p-4 font-semibold">Message Preview</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Date Submitted</th>
                      <th className="p-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-sm">
                    {inquiries.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{item.name}</span>
                            <span className="text-xs text-muted-foreground">{item.email}</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-foreground max-w-[150px] truncate">{item.subject}</td>
                        <td className="p-4 text-muted-foreground max-w-[250px] truncate">{item.message}</td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={
                              item.status === "replied"
                                ? "bg-green-500/10 text-green-500 border-green-500/30 font-semibold"
                                : item.status === "ignored"
                                ? "bg-zinc-500/10 text-zinc-500 border-zinc-500/30"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold animate-pulse"
                            }
                          >
                            {item.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">{formatDate(item.createdAt)}</td>
                        <td className="p-4 text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInquiry(item);
                              setReplyText("");
                            }}
                          >
                            View & Reply
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8"
                            onClick={() => handleDeleteInquiry(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail & Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="border-b border-border/60 p-5 flex justify-between items-center bg-muted/20">
              <div>
                <h3 className="text-lg font-bold text-foreground font-display">Contact Inquiry Details</h3>
                <p className="text-xs text-muted-foreground">ID: {selectedInquiry.id}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setSelectedInquiry(null)}
              >
                ✕
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/40 p-4 rounded-lg border">
                <div>
                  <span className="block text-xs font-mono uppercase text-muted-foreground">Sender Name</span>
                  <span className="font-semibold text-foreground">{selectedInquiry.name}</span>
                </div>
                <div>
                  <span className="block text-xs font-mono uppercase text-muted-foreground">Sender Email</span>
                  <span className="font-semibold text-foreground">{selectedInquiry.email}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs font-mono uppercase text-muted-foreground">Subject</span>
                  <span className="font-semibold text-foreground">{selectedInquiry.subject}</span>
                </div>
                <div>
                  <span className="block text-xs font-mono uppercase text-muted-foreground">Submitted Date</span>
                  <span className="text-foreground">{formatDate(selectedInquiry.createdAt)}</span>
                </div>
                <div>
                  <span className="block text-xs font-mono uppercase text-muted-foreground">Current Status</span>
                  <Badge
                    variant="outline"
                    className={
                      selectedInquiry.status === "replied"
                        ? "bg-green-500/10 text-green-500 border-green-500/30"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                    }
                  >
                    {selectedInquiry.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">User Message</span>
                <div className="bg-card border p-4 rounded-lg text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.message}
                </div>
              </div>

              {selectedInquiry.status === "replied" && (
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="block text-xs font-mono uppercase text-green-500 font-semibold">Sent Reply</span>
                    <span className="text-xs text-muted-foreground">
                      Sent on: {selectedInquiry.repliedAt ? formatDate(selectedInquiry.repliedAt) : ""}
                    </span>
                  </div>
                  <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-lg text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {selectedInquiry.replyMessage}
                  </div>
                </div>
              )}

              {selectedInquiry.status !== "replied" && (
                <div className="border-t pt-4 space-y-3">
                  <label htmlFor="replyText" className="block text-xs font-mono uppercase text-primary font-semibold">
                    Compose Email Reply
                  </label>
                  <textarea
                    id="replyText"
                    rows={6}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response to the user here. Clicking send will dispatch this message directly via the Resend API..."
                    className="w-full text-sm bg-card border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none placeholder-muted-foreground font-sans leading-relaxed"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedInquiry(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={!replyText.trim() || sendingReplyId !== null}
                      onClick={() => handleReplyInquiry(selectedInquiry.id)}
                      className="gap-2"
                    >
                      {sendingReplyId !== null ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "donations" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            {donationsLoading ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm">Loading donations history...</p>
              </div>
            ) : donations.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-3 opacity-40 text-amber-500" />
                <p className="text-base font-medium">No donation transactions found</p>
                <p className="text-xs mt-1">Completed Paystack payments or Kuda Bank transfer receipt reports will show here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/40 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      <th className="p-4 font-semibold">Donor Details</th>
                      <th className="p-4 font-semibold">Amount & Currency</th>
                      <th className="p-4 font-semibold">Payment Method</th>
                      <th className="p-4 font-semibold">Reference</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-sm">
                    {donations.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-medium text-foreground">
                          <div className="flex flex-col">
                            <span>{item.name || "Anonymous Donor"}</span>
                            <span className="text-xs text-muted-foreground">{item.email || "No Email"}</span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-foreground">
                          {item.currency === "NGN" ? "₦" : "$"}
                          {item.amount.toLocaleString()}
                        </td>
                        <td className="p-4 capitalize text-muted-foreground">
                          {item.paymentMethod.replace("_", " ")}
                        </td>
                        <td className="p-4 font-mono text-xs text-muted-foreground">{item.reference || "N/A"}</td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={
                              item.status === "success"
                                ? "bg-green-500/10 text-green-500 border-green-500/30 font-semibold"
                                : item.status === "failed"
                                ? "bg-red-500/10 text-red-500 border-red-500/30"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold animate-pulse"
                            }
                          >
                            {item.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">{formatDate(item.createdAt)}</td>
                        <td className="p-4 text-right space-x-2">
                          {item.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={approvingDonationId === item.id}
                              className="bg-green-600/10 text-green-500 border-green-500/30 hover:bg-green-600 hover:text-white"
                              onClick={() => handleApproveDonation(item.id)}
                            >
                              {approvingDonationId === item.id ? "Approving..." : "Approve"}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8"
                            onClick={() => handleDeleteDonation(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
