"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ReviewQueue } from '@/types/database';

export function useReviewQueue() {
  const [reviews, setReviews] = useState<ReviewQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('review_queue')
        .select(`
          *,
          donation:donations(*)
        `)
        // .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();

    const subscription = supabase
      .channel('review_queue_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'review_queue' },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchReviews]);

  const resolveReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('review_queue')
        .update({ status: 'RESOLVED', resolved_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: 'RESOLVED', resolved_at: new Date().toISOString() }
            : r
        )
      );
    } catch (err) {
      console.error('Resolve error:', err);
      throw err;
    }
  };

  return { reviews, loading, error, refetch: fetchReviews, resolveReview };
}
