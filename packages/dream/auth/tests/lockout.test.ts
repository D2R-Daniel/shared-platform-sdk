import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLockoutManager } from '../src/lockout';

describe('createLockoutManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('checkAccountLockout', () => {
    it('should return locked: false for a fresh user', async () => {
      const manager = createLockoutManager();
      const result = await manager.checkAccountLockout('user-1');
      expect(result).toEqual({ locked: false });
    });

    it('should return locked: true with lockedUntil when account is locked', async () => {
      const manager = createLockoutManager({ maxAttempts: 3, durationMinutes: 10 });

      await manager.recordFailedLogin('user-1');
      await manager.recordFailedLogin('user-1');
      await manager.recordFailedLogin('user-1');

      const result = await manager.checkAccountLockout('user-1');
      expect(result.locked).toBe(true);
      expect(result.lockedUntil).toBeInstanceOf(Date);
    });

    it('should return locked: false after lock duration expires', async () => {
      const manager = createLockoutManager({ maxAttempts: 3, durationMinutes: 10 });

      await manager.recordFailedLogin('user-1');
      await manager.recordFailedLogin('user-1');
      await manager.recordFailedLogin('user-1');

      // Advance time by 11 minutes (past the 10-minute lockout)
      vi.advanceTimersByTime(11 * 60 * 1000);

      const result = await manager.checkAccountLockout('user-1');
      expect(result.locked).toBe(false);
    });
  });

  describe('recordFailedLogin', () => {
    it('should return 4 remaining after 1 failure with default config', async () => {
      const manager = createLockoutManager();
      const result = await manager.recordFailedLogin('user-1');
      expect(result).toEqual({ locked: false, attemptsRemaining: 4 });
    });

    it('should lock account after 5 failures with default config', async () => {
      const manager = createLockoutManager();

      let result;
      for (let i = 0; i < 4; i++) {
        result = await manager.recordFailedLogin('user-1');
      }
      expect(result).toEqual({ locked: false, attemptsRemaining: 1 });

      result = await manager.recordFailedLogin('user-1');
      expect(result).toEqual({ locked: true, attemptsRemaining: 0 });
    });

    it('should work with custom maxAttempts', async () => {
      const manager = createLockoutManager({ maxAttempts: 3, durationMinutes: 15 });

      const result1 = await manager.recordFailedLogin('user-1');
      expect(result1).toEqual({ locked: false, attemptsRemaining: 2 });

      await manager.recordFailedLogin('user-1');
      const result3 = await manager.recordFailedLogin('user-1');
      expect(result3).toEqual({ locked: true, attemptsRemaining: 0 });
    });

    it('should work with custom durationMinutes', async () => {
      const manager = createLockoutManager({ maxAttempts: 2, durationMinutes: 30 });

      await manager.recordFailedLogin('user-1');
      await manager.recordFailedLogin('user-1');

      const check = await manager.checkAccountLockout('user-1');
      expect(check.locked).toBe(true);

      // 29 minutes — still locked
      vi.advanceTimersByTime(29 * 60 * 1000);
      const stillLocked = await manager.checkAccountLockout('user-1');
      expect(stillLocked.locked).toBe(true);

      // 31 minutes — unlocked
      vi.advanceTimersByTime(2 * 60 * 1000);
      const unlocked = await manager.checkAccountLockout('user-1');
      expect(unlocked.locked).toBe(false);
    });
  });

  describe('resetFailedLogins', () => {
    it('should reset attempts so account is no longer locked', async () => {
      const manager = createLockoutManager({ maxAttempts: 2, durationMinutes: 15 });

      await manager.recordFailedLogin('user-1');
      await manager.recordFailedLogin('user-1');

      const locked = await manager.checkAccountLockout('user-1');
      expect(locked.locked).toBe(true);

      await manager.resetFailedLogins('user-1');

      const afterReset = await manager.checkAccountLockout('user-1');
      expect(afterReset.locked).toBe(false);
    });

    it('should not throw for unknown user', async () => {
      const manager = createLockoutManager();
      await expect(manager.resetFailedLogins('nonexistent')).resolves.toBeUndefined();
    });
  });
});
