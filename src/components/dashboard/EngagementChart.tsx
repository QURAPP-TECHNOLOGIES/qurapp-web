import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", sessions: 320, lessons: 180, quizzes: 95 },
  { day: "Tue", sessions: 450, lessons: 240, quizzes: 130 },
  { day: "Wed", sessions: 380, lessons: 200, quizzes: 110 },
  { day: "Thu", sessions: 520, lessons: 290, quizzes: 160 },
  { day: "Fri", sessions: 610, lessons: 340, quizzes: 190 },
  { day: "Sat", sessions: 780, lessons: 420, quizzes: 230 },
  { day: "Sun", sessions: 850, lessons: 480, quizzes: 260 },
];

export function EngagementChart() {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Weekly Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
              />
              <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Sessions" />
              <Bar dataKey="lessons" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} name="Lessons" />
              <Bar dataKey="quizzes" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Quizzes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
