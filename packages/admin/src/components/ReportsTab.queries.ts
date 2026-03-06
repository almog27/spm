import { queryOptions } from '@tanstack/react-query';
import { getAdminReports } from '../lib/api';

export const reportsQuery = (token: string) =>
  queryOptions({
    queryKey: ['admin', 'reports'],
    queryFn: () => getAdminReports(token),
    enabled: !!token,
  });
