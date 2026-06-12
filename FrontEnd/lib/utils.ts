import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(d);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Verified': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    'Pending': 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    'Rejected': 'bg-red-500/20 text-red-400 border-red-500/50',
    'new': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    'waiting_purpose': 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    'completed': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    'OPEN': 'bg-red-500/20 text-red-400 border-red-500/50',
    'RESOLVED': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  };
  return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/50';
}

export function getStatusGlow(status: string): string {
  const glows: Record<string, string> = {
    'Verified': 'animate-pulse-glow',
    'completed': 'animate-pulse-glow',
    'RESOLVED': 'animate-pulse-glow',
  };
  return glows[status] || '';
}
