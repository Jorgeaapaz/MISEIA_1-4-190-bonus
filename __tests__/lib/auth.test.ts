process.env.JWT_SECRET = 'test-secret-32-chars-minimum-ok!!';

import { signToken, verifyToken } from '@/lib/auth';

describe('signToken / verifyToken', () => {
  const payload = { userId: 'user123', email: 'test@example.com', role: 'investor' as const };

  it('signs and verifies a token successfully', () => {
    const token = signToken(payload);
    expect(typeof token).toBe('string');
    const decoded = verifyToken(token);
    expect(decoded).toMatchObject({ userId: 'user123', email: 'test@example.com' });
  });

  it('returns null on invalid token', () => {
    const result = verifyToken('invalid.token.here');
    expect(result).toBeNull();
  });

  it('returns null on tampered token', () => {
    const token = signToken(payload);
    const tampered = token.slice(0, -5) + 'XXXXX';
    const result = verifyToken(tampered);
    expect(result).toBeNull();
  });

  it('signs token that includes the email', () => {
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded?.email).toBe('test@example.com');
  });
});
