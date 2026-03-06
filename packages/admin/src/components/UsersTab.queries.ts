import { queryOptions } from '@tanstack/react-query';
import { getAdminUsers } from '../lib/api';

export const usersQuery = (token: string, trustFilter: string) =>
  queryOptions({
    queryKey: ['admin', 'users', trustFilter],
    queryFn: () =>
      getAdminUsers(token, {
        trust: trustFilter !== 'all' ? trustFilter : undefined,
        per_page: 100,
      }),
    enabled: !!token,
  });
