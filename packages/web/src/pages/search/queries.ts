import { queryOptions } from '@tanstack/react-query';
import { searchSkills } from '../../lib/api';

export const searchSkillsQuery = (params: Record<string, string | number>) =>
  queryOptions({
    queryKey: ['searchSkills', params],
    queryFn: () => searchSkills(params),
  });
