"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Search, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBankStatements } from "@/hooks/useBankStatements";
import { BankStatement } from "@/types/database";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

export default function BankStatementsPage() {
  const { statements, loading } = useBankStatements();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof BankStatement>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filtered = statements.filter(
    (s) =>
      s.transaction_ref.toLowerCase().includes(search.toLowerCase()) ||
      s.bank_name.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof BankStatement) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const statusCounts = statements.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Building2 className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Channel Statements
            </h1>
            <p className="text-slate-400 mt-1">
              Imported channel transaction records and their processing status
            </p>
          </div>
        </div>
      </motion.div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {["new", "waiting_purpose", "completed"].map((status) => (
          <Card key={status} className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 capitalize">{status.replace("_", " ")}</p>
                  <p className="text-2xl font-bold text-white">
                    {statusCounts[status] || 0}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={getStatusColor(status)}
                >
                  {status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">
              Transaction Records
            </CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by reference or channel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-white/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead
                      className="cursor-pointer text-slate-400 hover:text-white"
                      onClick={() => handleSort("transaction_ref")}
                    >
                      <div className="flex items-center gap-1">
                        Reference ID
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-slate-400 hover:text-white"
                      onClick={() => handleSort("bank_name")}
                    >
                      <div className="flex items-center gap-1">
                        Payment Channel
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-slate-400 hover:text-white"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center gap-1">
                        Amount
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-slate-400 hover:text-white"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-slate-400 hover:text-white"
                      onClick={() => handleSort("created_at")}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((statement) => (
                    <TableRow
                      key={statement.id}
                      className="border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <TableCell className="font-mono text-sm text-white">
                        {statement.transaction_ref}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {statement.bank_name}
                      </TableCell>
                      <TableCell className="text-emerald-400 font-semibold">
                        {formatCurrency(statement.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(statement.status)} capitalize`}
                        >
                          {statement.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {formatDate(statement.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
