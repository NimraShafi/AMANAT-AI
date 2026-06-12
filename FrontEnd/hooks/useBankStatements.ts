"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BankStatement } from '@/types/database';

export function useBankStatements() {
  const [statements, setStatements] = useState<BankStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatements = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bank_statements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStatements(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatements();

    const subscription = supabase
      .channel('bank_statements_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bank_statements' },
        () => {
          fetchStatements();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchStatements]);

  return { statements, loading, error, refetch: fetchStatements };
}
