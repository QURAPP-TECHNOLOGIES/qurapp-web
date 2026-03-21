import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Star, TrendingUp } from "lucide-react";

const topContent = [
  { id: 1, title: "Surah Al-Fatiha", views: 45200, completion: 92, trend: "+12%" },
  { id: 2, title: "Tajweed Basics", views: 38400, completion: 78, trend: "+8%" },
  { id: 3, title: "Surah Al-Mulk", views: 32100, completion: 85, trend: "+15%" },
  { id: 4, title: "Arabic Alphabet", views: 28900, completion: 95, trend: "+5%" },
  { id: 5, title: "Memorization Tips", views: 24500, completion: 68, trend: "+22%" },
];

export function TopContentTable() {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          Top Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topContent.map((content, index) => (
            <div key={content.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-5">#{index + 1}</span>
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{content.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-emerald-500">{content.trend}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={content.completion} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground w-16 text-right">
                  {content.views.toLocaleString()} views
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
