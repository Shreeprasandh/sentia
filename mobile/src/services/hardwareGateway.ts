import { supabase } from './supabase';
import { BagTelemetry } from '../types';

export type BagCommand =
  | 'LOCK'
  | 'UNLOCK'
  | 'SOUND_ALARM'
  | 'DISMISS_ALARM'
  | 'LED_COLOR'
  | 'HEAT_ON'
  | 'HEAT_OFF';

/**
 * Unified Hardware Gateway
 * Seamless dual-mode architecture:
 * - Listens to Supabase Realtime channel for live telemetry broadcast from Web Replica and bag firmware.
 * - Dispatches commands back to the hardware.
 */
const commandChannels: Record<string, any> = {};

function getCommandChannel(bagId: string) {
  if (!commandChannels[bagId]) {
    commandChannels[bagId] = supabase.channel(`commands:${bagId}`).subscribe();
  }
  return commandChannels[bagId];
}

export class HardwareGateway {
  /**
   * Pre-warm and subscribe command channels for immediate zero-latency dispatches.
   */
  static prewarmCommands(bagIds: string[]) {
    bagIds.forEach((id) => getCommandChannel(id));
  }
  /**
   * Subscribe to real-time telemetry updates for a specific bag.
   */
  static subscribeTelemetry(
    bagId: string,
    onTelemetry: (telemetry: BagTelemetry) => void
  ): () => void {
    const channel = supabase
      .channel(`telemetry:${bagId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bag_telemetry',
          filter: `bag_id=eq.${bagId}`,
        },
        (payload) => {
          if (payload.new) {
            onTelemetry(payload.new as BagTelemetry);
          }
        }
      )
      .on('broadcast', { event: 'live_telemetry' }, (payload) => {
        if (payload.payload) {
          onTelemetry(payload.payload as BagTelemetry);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Subscribe to real-time telemetry updates across multiple bags simultaneously.
   */
  static subscribeAllBags(
    bagIds: string[],
    onTelemetry: (bagId: string, telemetry: BagTelemetry) => void
  ): () => void {
    const channels = bagIds.map((bagId) => {
      return supabase
        .channel(`telemetry:${bagId}`)
        .on('broadcast', { event: 'live_telemetry' }, (payload) => {
          if (payload.payload) {
            onTelemetry(bagId, payload.payload as BagTelemetry);
          }
        })
        .subscribe();
    });

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }

  /**
   * Send hardware command (e.g. Arm Lock, Trigger Proximity Buzz, Change LED, Heat Pad).
   */
  static async sendCommand(
    bagId: string,
    command: BagCommand,
    params: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      const channel = getCommandChannel(bagId);
      // Connection readiness guard: await joined status if channel is still connecting
      if (channel && channel.state !== 'joined') {
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => resolve(), 750);
          channel.subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              clearTimeout(timeout);
              resolve();
            }
          });
        });
      }

      await channel.send({
        type: 'broadcast',
        event: 'hardware_command',
        payload: { command, bagId, timestamp: Date.now(), ...params },
      });
      return true;
    } catch (err) {
      console.error('Failed to dispatch hardware command:', err);
      return false;
    }
  }

  /**
   * Fetch latest recorded telemetry row from PostgreSQL.
   */
  static async getLatestTelemetry(bagId: string): Promise<BagTelemetry | null> {
    try {
      const { data, error } = await supabase
        .from('bag_telemetry')
        .select('*')
        .eq('bag_id', bagId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;
      return data as BagTelemetry;
    } catch {
      return null;
    }
  }
}
