import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", users: 4000, active: 2400 },
  { month: "Feb", users: 5200, active: 3100 },
  { month: "Mar", users: 6800, active: 4200 },
  { month: "Apr", users: 8500, active: 5400 },
  { month: "May", users: 11200, active: 7200 },
  { month: "Jun", users: 14500, active: 9800 },
  { month: "Jul", users: 18200, active: 12400 },
];

export function UserGrowthChart() {
  return (
    <Card className="bg-card border-border/50 col-span-2">
      <CardHeader>
        <CardTitle className="text-foreground">User Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorUsers)"
                strokeWidth={2}
                name="Total Users"
              />
              <Area
                type="monotone"
                dataKey="active"
                stroke="hsl(142, 76%, 36%)"
                fillOpacity={1}
                fill="url(#colorActive)"
                strokeWidth={2}
                name="Active Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
