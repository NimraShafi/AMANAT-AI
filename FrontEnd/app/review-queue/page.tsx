"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviewQueue } from "@/hooks/useReviewQueue";
import { ReviewQueue } from "@/types/database";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function ReviewQueuePage() {
  const { reviews, loading, resolveReview } = useReviewQueue();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "OPEN" | "RESOLVED">("all");

  const filtered = reviews.filter((r) => {
    const matchesSearch =
      r.issue.toLowerCase().includes(search.toLowerCase()) ||
      r.donation?.sender_number?.toLowerCase().includes(search.toLowerCase()) ||
      r.donation?.transaction_ref?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  const openCount = reviews.filter((r) => r.status === "OPEN").length;
  const resolvedCount = reviews.filter((r) => r.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Review Queue
            </h1>
            <p className="text-slate-400 mt-1">
              Transactions requiring manual verification review
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Issues</p>
                <p className="text-2xl font-bold text-white">{reviews.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Open</p>
                <p className="text-2xl font-bold text-red-400">{openCount}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Resolved</p>
                <p className="text-2xl font-bold text-emerald-400">{resolvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by issue, donor, or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "OPEN", "RESOLVED"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
              }
            >
              {f === "all" ? "All" : f}
            </Button>
          ))}
        </div>
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white">All Clear!</h3>
              <p className="text-slate-400 mt-1">
                No issues found matching your criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          review.status === "OPEN"
                            ? "bg-red-500/20"
                            : "bg-emerald-500/20"
                        }`}
                      >
                        {review.status === "OPEN" ? (
                          <AlertTriangle className="h-6 w-6 text-red-400" />
                        ) : (
                          <CheckCircle className="h-6 w-6 text-emerald-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Issue #{review.id.toString().slice(0, 8)}
                          </h3>
                          <p className="text-sm text-slate-400 mt-1">
                            {review.donation?.sender_number && (
                              <>
                                Donor: <span className="text-white">{review.donation.sender_number}</span>
                                {review.donation.amount && (
                                  <span className="ml-2 text-emerald-400">
                                    ({formatCurrency(review.donation.amount)})
                                  </span>
                                )}
                              </>
                            )}
                          </p>
                        </div>
                        <Badge
                          variant={review.status === "OPEN" ? "open" : "resolved"}
                          className="w-fit"
                        >
                          {review.status}
                        </Badge>
                      </div>

                      <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/5">
                        <p className="text-sm text-slate-300">
                          <span className="text-slate-500 font-medium">Issue: </span>
                          {review.issue}
                        </p>
                        {review.donation?.transaction_ref && (
                          <p className="text-sm text-slate-400 mt-1">
                            <span className="text-slate-500 font-medium">Ref: </span>
                            {review.donation.transaction_ref}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <p className="text-xs text-slate-500">
                          Created: {formatDate(review.created_at)}
                          {review.resolved_at && (
                            <span className="ml-2">
                              | Resolved: {formatDate(review.resolved_at)}
                            </span>
                          )}
                        </p>
                        {review.status === "OPEN" && (
                          <Button
                            size="sm"
                            onClick={() => resolveReview(review.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
