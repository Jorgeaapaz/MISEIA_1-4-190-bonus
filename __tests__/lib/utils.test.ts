import { formatCents, formatBasisPoints } from '@/lib/utils';

describe('formatCents', () => {
  it('formats zero cents as $0.00', () => {
    expect(formatCents(0)).toContain('0');
  });

  it('formats 100000 cents as $1,000.00', () => {
    const result = formatCents(100000);
    expect(result).toContain('1,000');
  });

  it('formats 150 cents as $1.50', () => {
    const result = formatCents(150);
    expect(result).toContain('1.50');
  });

  it('returns a string', () => {
    expect(typeof formatCents(500)).toBe('string');
  });
});

describe('formatBasisPoints', () => {
  it('formats 650 basis points as 6.50%', () => {
    expect(formatBasisPoints(650)).toBe('6.50%');
  });

  it('formats 100 basis points as 1.00%', () => {
    expect(formatBasisPoints(100)).toBe('1.00%');
  });

  it('formats 0 basis points as 0.00%', () => {
    expect(formatBasisPoints(0)).toBe('0.00%');
  });
});
