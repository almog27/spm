import { queryOptions } from '@tanstack/react-query';
import { getAuthorStats, searchSkills } from '../../lib/api';

export const authorStatsQuery = (username: string, token: string) =>
  queryOptions({
    queryKey: ['authorStats', username],
    queryFn: () => getAuthorStats(username, token),
    enabled: !!username && !!token,
  });

export const dashboardSkillsQuery = () =>
  queryOptions({
    queryKey: ['searchSkills', { q: '', per_page: 50 }],
    queryFn: () => searchSkills({ q: '', per_page: 50 }),
  });
