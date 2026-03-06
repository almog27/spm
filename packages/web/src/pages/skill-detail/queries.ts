import { queryOptions } from '@tanstack/react-query';
import { getSkill, getSkillDownloads } from '../../lib/api';

export const skillDetailQuery = (name: string) =>
  queryOptions({
    queryKey: ['skill', name],
    queryFn: () => getSkill(name),
    enabled: !!name,
  });

export const skillDownloadsQuery = (name: string) =>
  queryOptions({
    queryKey: ['skillDownloads', name],
    queryFn: () => getSkillDownloads(name),
    enabled: !!name,
  });
