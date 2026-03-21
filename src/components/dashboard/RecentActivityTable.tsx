import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const activities = [
  { id: 1, user: "Ahmed Hassan", action: "Completed Surah Al-Baqarah", time: "2 min ago", type: "completion" },
  { id: 2, user: "Fatima Ali", action: "Started AI Mentor session", time: "5 min ago", type: "session" },
  { id: 3, user: "Omar Khan", action: "Achieved 30-day streak", time: "12 min ago", type: "achievement" },
  { id: 4, user: "Aisha Rahman", action: "Joined QurApp Premium", time: "25 min ago", type: "subscription" },
  { id: 5, user: "Yusuf Ibrahim", action: "Completed Tajweed course", time: "1 hour ago", type: "completion" },
  { id: 6, user: "Maryam Saeed", action: "Submitted feedback report", time: "2 hours ago", type: "feedback" },
];

const typeStyles = {
  completion: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  session: "bg-primary/20 text-primary border-primary/30",
  achievement: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  subscription: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  feedback: "bg-blue-500/20 text-blue-500 border-blue-500/30",
};

export function RecentActivityTable() {
  return (
    <Card className="bg-card border-border/50 col-span-2">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {activity.user.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{activity.user}</p>
                  <p className="text-xs text-muted-foreground">{activity.action}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={typeStyles[activity.type as keyof typeof typeStyles]}>
                  {activity.type}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
