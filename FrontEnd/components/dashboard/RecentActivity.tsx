"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Donation } from "@/types/database";
import { formatRelativeDate, formatCurrency } from "@/lib/utils";

interface RecentActivityProps {
  donations: Donation[];
  loading?: boolean;
}

export function RecentActivity({ donations, loading = false }: RecentActivityProps) {
  if (loading) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Sirf aakhri 5 transactions dikhane ke liye
  const recent = donations.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recent.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-4">No recent activity</p>
          ) : (
            recent.map((donation, index) => (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-3 group"
              >
                {/* Icon Section */}
                <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                </div>

                {/* Transaction Ref Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-mono font-medium text-white truncate">
                      #{donation.transaction_ref}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {formatRelativeDate(donation.created_at)}
                  </p>
                </div>

                {/* Amount & Purpose */}
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">
                    +{formatCurrency(donation.amount)}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                    {donation.purpose || "Verified"}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}