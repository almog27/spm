import { queryOptions } from '@tanstack/react-query';
import { getAdminSkills } from '../lib/api';

export const adminSkillsQuery = (token: string, page: number) =>
  queryOptions({
    queryKey: ['admin', 'skills', page],
    queryFn: () => getAdminSkills(token, page, 50),
    enabled: !!token,
  });
