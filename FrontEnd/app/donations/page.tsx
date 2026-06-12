"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { DonationTable } from "@/components/dashboard/DonationTable";
import { useDonations } from "@/hooks/useDonations";

export default function DonationsPage() {
  const { donations, loading } = useDonations();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10">
            <Heart className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Donation Ledger
            </h1>
            <p className="text-slate-400 mt-1">
              Complete record of all donations and their verification status
            </p>
          </div>
        </div>
      </motion.div>

      <DonationTable donations={donations} loading={loading} />
    </div>
  );
}
