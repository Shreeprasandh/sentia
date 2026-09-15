import { supabase } from './supabase';
import { BagTelemetry } from '../types';

export type BagCommand = 'LOCK' | 'UNLOCK' | 'SOUND_ALARM' | 'DISMISS_ALARM' | 'LED_COLOR';

/**
 * Unified Hardware Gateway
 * Seamless dual-mode architecture:
 * - Listens to Supabase Realtime channel for live telemetry broadcast from Web Replica & bag firmware.
 * - Dispatches commands back to the hardware.
 */
export class HardwareGateway {
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
   * Send hardware command (e.g. Arm Lock, Trigger Proximity Buzz, Change LED).
   */
  static async sendCommand(bagId: string, command: BagCommand, params: Record<string, any> = {}): Promise<boolean> {
    try {
      const channel = supabase.channel(`commands:${bagId}`);
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
