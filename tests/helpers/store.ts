import { act } from "react";

// A minimal external store for tests: a stub action writes into it and a harness component
// reads it with useSyncExternalStore, standing in for loader revalidation.
export function createTestStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set: (next: T) => {
      value = next;
      act(() => listeners.forEach((listener) => listener()));
    },
  };
}

export type TestStore<T> = ReturnType<typeof createTestStore<T>>;
