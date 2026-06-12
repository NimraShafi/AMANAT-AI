"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Donation, DonationTrend, FundAllocation } from '@/types/database';

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();

    // Realtime subscription
    const subscription = supabase
      .channel('donations_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'donations' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDonations((prev) => [payload.new as Donation, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setDonations((prev) =>
              prev.map((d) => (d.id === payload.new.id ? (payload.new as Donation) : d))
            );
          } else if (payload.eventType === 'DELETE') {
            setDonations((prev) => prev.filter((d) => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchDonations]);

  return { donations, loading, error, refetch: fetchDonations };
}

export function useDonationStats() {
  const [stats, setStats] = useState({
    totalFunds: 0,
    totalVerified: 0,
    totalDonors: 0,
    verificationRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: allDonations } = await supabase.from('donations').select('*');
        const { data: verifiedDonations } = await supabase
          .from('donations')
          .select('*')
          .eq('status', 'Verified');

        const totalFunds = allDonations?.reduce((sum, d) => sum + d.amount, 0) || 0;
        const totalVerified = verifiedDonations?.length || 0;
        const totalDonors = new Set(allDonations?.map((d) => d.sender_number)).size || 0;
        const verificationRate = allDonations?.length
          ? (totalVerified / allDonations.length) * 100
          : 0;

        setStats({
          totalFunds,
          totalVerified,
          totalDonors,
          verificationRate: Math.round(verificationRate * 100) / 100,
        });
      } catch (err) {
        console.error('Stats error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    const subscription = supabase
      .channel('donations_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, fetchStats)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { stats, loading };
}

export function useDonationTrends() {
  const [trends, setTrends] = useState<DonationTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data } = await supabase
          .from('donations')
          .select('*')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        // Group by date
        const grouped = (data || []).reduce((acc: Record<string, DonationTrend>, donation) => {
          const date = new Date(donation.created_at).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = { date, amount: 0, count: 0 };
          }
          acc[date].amount += donation.amount;
          acc[date].count += 1;
          return acc;
        }, {});

        setTrends(Object.values(grouped));
      } catch (err) {
        console.error('Trends error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, []);

  return { trends, loading };
}

export function useFundAllocation() {
  const [allocation, setAllocation] = useState<FundAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllocation() {
      try {
        const { data } = await supabase.from('donations').select('purpose, amount').eq('status', 'Verified');

        const grouped = (data || []).reduce((acc: Record<string, number>, donation) => {
          const purpose = donation.purpose || 'Other';
          acc[purpose] = (acc[purpose] || 0) + donation.amount;
          return acc;
        }, {});

        const colors: Record<string, string> = {
          'Gaza': '#10b981',
          'Orphan': '#6366f1',
          'Ration': '#f59e0b',
          'Other': '#64748b',
        };

        const result = Object.entries(grouped).map(([name, value]) => ({
          name,
          value,
          color: colors[name] || '#64748b',
        }));

        setAllocation(result);
      } catch (err) {
        console.error('Allocation error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllocation();
  }, []);

  return { allocation, loading };
}
