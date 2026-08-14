import { useState, useEffect, useCallback } from "react";
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
  Copy
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

      {/* Metrics Row */}
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
              <p className="text-xs text-muted-foreground font-medium uppercase">Pending Verifications</p>
              <p className="text-2xl font-bold text-foreground">{stats.pendingCount}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.pendingCount > 0 ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 'bg-muted text-muted-foreground'}`}>
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase">Goal Completion</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalUsd > 0 ? Math.min(100, Math.round((stats.totalUsd / 7680) * 1000) / 10) : 0}%
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters Controls */}
      <div className="flex flex-col md:flex-row gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Donor, Email, or Reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-background"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Method filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-10 px-3.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Methods</option>
              <option value="paystack">Paystack</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setMethodFilter("all"); }} className="h-10">
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Table grid log */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm">Loading donations catalog...</p>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-3 opacity-40 text-amber-500" />
            <p className="text-base font-medium">No donation records found</p>
            <p className="text-xs mt-1">Try resetting filters or checking search keywords.</p>
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
                {filteredDonations.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium text-foreground">
                      <div className="flex flex-col">
                        <span>{item.name || "Anonymous Donor"}</span>
                        <span className="text-xs text-muted-foreground">{item.email || "No Email"}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      {item.currency === "NGN" ? "₦" : "$"}
                      {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 capitalize text-muted-foreground text-xs">
                      {item.paymentMethod.replace("_", " ")}
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[120px]">{item.reference || "N/A"}</span>
                        {item.reference && (
                          <button 
                            type="button"
                            onClick={() => copyToClipboard(item.reference!, "Reference")}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
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
                          disabled={approvingId === item.id}
                          className="bg-green-600/10 text-green-500 border-green-500/30 hover:bg-green-600 hover:text-white"
                          onClick={() => handleApproveDonation(item.id)}
                        >
                          {approvingId === item.id ? "Approving..." : "Approve"}
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
  );
}
