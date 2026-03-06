import { queryOptions } from '@tanstack/react-query';
import { getAuthorProfile } from '../../lib/api';

export const authorProfileQuery = (username: string) =>
  queryOptions({
    queryKey: ['authorProfile', username],
    queryFn: () => getAuthorProfile(username),
    enabled: !!username,
  });
