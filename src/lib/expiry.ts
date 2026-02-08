import { useMemo } from "react";

export function isExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now();
}

export function useNonExpired<T extends { expires_at: string }>(items: T[]) {
  return useMemo(() => items.filter((i) => !isExpired(i.expires_at)), [items]);
}
