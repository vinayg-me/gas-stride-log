import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type FeatureFlag = { key: string; enabled: boolean };

export const FEATURE_FLAG_QUERY_KEYS = {
  all: ['feature-flags'] as const,
};

export const useFeatureFlags = () => {
  return useQuery({
    queryKey: FEATURE_FLAG_QUERY_KEYS.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('key, enabled');
      if (error) throw error;
      const map = new Map<string, boolean>();
      for (const row of data ?? []) map.set(row.key, row.enabled);
      const isEnabled = (key: string) => map.get(key) === true;
      return { isEnabled, flags: map };
    },
    staleTime: 60_000,
  });
};


