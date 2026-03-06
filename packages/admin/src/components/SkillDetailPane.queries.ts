import { queryOptions } from '@tanstack/react-query';
import { getSkillDetail, getSkillVersion, getSkillDownloads } from '../lib/api';

export const adminSkillDetailQuery = (token: string, name: string) =>
  queryOptions({
    queryKey: ['admin', 'skillDetail', name],
    queryFn: () => getSkillDetail(token, name),
    enabled: !!token && !!name,
  });

export const adminSkillVersionQuery = (token: string, name: string, version: string) =>
  queryOptions({
    queryKey: ['admin', 'skillVersion', name, version],
    queryFn: () => getSkillVersion(token, name, version),
    enabled: !!token && !!name && !!version,
  });

export const adminSkillDownloadsQuery = (token: string, name: string) =>
  queryOptions({
    queryKey: ['admin', 'skillDownloads', name],
    queryFn: () => getSkillDownloads(token, name),
    enabled: !!token && !!name,
  });
