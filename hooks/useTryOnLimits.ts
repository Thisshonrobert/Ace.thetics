import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const DAILY_LIMIT = 3;
const STORAGE_KEY_PREFIX = 'tryOnUsage:';

interface UsageData {
  date: string;
  count: number;
}

export function useTryOnLimits() {
  const { data: session } = useSession();
  const [remainingTries, setRemainingTries] = useState<number | null>(null);

  useEffect(() => {
    if (session) {
      updateRemainingTries();
    } else {
      // clear remaining tries when no session
      setRemainingTries(null);
    }
  }, [session]);

  const updateRemainingTries = () => {
    const usage = getCurrentUsage();
    setRemainingTries(DAILY_LIMIT - usage.count);
  };

  const getStorageKeyForSession = () => {
    const userIdentifier = session?.user?.email || session?.user?.name || 'guest';
    return `${STORAGE_KEY_PREFIX}${userIdentifier}`;
  };

  const getCurrentUsage = (): UsageData => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const key = getStorageKeyForSession();
      const stored = localStorage.getItem(key);

      if (!stored) {
        return { date: today, count: 0 };
      }

      const usage: UsageData = JSON.parse(stored);
      if (usage.date !== today) {
        return { date: today, count: 0 };
      }

      return usage;
    } catch (err) {
      console.error('Failed to read try-on usage from storage', err);
      return { date: today, count: 0 };
    }
  };

  const checkLimit = async (): Promise<boolean> => {
    if (!session) return false;

    const usage = getCurrentUsage();
    const today = new Date().toISOString().split('T')[0];
    const key = getStorageKeyForSession();

    if (usage.date !== today) {
      const newUsage = { date: today, count: 1 };
      localStorage.setItem(key, JSON.stringify(newUsage));
      setRemainingTries(DAILY_LIMIT - 1);
      return true;
    }

    if (usage.count >= DAILY_LIMIT) {
      return false;
    }

    const newUsage = { date: today, count: usage.count + 1 };
    localStorage.setItem(key, JSON.stringify(newUsage));
    setRemainingTries(DAILY_LIMIT - newUsage.count);
    return true;
  };

  return { remainingTries, checkLimit };
} 