import { queryOptions } from '@tanstack/react-query';
import { getQueue, getAdminStats } from '../lib/api';

export const queueQuery = (token: string) =>
  queryOptions({
    queryKey: ['admin', 'queue'],
    queryFn: () => getQueue(token),
    enabled: !!token,
  });

export const adminStatsQuery = (token: string) =>
  queryOptions({
    queryKey: ['admin', 'stats'],
    queryFn: () => getAdminStats(token),
    enabled: !!token,
  });
