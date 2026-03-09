# @spm/mcp

MCP server for the [SPM](https://skillpkg.dev) skills registry. Search, browse, and query AI agent skills from Claude Desktop, claude CLI, or any MCP client.

## Tools

| Tool | Description |
|------|-------------|
| `spm_search` | Search skills by query and category |
| `spm_info` | Get detailed info about a specific skill |
| `spm_categories` | List all skill categories with counts |

## Installation

```bash
npm install -g @spm/mcp
```

## Configuration

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "spm": {
      "command": "spm-mcp"
    }
  }
}
```

### Claude Code

```bash
claude mcp add spm spm-mcp
```

### Custom registry URL

Set the `SPM_REGISTRY_URL` environment variable to point to a different registry:

```json
{
  "mcpServers": {
    "spm": {
      "command": "spm-mcp",
      "env": {
        "SPM_REGISTRY_URL": "http://localhost:8787/api/v1"
      }
    }
  }
}
```

## Usage

Once configured, ask Claude to search for skills:

- "Search for PDF skills on SPM"
- "What categories of skills are available on SPM?"
- "Get info about the frontend-design skill"

## Development

```bash
# Run locally
pnpm dev

# Build
pnpm build

# Test
pnpm test
```

## License

MIT
