import { Link } from 'react-router-dom';
import { Text } from '@spm/ui';
import { docSections } from '../data/docSections';

export const Docs = () => (
  <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 32px 60px' }}>
    <Text
      variant="h1"
      font="sans"
      color="primary"
      as="h1"
      style={{ marginBottom: 4, marginTop: 0 }}
    >
      What is SPM?
    </Text>
    <Text
      variant="body"
      font="sans"
      color="muted"
      as="p"
      style={{ marginBottom: 24, marginTop: 0 }}
    >
      An overview of the Skills Package Manager and how it works with AI agents.
    </Text>

    <Text variant="body" font="sans" color="secondary" as="p" style={{ lineHeight: 1.7 }}>
      <strong>SPM (Skills Package Manager)</strong> is a package manager purpose-built for AI agent
      skills. Think of it as npm for AI agents — a central registry where developers publish,
      discover, and install reusable skill packages that extend what agents can do.
    </Text>

    <Text
      variant="h3"
      font="sans"
      color="primary"
      as="h2"
      style={{ marginTop: 28, marginBottom: 8 }}
    >
      The problem
    </Text>
    <Text variant="body" font="sans" color="secondary" as="p" style={{ lineHeight: 1.7 }}>
      AI agents are powerful, but their capabilities are limited to what&apos;s built in. Every team
      ends up writing the same integrations — Slack bots, database connectors, file processors —
      from scratch. There&apos;s no standard way to share, version, or trust these capabilities
      across projects or organizations.
    </Text>

    <Text
      variant="h3"
      font="sans"
      color="primary"
      as="h2"
      style={{ marginTop: 28, marginBottom: 8 }}
    >
      How SPM solves it
    </Text>
    <Text
      variant="body"
      font="sans"
      color="secondary"
      as="p"
      style={{ lineHeight: 1.7, marginBottom: 12 }}
    >
      SPM provides a complete ecosystem for agent skills:
    </Text>
    <ul
      style={{
        paddingLeft: 20,
        color: 'var(--color-text-secondary)',
        fontFamily: 'var(--font-sans)',
        fontSize: 15,
        lineHeight: 1.8,
      }}
    >
      <li>
        <strong>Registry</strong> — A central repository at{' '}
        <code
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            padding: '1px 5px',
            background: 'var(--color-bg-card)',
            borderRadius: 4,
          }}
        >
          registry.skillpkg.dev
        </code>{' '}
        where skills are published and discovered
      </li>
      <li>
        <strong>CLI</strong> — The{' '}
        <code
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            padding: '1px 5px',
            background: 'var(--color-bg-card)',
            borderRadius: 4,
          }}
        >
          spm
        </code>{' '}
        command-line tool for installing, publishing, and managing skills
      </li>
      <li>
        <strong>Security</strong> — A 3-layer scanning pipeline that analyzes every published skill
        for malicious content
      </li>
      <li>
        <strong>Trust</strong> — A tiered trust system so you know who published what and how much
        to trust it
      </li>
      <li>
        <strong>Signing</strong> — Sigstore keyless signing so every package is cryptographically
        verifiable
      </li>
    </ul>

    <Text
      variant="h3"
      font="sans"
      color="primary"
      as="h2"
      style={{ marginTop: 28, marginBottom: 8 }}
    >
      How it works
    </Text>
    <Text
      variant="body"
      font="sans"
      color="secondary"
      as="p"
      style={{ lineHeight: 1.7, marginBottom: 12 }}
    >
      A skill is a directory containing a{' '}
      <code
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          padding: '1px 5px',
          background: 'var(--color-bg-card)',
          borderRadius: 4,
        }}
      >
        SKILL.md
      </code>{' '}
      manifest and supporting files. When you run{' '}
      <code
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          padding: '1px 5px',
          background: 'var(--color-bg-card)',
          borderRadius: 4,
        }}
      >
        spm publish
      </code>
      , the CLI packs your skill into a{' '}
      <code
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          padding: '1px 5px',
          background: 'var(--color-bg-card)',
          borderRadius: 4,
        }}
      >
        .skl
      </code>{' '}
      archive, signs it with Sigstore, and uploads it to the registry. The registry runs security
      scans and makes it available for others to install.
    </Text>
    <pre
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        lineHeight: 1.6,
        padding: '14px 16px',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 8,
        overflow: 'auto',
        color: 'var(--color-text-secondary)',
      }}
    >
      {`# Install a skill
spm install summarize-text

# Use it in your agent
spm list`}
    </pre>

    {/* Doc sections grid */}
    <Text
      variant="h3"
      font="sans"
      color="primary"
      as="h2"
      style={{ marginTop: 36, marginBottom: 16 }}
    >
      Explore the docs
    </Text>

    {docSections.map((section) => (
      <div key={section.title} style={{ marginBottom: 24 }}>
        <Text
          variant="h4"
          font="sans"
          color="secondary"
          as="h3"
          style={{ marginBottom: 8, marginTop: 0 }}
        >
          {section.title}
        </Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {section.items.map((item) => (
            <Link
              key={item.label}
              to={`/docs/${item.slug}`}
              style={{
                padding: '14px 18px',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 10,
                textDecoration: 'none',
                display: 'block',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = 'var(--color-border-hover)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = 'var(--color-border-default)')
              }
            >
              <Text
                variant="body"
                font="sans"
                color="primary"
                weight={500}
                as="div"
                style={{ marginBottom: 4 }}
              >
                {item.label}
              </Text>
              <Text
                variant="body-sm"
                font="sans"
                color="muted"
                as="div"
                style={{ lineHeight: 1.5 }}
              >
                {item.desc}
              </Text>
            </Link>
          ))}
        </div>
      </div>
    ))}

    <div
      style={{
        padding: '20px 18px',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 10,
      }}
    >
      <Text
        variant="body"
        font="sans"
        color="primary"
        weight={500}
        as="div"
        style={{ marginBottom: 4 }}
      >
        Can&apos;t find what you need?
      </Text>
      <Text variant="body-sm" font="sans" color="muted" as="div">
        Check out the{' '}
        <Link to="/cli" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
          CLI reference
        </Link>{' '}
        or open an issue on{' '}
        <a
          href="https://github.com/skillpkg/spm/issues"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
        >
          GitHub
        </a>
        .
      </Text>
    </div>
  </div>
);
