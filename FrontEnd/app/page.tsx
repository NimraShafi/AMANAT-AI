"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DonationChart } from "@/components/dashboard/DonationChart";
import { FundAllocationChart } from "@/components/dashboard/FundAllocationChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useDonations, useDonationStats, useDonationTrends, useFundAllocation } from "@/hooks/useDonations";
import { useReviewQueue } from "@/hooks/useReviewQueue";

export default function DashboardPage() {
  const { donations, loading: donationsLoading } = useDonations();
  const { stats, loading: statsLoading } = useDonationStats();
  const { trends, loading: trendsLoading } = useDonationTrends();
  const { allocation, loading: allocationLoading } = useFundAllocation();
  const { reviews, loading: reviewsLoading } = useReviewQueue();

  const pendingCount = reviews.filter((r) => r.status === "OPEN").length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-slate-400 mt-1">
          Real-time welfare management analytics
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Funds Collected"
          value={stats.totalFunds}
          icon={DollarSign}
          format="currency"
          loading={statsLoading}
          delay={0}
          trend="up"
          trendValue="12% vs last month"
        />
        <StatCard
          title="Verified Transactions"
          value={stats.totalVerified}
          icon={CheckCircle}
          format="number"
          loading={statsLoading}
          delay={1}
          trend="up"
          trendValue="8% vs last month"
        />
        <StatCard
          title="Pending Reviews"
          value={pendingCount}
          icon={AlertTriangle}
          format="number"
          loading={reviewsLoading}
          delay={2}
          trend="down"
          trendValue="3 new today"
        />
        <StatCard
          title="Total Donors"
          value={stats.totalDonors}
          icon={Users}
          format="number"
          loading={statsLoading}
          delay={3}
          trend="up"
          trendValue="15% vs last month"
        />
      </div>

      {/* Verification Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Verification Rate</h3>
              <p className="text-sm text-slate-400">
                Auto-verification success percentage
              </p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <span className="text-2xl font-bold text-emerald-400">
                {stats.verificationRate}%
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.verificationRate}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DonationChart data={trends} loading={trendsLoading} />
        </div>
        <div>
          <FundAllocationChart data={allocation} loading={allocationLoading} />
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity donations={donations} loading={donationsLoading} />
    </div>
  );
}
