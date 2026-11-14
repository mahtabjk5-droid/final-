import { useCallback, useEffect, useRef, useState } from 'react';
import { triggerApexHaptic } from '../utils/haptics';
import type { SovereignSystemState } from '../types/sovereign';

interface UseVeritasSocketResult {
  state: SovereignSystemState | null;
  isConnected: boolean;
  isLocked: boolean;
  lastSyncAt: string | null;
  error: string | null;
  refreshState: () => Promise<void>;
  signOut: () => void;
  unlockSession: (pin: string) => Promise<{ ok: boolean; error?: string }>;
}

export function useVeritasSocket(): UseVeritasSocketResult {
  const [state, setState] = useState<SovereignSystemState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const unmountedRef = useRef(false);
  const prevKillSwitchRef = useRef<boolean | null>(null);
  const prevSealTsRef = useRef<string | null>(null);

  const refreshState = useCallback(async () => {
    try {
      const res = await fetch('/api/sovereign/state');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as SovereignSystemState;
      if (!unmountedRef.current) {
        setState(data);
        setLastSyncAt(new Date().toISOString());
        setError(null);
      }
    } catch (err) {
      if (!unmountedRef.current) {
        setError(err instanceof Error ? err.message : 'Unable to sync sovereign state');
      }
    }
  }, []);

  useEffect(() => {
    unmountedRef.current = false;
    void refreshState();

    const connect = () => {
      if (unmountedRef.current) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!unmountedRef.current) {
            setIsConnected(true);
            setError(null);
            triggerApexHaptic('sync_steady', 'WebSocket Sovereign Sync');
          }
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(String(event.data)) as {
              type?: string;
              data?: SovereignSystemState;
            };
            if (msg.type === 'state_sync' && msg.data && !unmountedRef.current) {
              const incoming = msg.data;
              const prevFrozen = prevKillSwitchRef.current;
              const nextFrozen = incoming.killSwitch.active;

              if (prevFrozen !== null && prevFrozen !== nextFrozen) {
                triggerApexHaptic(
                  nextFrozen ? 'agi_agent_lockdown' : 'sync_steady',
                  nextFrozen
                    ? 'Autonomous Agent Containment Freeze'
                    : 'Sovereign Payment Rails Restored',
                );
              }
              prevKillSwitchRef.current = nextFrozen;

              const latestSeal = incoming.recentIntentSeals[0];
              if (latestSeal && latestSeal.timestamp !== prevSealTsRef.current) {
                if (prevSealTsRef.current !== null && latestSeal.decision !== 'SEALED') {
                  triggerApexHaptic('security_violation', 'AGI Intent Firewall Alert');
                }
                prevSealTsRef.current = latestSeal.timestamp;
              }

              setState(incoming);
              setLastSyncAt(new Date().toISOString());
            }
          } catch {
            // Ignore malformed frame
          }
        };

        ws.onclose = () => {
          if (!unmountedRef.current) {
            setIsConnected(false);
            reconnectTimerRef.current = window.setTimeout(connect, 2500);
          }
        };

        ws.onerror = () => {
          if (!unmountedRef.current) {
            setIsConnected(false);
          }
        };
      } catch {
        if (!unmountedRef.current) {
          setIsConnected(false);
        }
      }
    };

    connect();

    // Lock strictly on `beforeunload` (never on `visibilitychange` so screen recording & multi-tab stay seamless)
    const handleBeforeUnload = () => {
      setIsLocked(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unmountedRef.current = true;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [refreshState]);

  const signOut = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlockSession = useCallback(async (pin: string) => {
    if (pin.trim() === '7860') {
      setIsLocked(false);
      await refreshState();
      return { ok: true };
    }
    return { ok: false, error: 'Invalid Sovereign Unlock PIN (Default: 7860)' };
  }, [refreshState]);

  return {
    state,
    isConnected,
    isLocked,
    lastSyncAt,
    error,
    refreshState,
    signOut,
    unlockSession,
  };
}
