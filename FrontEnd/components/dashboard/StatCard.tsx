"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  loading?: boolean;
  format?: "currency" | "number" | "percentage";
  delay?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  loading = false,
  format = "number",
  delay = 0,
}: StatCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === "string") return val;
    switch (format) {
      case "currency":
        return formatCurrency(val);
      case "percentage":
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  if (loading) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
    >
      <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="pb-2 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-400">
              {title}
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatValue(value)}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center mt-2 gap-1">
              <span
                className={`text-xs font-medium ${
                  trend === "up"
                    ? "text-emerald-400"
                    : trend === "down"
                    ? "text-red-400"
                    : "text-slate-400"
                }`}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
