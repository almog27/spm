import { readFileSync } from 'node:fs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerSearchTool } from './tools/search.js';
import { registerInfoTool } from './tools/info.js';
import { registerCategoriesTool } from './tools/categories.js';
import { registerTemplateTool } from './tools/template.js';

const DEFAULT_REGISTRY_URL = 'https://registry.skillpkg.dev/api/v1';

const packageVersion = (): string => {
  const packageJson = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
  ) as { version?: string };
  return packageJson.version ?? '0.0.0';
};

const printHelp = (): void => {
  console.log(`Usage: spm-mcp [options]

MCP server for the SPM skills registry.

Options:
  -h, --help       Display help for command
  -v, --version    Output the version number
`);
};

const handleCliFlags = (args: string[]): boolean => {
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return true;
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(packageVersion());
    return true;
  }

  return false;
};

const main = async (): Promise<void> => {
  if (handleCliFlags(process.argv.slice(2))) {
    return;
  }

  const baseUrl = process.env['SPM_REGISTRY_URL'] ?? DEFAULT_REGISTRY_URL;

  const server = new McpServer({
    name: 'spm-registry',
    version: '0.1.0',
  });

  registerSearchTool(server, baseUrl);
  registerInfoTool(server, baseUrl);
  registerCategoriesTool(server, baseUrl);
  registerTemplateTool(server, baseUrl);

  const transport = new StdioServerTransport();
  await server.connect(transport);
};

main().catch((err: unknown) => {
  console.error('Failed to start SPM MCP server:', err);
  process.exit(1);
});
