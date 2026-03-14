# @skillpkg/cli

Command-line tool for discovering, installing, authoring, and publishing AI agent skills.

**Install:** `npm install -g @skillpkg/cli`

## Commands

| Command                   | Description                       |
| ------------------------- | --------------------------------- |
| `spm search <query>`      | Search the registry               |
| `spm info <name>`         | View skill details                |
| `spm install <name>`      | Install a skill                   |
| `spm list`                | List installed skills             |
| `spm agents`              | Show detected AI agents           |
| `spm init <name>`         | Scaffold a new skill              |
| `spm test`                | Run skill tests and security scan |
| `spm pack`                | Create `.skl` package             |
| `spm version <bump>`      | Bump version (major/minor/patch)  |
| `spm publish`             | Publish to registry               |
| `spm verify <name>`       | Verify Sigstore signature         |
| `spm login`               | Authenticate via GitHub           |
| `spm whoami`              | Show current user                 |
| `spm yank <name@version>` | Yank a version                    |
| `spm deprecate <name>`    | Deprecate a skill                 |
| `spm report <name>`       | Report a skill                    |

## Output Modes

All commands support `--json` for machine-readable output and `--verbose` for debug logging.

```bash
spm search "pdf tools" --json
spm info data-viz --verbose
```

## Development

```bash
pnpm build    # Build with tsup
pnpm test     # Run tests
```

## Stack

Commander.js, Chalk, Ora, Sigstore, Semver, Tar, tsup
