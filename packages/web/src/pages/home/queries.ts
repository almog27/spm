import { queryOptions } from '@tanstack/react-query';
import { getTrending, getCategories } from '../../lib/api';

export const trendingQuery = (tab: string) =>
  queryOptions({
    queryKey: ['trending', tab],
    queryFn: () => {
      const apiTab = tab === 'most-installed' ? 'most_installed' : tab;
      return getTrending(apiTab);
    },
  });

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
    staleTime: 5 * 60_000,
  });
