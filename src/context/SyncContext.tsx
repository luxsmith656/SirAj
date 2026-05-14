import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SyncManager } from '../lib/offline/SyncManager';

interface SyncContextType {
  isSyncing: boolean;
  lastSync: number | null;
  triggerSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);

  useEffect(() => {
    SyncManager.getLastSyncTime().then(setLastSync);
  }, []);

  const triggerSync = React.useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await SyncManager.pullAllContent();
      const time = await SyncManager.getLastSyncTime();
      setLastSync(time);
    } catch (e) {
      console.error('Failed to sync content', e);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  return (
    <SyncContext.Provider value={{ isSyncing, lastSync, triggerSync }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
