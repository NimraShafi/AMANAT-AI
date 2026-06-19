"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Eye, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Donation } from "@/types/database";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DonationTableProps {
  donations: Donation[];
  loading?: boolean;
}

export function DonationTable({ donations, loading = false }: DonationTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Donation>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const itemsPerPage = 10;

  const filtered = donations.filter(
    (d) =>
      (d.transaction_ref || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.purpose || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.bank_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.sender_number || "").toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortField] || "";
    const bVal = b[sortField] || "";
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const paginated = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  const handleSort = (field: keyof Donation) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setPage(1);
  };

  if (loading) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold text-white">
            Verified Donation Ledger
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search reference or purpose..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead
                    className="cursor-pointer text-slate-300 hover:text-white font-bold"
                    onClick={() => handleSort("transaction_ref")}
                  >
                    Reference ID {sortField === "transaction_ref" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-slate-300 hover:text-white font-bold"
                    onClick={() => handleSort("amount")}
                  >
                    Amount {sortField === "amount" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="text-slate-300 font-bold">Payment Channel</TableHead>
                  <TableHead className="text-slate-300 font-bold">Allocated Purpose</TableHead>
                  <TableHead
                    className="cursor-pointer text-slate-300 hover:text-white font-bold"
                    onClick={() => handleSort("status")}
                  >
                    Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-slate-300 hover:text-white font-bold text-right"
                    onClick={() => handleSort("created_at")}
                  >
                    Recorded Date {sortField === "created_at" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((donation) => (
                  <TableRow
                    key={donation.id}
                    className="border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-indigo-300">
                      #{donation.transaction_ref}
                    </TableCell>
                    <TableCell className="text-emerald-400 font-bold">
                      {formatCurrency(donation.amount)}
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">
                      {donation.bank_name || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/5 text-indigo-200">
                        {donation.purpose || "Unassigned"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`capitalize font-bold ${
                          donation.status === "Verified" 
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {donation.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs text-right">
                      {formatDate(donation.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-slate-500 italic">
              Showing {paginated.length} of {filtered.length} entries
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-xs font-medium text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="text-slate-400 hover:text-white disabled:opacity-30"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}