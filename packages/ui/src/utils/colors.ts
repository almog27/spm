export const COLOR_VALUES: Record<string, string> = {
  accent: 'var(--color-accent)',
  'accent-dim': 'var(--color-accent-dim)',
  cyan: 'var(--color-cyan)',
  yellow: 'var(--color-yellow)',
  blue: 'var(--color-blue)',
  red: 'var(--color-red)',
  purple: 'var(--color-purple)',
  orange: 'var(--color-orange)',
  'text-primary': 'var(--color-text-primary)',
  'text-secondary': 'var(--color-text-secondary)',
  'text-dim': 'var(--color-text-dim)',
  'text-muted': 'var(--color-text-muted)',
  'text-faint': 'var(--color-text-faint)',
};

export const resolveColor = (color: string): string => COLOR_VALUES[color] ?? color;

export const withAlpha = (color: string, alpha: number): string => {
  const resolved = resolveColor(color);
  if (resolved.startsWith('var(')) {
    return `color-mix(in srgb, ${resolved} ${Math.round(alpha * 100)}%, transparent)`;
  }
  // Handle hex colors: #rgb, #rrggbb
  const hexMatch = resolved.match(/^#([0-9a-fA-F]{3,8})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    if (hex.length === 6) {
      const alphaHex = Math.round(alpha * 255)
        .toString(16)
        .padStart(2, '0');
      return `#${hex}${alphaHex}`;
    }
  }
  return resolved;
};
