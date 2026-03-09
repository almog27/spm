import { fetchCategories, isApiClientError } from '../api-client.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CATEGORY_INFO, type SkillCategory } from '@spm/shared';

export const formatCategories = (
  categories: {
    slug: string;
    icon: string;
    display: string;
    count: number;
  }[],
): string => {
  const lines: string[] = ['SPM Skill Categories:\n'];

  for (const cat of categories) {
    const info = CATEGORY_INFO[cat.slug as SkillCategory];
    const description = info?.description ?? '';
    lines.push(`${cat.icon} ${cat.display} (${cat.count} skills) — ${description}`);
  }

  return lines.join('\n');
};

export const registerCategoriesTool = (server: McpServer, baseUrl: string): void => {
  server.tool('spm_categories', 'List all SPM skill categories', async () => {
    try {
      const response = await fetchCategories(baseUrl);
      const text = formatCategories(response.categories);
      return { content: [{ type: 'text', text }] };
    } catch (err: unknown) {
      const message = isApiClientError(err) ? err.message : 'Failed to fetch categories';
      return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
    }
  });
};
