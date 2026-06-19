"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Heart,
  AlertTriangle,
  Building2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/donations", label: "Donations", icon: Heart },
  { href: "/review-queue", label: "Review Queue", icon: AlertTriangle },
  { href: "/channel-statements", label: "Channel Statements", icon: Building2 },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900 border border-white/10 text-white shadow-xl"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ 
          width: collapsed ? 85 : 280,
          // Mobile par translate logic, desktop par hamesha 0
          x: typeof window !== 'undefined' && window.innerWidth < 1024 ? (mobileOpen ? 0 : -280) : 0 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-slate-950 border-r border-white/10 flex flex-col",
          "lg:translate-x-0 transition-colors duration-300",
          !mobileOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header / Logo */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Heart className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="whitespace-nowrap"
              >
                <h1 className="text-lg font-bold text-white tracking-tight">Amanat AI</h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Admin Portal</p>
              </motion.div>
            )}
          </div>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-indigo-500/10 text-indigo-400" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon size={20} className={cn(isActive && "text-indigo-400")} />
                {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                
                {isActive && (
                  <motion.div 
                    layoutId="pill"
                    className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full" 
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Status */}
        <div className="p-4 border-t border-white/5">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-white/5",
            collapsed && "justify-center"
          )}>
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-white uppercase">System Live</p>
                <p className="text-[10px] text-slate-500 truncate">Monitoring Transactions</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}