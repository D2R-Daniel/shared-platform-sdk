export interface LockoutConfig {
  maxAttempts: number;
  durationMinutes: number;
}

export interface LockoutCheckResult {
  locked: boolean;
  lockedUntil?: Date;
}

export interface FailedLoginResult {
  locked: boolean;
  attemptsRemaining: number;
}

interface LockoutEntry {
  attempts: number;
  lockedUntil: Date | null;
}

export interface LockoutManager {
  checkAccountLockout(userId: string): Promise<LockoutCheckResult>;
  recordFailedLogin(userId: string): Promise<FailedLoginResult>;
  resetFailedLogins(userId: string): Promise<void>;
}

const DEFAULT_CONFIG: LockoutConfig = {
  maxAttempts: 5,
  durationMinutes: 15,
};

export function createLockoutManager(
  config?: Partial<LockoutConfig>,
): LockoutManager {
  const resolved: LockoutConfig = { ...DEFAULT_CONFIG, ...config };
  const store = new Map<string, LockoutEntry>();

  function getEntry(userId: string): LockoutEntry {
    return store.get(userId) ?? { attempts: 0, lockedUntil: null };
  }

  return {
    async checkAccountLockout(userId: string): Promise<LockoutCheckResult> {
      const entry = getEntry(userId);

      if (entry.lockedUntil === null) {
        return { locked: false };
      }

      if (entry.lockedUntil.getTime() <= Date.now()) {
        // Lock has expired — reset
        store.delete(userId);
        return { locked: false };
      }

      return { locked: true, lockedUntil: entry.lockedUntil };
    },

    async recordFailedLogin(userId: string): Promise<FailedLoginResult> {
      const entry = getEntry(userId);

      // If currently locked and lock hasn't expired, still return locked
      if (entry.lockedUntil && entry.lockedUntil.getTime() > Date.now()) {
        return { locked: true, attemptsRemaining: 0 };
      }

      const newAttempts = entry.attempts + 1;

      if (newAttempts >= resolved.maxAttempts) {
        const lockedUntil = new Date(
          Date.now() + resolved.durationMinutes * 60 * 1000,
        );
        store.set(userId, { attempts: newAttempts, lockedUntil });
        return { locked: true, attemptsRemaining: 0 };
      }

      store.set(userId, { attempts: newAttempts, lockedUntil: null });
      return {
        locked: false,
        attemptsRemaining: resolved.maxAttempts - newAttempts,
      };
    },

    async resetFailedLogins(userId: string): Promise<void> {
      store.delete(userId);
    },
  };
}
