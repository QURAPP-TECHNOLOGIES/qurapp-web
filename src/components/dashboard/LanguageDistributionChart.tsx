import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
  { name: "Arabic", value: 35, color: "hsl(var(--primary))" },
  { name: "English", value: 25, color: "hsl(142, 76%, 36%)" },
  { name: "Indonesian", value: 15, color: "hsl(38, 92%, 50%)" },
  { name: "Urdu", value: 12, color: "hsl(280, 65%, 60%)" },
  { name: "Turkish", value: 8, color: "hsl(200, 80%, 50%)" },
  { name: "Others", value: 5, color: "hsl(var(--muted-foreground))" },
];

export function LanguageDistributionChart() {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Language Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: number) => [`${value}%`, ""]}
              />
              <Legend 
                formatter={(value) => <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
