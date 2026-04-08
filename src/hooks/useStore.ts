import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot, BankStore } from '@/lib/bankData';

export function useStore(): BankStore {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
