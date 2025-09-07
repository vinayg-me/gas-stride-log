// StatCard Component - CRED-inspired card for statistics

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "premium" | "glass";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const cardVariants = {
    default: "glass-card border-border/20",
    premium: "glass-card border-primary/20 glow-primary",
    glass: "glass border-glass-border/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn("group cursor-default", className)}
    >
      <Card className={cn(
        "p-6 transition-all duration-300 hover:shadow-glow",
        cardVariants[variant]
      )}>
        <CardContent className="p-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {value}
                </span>
                {trend && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      trend.isPositive 
                        ? "text-accent bg-accent/10" 
                        : "text-destructive bg-destructive/10"
                    )}
                  >
                    {trend.isPositive ? "+" : ""}{trend.value}%
                  </motion.span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {Icon && (
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20"
              >
                <Icon className="w-5 h-5" />
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}