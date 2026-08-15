import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Users,
  DollarSign,
  PieChart as PieIcon,
  Percent,
  Calendar,
  Globe,
  Loader2,
  AlertCircle,
  Heart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchWithAuth } from "@/lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";

type AnalyticsData = {
  period: string;
  region: string;
  summary: {
    totalRaisedNormalized: number;
    totalRaisedNgn: number;
    totalRaisedUsd: number;
    donorCount: number;
    conversionRate: number;
    averageContribution: number;
    medianContribution: number;
    repeatDonorRate: number;
    paymentSuccessRate: number;
    mrrCommitted: number;
  };
  split: {
    oneTime: { count: number; value: number };
    monthly: { count: number; value: number };
  };
  rails: {
    ngnPaystack: { count: number; amount: number };
    usdPaystack: { count: number; amount: number };
    cryptoNowpayments: { count: number; amount: number };
    bankTransfer: { count: number; amount: number };
  };
  funnel: {
    pageViews: number;
    checkoutStarts: number;
    successes: number;
  };
  sources: Record<string, { views: number; donations: number; raised: number }>;
  failures: Record<string, number>;
  chart: Record<string, number>;
};

export default function DonationAnalytics() {
  const [period, setPeriod] = useState<string>("30");
  const [region, setRegion] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);

  const apiGatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth(
        `${apiGatewayUrl}/api/v1/donations/analytics?period=${period}&region=${region}`
      );
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || "Failed to load dashboard data.");
      }
    } catch (e: any) {
      console.error("Failed to load donation analytics:", e);
      setError("An error occurred while connecting to the analytics server.");
    } finally {
      setLoading(false);
    }
  }, [apiGatewayUrl, period, region]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-xs text-muted-foreground">Compiling campaign metadata...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-destructive/5 rounded-xl border border-destructive/20 max-w-lg mx-auto p-6">
        <AlertCircle className="w-8 h-8 text-destructive animate-bounce" />
        <p className="text-sm font-semibold text-foreground">Analysis Retrieval Failed</p>
        <p className="text-xs text-muted-foreground text-center">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-2 text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors"
        >
          Try Reloading
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, split, rails, funnel, sources, failures, chart } = data;

  // Transform daily raised map into Recharts format
  const chartData = Object.keys(chart).map((date) => ({
    date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    amount: Math.round(chart[date])
  }));

  // Transform funnel into Recharts format
  const funnelData = [
    { name: "Views", value: funnel.pageViews, fill: "#3b82f6" },
    { name: "Starts", value: funnel.checkoutStarts, fill: "#eab308" },
    { name: "Success", value: funnel.successes, fill: "#10b981" }
  ];

  // Transform Rails split into Recharts format
  const railsData = [
    { name: "Paystack (NGN)", value: rails.ngnPaystack.amount / 1380, count: rails.ngnPaystack.count, color: "#10b981" },
    { name: "Paystack (USD)", value: rails.usdPaystack.amount, count: rails.usdPaystack.count, color: "#059669" },
    { name: "NOWPayments (Crypto)", value: rails.cryptoNowpayments.amount, count: rails.cryptoNowpayments.count, color: "#8b5cf6" },
    { name: "Bank Transfers", value: rails.bankTransfer.amount / 1380, count: rails.bankTransfer.count, color: "#3b82f6" }
  ].filter(item => item.value > 0);

  // Transform Tiers/Frequencies split into Recharts format
  const frequencyData = [
    { name: "One-Time", value: split.oneTime.value, count: split.oneTime.count, color: "#f59e0b" },
    { name: "Monthly support", value: split.monthly.value, count: split.monthly.count, color: "#10b981" }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Filters Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Donation Analytics
          </h2>
          <p className="text-xs text-muted-foreground">Privacy-first purpose-limited campaign tracking</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Period Filter */}
          <div className="flex items-center gap-1.5 bg-background border border-border/60 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-foreground"
            >
              <option value="today">Today</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="year">Past Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-1.5 bg-background border border-border/60 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-foreground"
            >
              <option value="all">All Regions</option>
              <option value="nigeria">Nigeria (NGN)</option>
              <option value="international">International (USD)</option>
            </select>
          </div>

          {loading && (
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin ml-2" />
          )}
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Raised */}
        <Card className="bg-gradient-to-br from-card to-amber-500/5 border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
              <span>Total Contributions</span>
              <DollarSign className="w-4 h-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-foreground">
              ${Math.round(summary.totalRaisedNormalized).toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
              <p>Raw NGN: ₦{Math.round(summary.totalRaisedNgn).toLocaleString()}</p>
              <p>Raw USD: ${Math.round(summary.totalRaisedUsd).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Committed MRR */}
        <Card className="bg-gradient-to-br from-card to-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
              <span>Monthly Supporter MRR</span>
              <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-foreground">
              ${Math.round(summary.mrrCommitted).toLocaleString()}/mo
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Active monthly pledges from the community
            </p>
          </CardContent>
        </Card>

        {/* Unique Donors */}
        <Card className="bg-gradient-to-br from-card to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
              <span>Unique Supporters</span>
              <Users className="w-4 h-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-foreground">
              {summary.donorCount.toLocaleString()}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Repeat donor rate: <span className="font-semibold text-blue-500">{summary.repeatDonorRate.toFixed(1)}%</span>
            </p>
          </CardContent>
        </Card>

        {/* Success / Conversions */}
        <Card className="bg-gradient-to-br from-card to-violet-500/5 border-violet-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
              <span>Funnel Conversion</span>
              <Percent className="w-4 h-4 text-violet-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-foreground">
              {summary.conversionRate.toFixed(1)}%
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Payment success rate: <span className="font-semibold text-emerald-500">{summary.paymentSuccessRate.toFixed(1)}%</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart: Revenue Trends */}
        <Card className="lg:col-span-2 border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" /> Revenue Growth Over Time
            </CardTitle>
            <CardDescription className="text-xs">
              Daily successful contributions normalized to USD ($1 = ₦1,380)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-4">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        fontSize: "11px"
                      }}
                      labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                      formatter={(value: any) => [`$${value.toLocaleString()}`, "Amount Raised"]}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No transaction activity logged in the selected period.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Funnel Drop-off Bar Chart */}
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Percent className="w-4 h-4 text-blue-500" /> Conversion Funnel
            </CardTitle>
            <CardDescription className="text-xs">
              Page Views vs Checkout Starts vs Successful Payments
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-between">
            <div className="h-72 w-full pt-4">
              {funnel.pageViews > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={60} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        fontSize: "11px"
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No funnel visits recorded in the selected period.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Splits and Attribution Sources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donuts: payment rails and frequencies */}
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-violet-500" /> Splits & Channels
            </CardTitle>
            <CardDescription className="text-xs">
              Payment rails share and subscription choices in USD value
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment method donut */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment Channels</p>
              <div className="h-32 flex items-center justify-between">
                {railsData.length > 0 ? (
                  <>
                    <div className="h-32 w-1/2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={railsData}
                            cx="50%"
                            cy="50%"
                            innerRadius={28}
                            outerRadius={45}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {railsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 text-left space-y-1.5 pl-2">
                      {railsData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-1.5 text-[10px]">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                          <span className="truncate text-muted-foreground">{entry.name} ({entry.count})</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground w-full text-center py-10">No channel data available.</p>
                )}
              </div>
            </div>

            {/* Frequency donut */}
            <div className="space-y-2 border-t border-border/50 pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Commitment Plan Tiers</p>
              <div className="h-32 flex items-center justify-between">
                {frequencyData.length > 0 ? (
                  <>
                    <div className="h-32 w-1/2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={frequencyData}
                            cx="50%"
                            cy="50%"
                            innerRadius={28}
                            outerRadius={45}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {frequencyData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 text-left space-y-1.5 pl-2">
                      {frequencyData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-1.5 text-[10px]">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                          <span className="truncate text-muted-foreground">{entry.name} ({entry.count})</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground w-full text-center py-10">No commitment data available.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attribution table */}
        <Card className="lg:col-span-2 border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" /> UTM Acquisition Campaigns & Sources
            </CardTitle>
            <CardDescription className="text-xs">
              Attributed campaign links performance mapping sessions to raised volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-2 font-semibold">Attribution Source</th>
                    <th className="py-2 font-semibold text-center">Sessions</th>
                    <th className="py-2 font-semibold text-center">Donations</th>
                    <th className="py-2 font-semibold text-center">Conversion</th>
                    <th className="py-2 font-semibold text-right">USD Raised</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {Object.keys(sources).length > 0 ? (
                    Object.keys(sources).map((src) => {
                      const item = sources[src];
                      const conv = item.views > 0 ? (item.donations / item.views) * 100 : 0;
                      return (
                        <tr key={src} className="hover:bg-muted/10">
                          <td className="py-2.5 font-medium text-foreground max-w-[150px] truncate">{src}</td>
                          <td className="py-2.5 text-center text-muted-foreground">{item.views.toLocaleString()}</td>
                          <td className="py-2.5 text-center text-muted-foreground">{item.donations.toLocaleString()}</td>
                          <td className="py-2.5 text-center font-semibold text-amber-500">{conv.toFixed(1)}%</td>
                          <td className="py-2.5 text-right font-bold text-foreground">${Math.round(item.raised).toLocaleString()}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No UTM campaigns parsed in visitor links yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Declines and issues */}
            <div className="mt-6 border-t border-border/50 pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">Decline Reason Logs</p>
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(failures).length > 0 ? (
                  Object.keys(failures).map((reason) => (
                    <div key={reason} className="bg-muted/20 p-2.5 rounded-lg border border-border/40 flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{reason}</span>
                      <span className="font-bold text-destructive">{failures[reason]} occurrence{failures[reason] > 1 ? "s" : ""}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-muted-foreground col-span-2">No payment transaction failures or manual transfer rejections logged.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
