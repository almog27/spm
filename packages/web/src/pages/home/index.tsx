import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CATEGORIES, type SkillSummary, type Category } from '../../data/constants';
import { type TrendingSkill, type CategoryItem } from '../../lib/api';
import { trendingQuery, categoriesQuery } from './queries';
import { HeroSearch } from './HeroSearch';
import { TrendingTabs, type TrendingTab } from './TrendingTabs';
import { CategoryGrid } from './CategoryGrid';

const formatDownloads = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const trendingToSummary = (s: TrendingSkill): SkillSummary => ({
  name: s.name,
  version: s.version ?? '0.0.0',
  desc: s.description,
  author: s.author.username,
  trust: s.author.trust_tier as SkillSummary['trust'],
  downloads: formatDownloads(s.downloads),
  weeklyGrowth: s.weekly_growth_pct ? `+${s.weekly_growth_pct}%` : undefined,
  rating: s.rating_avg != null ? String(s.rating_avg) : undefined,
});

const apiCategoryToCategory = (c: CategoryItem): Category => ({
  name: c.display,
  slug: c.slug,
  icon: c.icon,
  count: c.count,
});

export const Home = () => {
  const [query, setQuery] = useState('');
  const [trendingTab, setTrendingTab] = useState<TrendingTab>('featured');

  const { data: featuredData } = useQuery(trendingQuery('featured'));
  const { data: risingData } = useQuery(trendingQuery('rising'));
  const { data: mostInstalledData } = useQuery(trendingQuery('most-installed'));
  const { data: newData } = useQuery(trendingQuery('new'));
  const { data: categoriesData } = useQuery(categoriesQuery());

  const featuredSkills = featuredData?.skills.map(trendingToSummary) ?? [];
  const risingSkills = risingData?.skills.map(trendingToSummary) ?? [];
  const mostInstalledSkills = mostInstalledData?.skills.map(trendingToSummary) ?? [];
  const newSkills = newData?.skills.map(trendingToSummary) ?? [];
  const categories =
    categoriesData && categoriesData.categories.length > 0
      ? categoriesData.categories.map(apiCategoryToCategory)
      : CATEGORIES;

  const allSkills = [...featuredSkills, ...risingSkills, ...newSkills];
  const filtered = query.trim()
    ? allSkills.filter(
        (s) =>
          s.name.includes(query.toLowerCase()) ||
          (s.desc || '').toLowerCase().includes(query.toLowerCase()) ||
          s.author.includes(query.toLowerCase()),
      )
    : null;

  const totalSkills = categories.reduce((sum, c) => sum + c.count, 0);

  // Suppress lint warning — trendingTab drives which cached query is displayed, not fetched
  void trendingTab;

  return (
    <div>
      <HeroSearch
        totalSkills={totalSkills}
        totalCategories={categories.length}
        query={query}
        setQuery={setQuery}
        filtered={filtered}
      />

      {!filtered && (
        <section style={{ maxWidth: 920, margin: '0 auto', padding: '0 32px 60px' }}>
          <TrendingTabs
            trendingTab={trendingTab}
            setTrendingTab={setTrendingTab}
            featuredSkills={featuredSkills}
            risingSkills={risingSkills}
            mostInstalledSkills={mostInstalledSkills}
            newSkills={newSkills}
          />
          <CategoryGrid categories={categories} />
        </section>
      )}
    </div>
  );
};
