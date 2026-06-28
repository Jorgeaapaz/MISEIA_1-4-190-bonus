import { couponPerPeriod, frequencyToPeriodsPerYear, paymentDates, formatCents, formatBasisPoints } from '@/lib/payments';
import type { Bond } from '@/lib/types';

const mockBond: Bond = {
  bondName: 'Test Bond',
  companyName: 'Test Corp',
  faceValue: 1000000, // $10,000.00 in cents
  totalIssuance: 10000000,
  couponType: 'fixed',
  couponRate: 600,    // 6.00% in basis points
  paymentFrequency: 'semi-annual',
  issueDate: new Date('2024-01-01'),
  maturityDate: new Date('2027-01-01'),
  maturityType: 'medium',
  status: 'active',
  sector: 'tech',
  creditRating: 'A',
  description: 'Test bond description',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('frequencyToPeriodsPerYear', () => {
  it('returns 12 for monthly', () => {
    expect(frequencyToPeriodsPerYear('monthly')).toBe(12);
  });

  it('returns 4 for quarterly', () => {
    expect(frequencyToPeriodsPerYear('quarterly')).toBe(4);
  });

  it('returns 2 for semi-annual', () => {
    expect(frequencyToPeriodsPerYear('semi-annual')).toBe(2);
  });

  it('returns 1 for annual', () => {
    expect(frequencyToPeriodsPerYear('annual')).toBe(1);
  });
});

describe('couponPerPeriod', () => {
  it('calculates correct semi-annual coupon', () => {
    // faceValue=1000000 cents, couponRate=600 bp (6%)
    // annual coupon = 1000000 * 600 / 10000 = 60000 cents
    // semi-annual = 60000 / 2 = 30000 cents
    const result = couponPerPeriod(mockBond);
    expect(result).toBe(30000);
  });

  it('returns a number', () => {
    expect(typeof couponPerPeriod(mockBond)).toBe('number');
  });

  it('calculates annual coupon correctly', () => {
    const annualBond: Bond = { ...mockBond, paymentFrequency: 'annual' };
    // annual coupon = 1000000 * 600 / 10000 = 60000
    expect(couponPerPeriod(annualBond)).toBe(60000);
  });
});

describe('paymentDates', () => {
  it('returns an array of dates', () => {
    const dates = paymentDates(mockBond);
    expect(Array.isArray(dates)).toBe(true);
  });

  it('returns Date objects', () => {
    const dates = paymentDates(mockBond);
    expect(dates.length).toBeGreaterThan(0);
    expect(dates[0]).toBeInstanceOf(Date);
  });

  it('returns multiple payments for a 3-year semi-annual bond', () => {
    const dates = paymentDates(mockBond);
    expect(dates.length).toBeGreaterThanOrEqual(5);
    expect(dates.length).toBeLessThanOrEqual(7);
  });
});

describe('payments lib formatCents', () => {
  it('returns a string', () => {
    expect(typeof formatCents(500)).toBe('string');
  });

  it('formats 0 cents', () => {
    expect(formatCents(0)).toContain('0');
  });
});

describe('payments lib formatBasisPoints', () => {
  it('formats 650 basis points as 6.50%', () => {
    expect(formatBasisPoints(650)).toBe('6.50%');
  });
});
