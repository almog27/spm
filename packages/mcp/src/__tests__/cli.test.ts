import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const packageJson = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
) as { version: string };

function runCli(args: string[]) {
  const result = spawnSync(process.execPath, ['dist/index.js', ...args], {
    cwd: new URL('../..', import.meta.url),
    encoding: 'utf8',
    timeout: 5000,
  });

  expect(result.status).toBe(0);
  return {
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

describe('spm-mcp CLI flags', () => {
  it('prints help without starting the MCP server', () => {
    const output = runCli(['--help']);

    expect(output.stdout).toContain('Usage: spm-mcp');
    expect(output.stdout).toContain('--version');
    expect(output.stderr).not.toContain('Failed to start SPM MCP server');
  });

  it('prints the package version without starting the MCP server', () => {
    const output = runCli(['--version']);

    expect(output.stdout.trim()).toBe(packageJson.version);
    expect(output.stderr).not.toContain('Failed to start SPM MCP server');
  });
});
