import { queryOptions } from '@tanstack/react-query';
import { getAdminErrors } from '../lib/api';

export const errorsQuery = (token: string) =>
  queryOptions({
    queryKey: ['admin', 'errors'],
    queryFn: () => getAdminErrors(token),
    enabled: !!token,
  });
