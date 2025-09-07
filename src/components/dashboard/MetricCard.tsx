import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "success" | "warning" | "danger";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  variant = "default",
  trend 
}: MetricCardProps) {
  const variantStyles = {
    default: "border-l-4 border-l-primary bg-gradient-to-br from-card to-muted/20",
    success: "border-l-4 border-l-success bg-gradient-to-br from-success/5 to-success/10",
    warning: "border-l-4 border-l-warning bg-gradient-to-br from-warning/5 to-warning/10",
    danger: "border-l-4 border-l-destructive bg-gradient-to-br from-destructive/5 to-destructive/10",
  };

  const iconStyles = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
  };

  return (
    <Card className={cn("shadow-card-professional hover:shadow-floating transition-all duration-300", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", iconStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={cn(
            "text-xs mt-2 flex items-center gap-1",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            <span>{trend.isPositive ? "↗" : "↘"}</span>
            {Math.abs(trend.value)}% ce mois
          </div>
        )}
      </CardContent>
    </Card>
  );
}