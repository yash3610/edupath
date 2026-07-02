import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Clock3, IndianRupee, Star, TrendingUp, UserRoundCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { apiRequest } from "@/services/api";
import { MetricCard, PageLoader, moneyInr } from "./LumaDynamicUtils";

export default function CourseAnalyticsPage() {
  const { courseId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    apiRequest(`/api/instructor/courses/${courseId}/analytics`)
      .then((result) => setData(result.data || result))
      .catch((error) => toast.error(error.message || "Unable to load course analytics"));
  }, [courseId]);

  if (!data) return <PageLoader label="Loading course analytics" />;

  const cards = [
    { label: "Total students", value: data.totalStudents || 0, icon: Users },
    { label: "Active students", value: data.activeStudents || 0, icon: UserRoundCheck },
    { label: "Completion rate", value: `${Math.round(data.completionRate || 0)}%`, icon: TrendingUp },
    { label: "Average watch time", value: `${Math.round((data.averageWatchTimeSeconds || 0) / 60)}m`, icon: Clock3 },
    { label: "Revenue", value: moneyInr(data.revenue), icon: IndianRupee },
    { label: "Course rating", value: data.rating || "New", icon: Star },
  ];

  return (
    <div>
      <LmsPageHeader
        eyebrow="Course Analytics"
        title="Performance overview"
        description="Live enrollment, completion, engagement, revenue, and rating data for this course."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => <MetricCard key={card.label} {...card} />)}
      </div>
    </div>
  );
}
