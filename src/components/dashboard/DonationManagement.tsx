import { useState, useEffect, useCallback } from "react";
import DonationAnalytics from "./DonationAnalytics";
import {
  Heart,
  Search,
  Trash2,
  Calendar,
  Loader2,
  Filter,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Copy,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/api";

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

export function DonationManagement() {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"transactions" | "analytics">("transactions");

  const { toast } = useToast();
  const apiGatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const fetchDonations = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, [apiGatewayUrl, toast]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleApproveDonation = async (id: string) => {
    setApprovingId(id);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/donations/${id}/approve`, {
        method: "POST"
      });

      if (res.ok) {
        const result = await res.json();
        toast({
          title: "Donation Verified",
          description: "Transaction status has been successfully updated to SUCCESS.",
        });
        setDonations((prev) =>
          prev.map((item) => (item.id === id ? result.data : item))
        );
      } else {
        throw new Error("Failed to approve transaction.");
      }
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error?.message || String(error),
        variant: "destructive",
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleDeleteDonation = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this donation record?")) return;
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/donations/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setDonations((prev) => prev.filter((item) => item.id !== id));
        toast({
          title: "Record Deleted",
          description: "Donation transaction record removed successfully.",
        });
      } else {
        throw new Error("Failed to remove record.");
      }
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error?.message || String(error),
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Metrics Calculations (normalize rate $1 = ₦1,380)
  const stats = donations.reduce(
    (acc, curr) => {
      if (curr.status === "success") {
        acc.donorCount += 1;
        if (curr.currency === "NGN") {
          acc.totalNgn += curr.amount;
          acc.totalUsd += curr.amount / 1380;
        } else {
          acc.totalUsd += curr.amount;
          acc.totalNgn += curr.amount * 1380;
        }
      } else if (curr.status === "pending") {
        acc.pendingCount += 1;
      }
      return acc;
    },
    { totalUsd: 0, totalNgn: 0, donorCount: 0, pendingCount: 0 }
  );

  // Filters application
  const filteredDonations = donations.filter((item) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (item.name || "").toLowerCase().includes(searchLower) ||
      (item.email || "").toLowerCase().includes(searchLower) ||
      (item.reference || "").toLowerCase().includes(searchLower);

    // Status filter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    // Method filter
    const matchesMethod =
      methodFilter === "all" ||
      (methodFilter === "paystack" && item.paymentMethod === "paystack") ||
      (methodFilter === "nowpayments" && item.paymentMethod === "nowpayments") ||
      (methodFilter === "bank_transfer" && item.paymentMethod.startsWith("bank_transfer"));

    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-display">Donations Campaign Manager</h2>
          <p className="text-muted-foreground">Track operating expenses contributions, card checkouts, and verify bank transfers.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-500 bg-amber-500/10">
            <Heart className="h-3 w-3 fill-amber-500 text-amber-500" />
            {stats.donorCount} Verified Contributors
          </Badge>
        </div>
      </div>
      <div className="flex border-b border-border/60">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] ${activeTab === "transactions"
            ? "border-amber-500 text-amber-500"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Transactions Log
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] ${activeTab === "analytics"
            ? "border-amber-500 text-amber-500"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Analytics Dashboard
        </button>
      </div>

      {activeTab === "analytics" ? (
        <DonationAnalytics />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border/50">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase">Total Raised NGN</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₦{stats.totalNgn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase">Total Raised USD</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${stats.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <DollarSign className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase">Campaign Progress</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalUsd > 0 ? Math.min(100, Math.round((stats.totalUsd / 7680) * 1000) / 10) : 0}%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase">Active Donors</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.donorCount}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/60">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search donor name, email or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background h-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 bg-background border border-border/65 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-background border border-border/65 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer"
                >
                  <option value="all">All Methods</option>
                  <option value="paystack">Paystack Card</option>
                  <option value="nowpayments">Crypto (NOWPayments)</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              <p className="text-xs text-muted-foreground">Loading contributions ledger...</p>
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="text-center py-20 bg-muted/10 rounded-xl border border-border/40">
              <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-semibold">No Donations Found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filters or query term.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="p-3.5">Donor</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Reference</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredDonations.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/10">
                      <td className="p-3.5">
                        <div className="font-semibold text-foreground">{item.name || "Anonymous Sender"}</div>
                        <div className="text-[10px] text-muted-foreground">{item.email || "No Email"}</div>
                      </td>
                      <td className="p-3.5 font-bold font-display text-foreground">
                        {item.currency} {item.amount.toLocaleString()}
                      </td>
                      <td className="p-3.5 capitalize text-muted-foreground">
                        {item.paymentMethod === "nowpayments" ? "Crypto (NOWPayments)" : item.paymentMethod.replace("_", " ")}
                      </td>
                      <td className="p-3.5 font-mono text-[10px] flex items-center gap-1.5">
                        <span className="truncate max-w-[120px] block">{item.reference || "N/A"}</span>
                        {item.reference && (
                          <button
                            onClick={() => copyToClipboard(item.reference!, "Reference")}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        )}
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={
                            item.status === "success"
                              ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                              : item.status === "pending"
                                ? "border-amber-500/30 text-amber-500 bg-amber-500/10"
                                : "border-red-500/30 text-red-500 bg-red-500/10"
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {item.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveDonation(item.id)}
                            disabled={approvingId === item.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-7 text-[10px] px-2.5"
                          >
                            {approvingId === item.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Approve"
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDonation(item.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
        </>
      )}
    </div>
  );
}
