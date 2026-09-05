import { useEffect, useState } from 'react';
import { userService } from '@/services';
import type { User } from '@/types';

export function useUsers(role?: string): { users: User[]; loading: boolean; error: string | null; reload: () => void } {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    userService
      .list({ page: 1, limit: 100, role })
      .then((result) => {
        if (active) setUsers(result.items);
      })
      .catch((err) => {
        if (active) setError((err as Error).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [role, version]);

  return { users, loading, error, reload: () => setVersion((v) => v + 1) };
}