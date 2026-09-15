import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Shield,
  BatteryCharging,
  BatteryMedium,
  Droplets,
  Thermometer,
  Scale,
  AlertTriangle,
  Radio,
  Send,
  Lock,
  Unlock,
  Bell,
  RefreshCw,
} from 'lucide-react';

const SUPABASE_URL = 'https://mlfkgcriezxzyapjixip.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sZmtnY3JpZXhnenlhcGppeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NzY4MDIsImV4cCI6MjEwNTA1MjgwMn0.GnLZJ6ImOewz9BqiosxqAt2moH_UAIsY0uXHJFy7rA4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TelemetryState {
  bagId: string;
  batteryLevel: number;
  isCharging: boolean;
  zipperClosed: boolean;
  bottleInserted: boolean;
  weightKg: number;
  internalTempC: number;
  humidityPct: number;
  bleRssi: number;
  tamperDetected: boolean;
  sosTriggered: boolean;
  latitude: number;
  longitude: number;
}

export default function App() {
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    bagId: 'bag-01',
    batteryLevel: 86,
    isCharging: false,
    zipperClosed: true,
    bottleInserted: true,
    weightKg: 2.4,
    internalTempC: 23.5,
    humidityPct: 54,
    bleRssi: -58,
    tamperDetected: false,
    sosTriggered: false,
    latitude: 13.0827,
    longitude: 80.2707,
  });

  const [connected, setConnected] = useState(false);
  const [lastLog, setLastLog] = useState<string>('Simulator initialized. Ready for broadcast.');
  const [receivedCommands, setReceivedCommands] = useState<string[]>([]);
  const [sosHolding, setSosHolding] = useState(false);
  const sosHoldTimer = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to commands from mobile app
  useEffect(() => {
    const channel = supabase
      .channel('commands:bag-01')
      .on('broadcast', { event: 'hardware_command' }, (payload) => {
        const cmd = payload.payload;
        setReceivedCommands((prev) => [
          `[${new Date().toLocaleTimeString()}] RECEIVED: ${cmd.command} ${JSON.stringify(cmd.params || '')}`,
          ...prev.slice(0, 8),
        ]);
        if (cmd.command === 'SOUND_ALARM') {
          setLastLog('Bag buzzer chime triggered by mobile app!');
        } else if (cmd.command === 'LOCK') {
          setTelemetry((t) => ({ ...t, zipperClosed: true }));
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Broadcast telemetry via Realtime & optionally insert into PostgreSQL
  const broadcastTelemetry = async (updated?: Partial<TelemetryState>) => {
    const current = { ...telemetry, ...updated };
    if (updated) setTelemetry(current);

    try {
      const channel = supabase.channel('telemetry:bag-01');
      await channel.send({
        type: 'broadcast',
        event: 'live_telemetry',
        payload: {
          bag_id: current.bagId,
          battery_level: current.batteryLevel,
          is_charging: current.isCharging,
          zipper_closed: current.zipperClosed,
          bottle_inserted: current.bottleInserted,
          weight_kg: current.weightKg,
          internal_temp_c: current.internalTempC,
          humidity_pct: current.humidityPct,
          ble_rssi: current.bleRssi,
          tamper_detected: current.tamperDetected,
          sos_triggered: current.sosTriggered,
          recorded_at: new Date().toISOString(),
        },
      });
      setLastLog(`Broadcasted telemetry at ${new Date().toLocaleTimeString()} (Battery: ${current.batteryLevel}%, Weight: ${current.weightKg}kg)`);
    } catch (err) {
      setLastLog('Broadcast error: ' + String(err));
    }
  };

  // 3-second SOS Long-Press Handler
  const startSosHold = () => {
    setSosHolding(true);
    sosHoldTimer.current = setTimeout(() => {
      broadcastTelemetry({ sosTriggered: true });
      setLastLog('EMERGENCY SOS BROADCASTED TO GUARDIAN CONTACTS!');
      setSosHolding(false);
    }, 3000);
  };

  const cancelSosHold = () => {
    if (sosHoldTimer.current) clearTimeout(sosHoldTimer.current);
    setSosHolding(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/logo.png" alt="Sentia" style={{ width: '42px', height: '42px' }} />
          <div>
            <h1 style={{ fontSize: '28px', color: '#064E3B', letterSpacing: '1px' }}>SENTIA BAG TWIN</h1>
            <p style={{ fontSize: '13px', color: '#7D8882' }}>Hardware Realtime Simulation Console</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FDFBF7',
            border: '1px solid #EEDCC0',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 600,
            color: connected ? '#064E3B' : '#D97706',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: connected ? '#10B981' : '#F59E0B',
            }} />
            {connected ? 'Supabase Realtime Live' : 'Connecting to Cloud...'}
          </div>

          <button
            onClick={() => broadcastTelemetry()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#064E3B',
              color: '#FAF6EE',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Send size={14} />
            Sync Telemetry
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
        {/* Left: Interactive Hardware Controls */}
        <section style={{
          backgroundColor: '#FDFBF7',
          borderRadius: '24px',
          border: '1px solid #EEDCC0',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(6, 78, 59, 0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F1F1A' }}>Hardware Control Panel</h2>
            <span style={{
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '12px',
              backgroundColor: '#F8E7C9',
              color: '#064E3B',
              fontWeight: 600,
            }}>
              Active Bag: Executive-01
            </span>
          </div>

          {/* Bag Image with Simulated LED Strip */}
          <div style={{
            position: 'relative',
            backgroundColor: '#FAF6EE',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '24px',
            border: '1px solid #EEDCC0',
          }}>
            <img src="/image1.png" alt="Bag" style={{ maxHeight: '180px', margin: '0 auto', display: 'block' }} />
            {/* Simulated Smart LED Rim */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '4px 16px',
              borderRadius: '999px',
              backgroundColor: telemetry.sosTriggered
                ? '#B91C1C'
                : (telemetry.tamperDetected ? '#D97706' : '#10B981'),
              color: '#FAF6EE',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              boxShadow: telemetry.sosTriggered ? '0 0 12px #B91C1C' : '0 0 8px #10B981',
            }}>
              LED: {telemetry.sosTriggered ? 'SOS RED STROBE' : (telemetry.tamperDetected ? 'TAMPER AMBER' : 'EMERALD NORMAL')}
            </div>
          </div>

          {/* Control Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Battery Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BatteryMedium size={16} color="#064E3B" />
                  Battery Level: {telemetry.batteryLevel}%
                </span>
                <label style={{ fontSize: '12px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="checkbox"
                    checked={telemetry.isCharging}
                    onChange={(e) => broadcastTelemetry({ isCharging: e.target.checked })}
                  />
                  Charging
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={telemetry.batteryLevel}
                onChange={(e) => broadcastTelemetry({ batteryLevel: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#064E3B' }}
              />
            </div>

            {/* Zipper & Bottle Toggles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => broadcastTelemetry({ zipperClosed: !telemetry.zipperClosed })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #EEDCC0',
                  backgroundColor: telemetry.zipperClosed ? '#FAF6EE' : '#FEF3C7',
                  color: '#0F1F1A',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {telemetry.zipperClosed ? <Lock size={16} color="#064E3B" /> : <Unlock size={16} color="#D97706" />}
                Zipper: {telemetry.zipperClosed ? 'Closed' : 'Unzipped'}
              </button>

              <button
                onClick={() => broadcastTelemetry({ bottleInserted: !telemetry.bottleInserted })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #EEDCC0',
                  backgroundColor: telemetry.bottleInserted ? '#FAF6EE' : '#F3F4F6',
                  color: '#0F1F1A',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Droplets size={16} color={telemetry.bottleInserted ? '#064E3B' : '#9CA3AF'} />
                Bottle: {telemetry.bottleInserted ? 'Docked' : 'Empty'}
              </button>
            </div>

            {/* Load Cell Weight Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scale size={16} color="#064E3B" />
                  Load Cell Weight: {telemetry.weightKg} kg
                </span>
                <span style={{ fontSize: '11px', color: '#7D8882' }}>Max 10.0kg</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.1"
                value={telemetry.weightKg}
                onChange={(e) => broadcastTelemetry({ weightKg: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#064E3B' }}
              />
            </div>

            {/* Anti-Tamper & Motion Sensor */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#FAF6EE', borderRadius: '12px', border: '1px solid #EEDCC0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color={telemetry.tamperDetected ? '#D97706' : '#7D8882'} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Anti-Tamper Gyroscope Trigger</div>
                  <div style={{ fontSize: '11px', color: '#7D8882' }}>Simulates unauthorized displacement</div>
                </div>
              </div>
              <button
                onClick={() => broadcastTelemetry({ tamperDetected: !telemetry.tamperDetected })}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: '1px solid #EEDCC0',
                  backgroundColor: telemetry.tamperDetected ? '#D97706' : '#FAF6EE',
                  color: telemetry.tamperDetected ? '#FAF6EE' : '#0F1F1A',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {telemetry.tamperDetected ? 'Tamper Active' : 'Trip Sensor'}
              </button>
            </div>

            {/* 3-Second SOS Long-Press Trigger */}
            <div style={{
              padding: '16px',
              backgroundColor: telemetry.sosTriggered ? '#FEE2E2' : '#FAF6EE',
              borderRadius: '16px',
              border: '1px solid ' + (telemetry.sosTriggered ? '#B91C1C' : '#EEDCC0'),
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: telemetry.sosTriggered ? '#B91C1C' : '#0F1F1A', marginBottom: '6px' }}>
                {telemetry.sosTriggered ? 'SOS DISPATCH BROADCAST ACTIVE' : 'School Bag 3-Second SOS Trigger'}
              </div>
              <p style={{ fontSize: '11px', color: '#7D8882', marginBottom: '12px' }}>
                Hold button for 3 seconds to prevent accidental alarm trigger
              </p>

              {telemetry.sosTriggered ? (
                <button
                  onClick={() => broadcastTelemetry({ sosTriggered: false })}
                  style={{
                    backgroundColor: '#B91C1C',
                    color: '#FAF6EE',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Dismiss Emergency SOS
                </button>
              ) : (
                <button
                  onMouseDown={startSosHold}
                  onMouseUp={cancelSosHold}
                  onMouseLeave={cancelSosHold}
                  onTouchStart={startSosHold}
                  onTouchEnd={cancelSosHold}
                  style={{
                    backgroundColor: sosHolding ? '#B91C1C' : '#064E3B',
                    color: '#FAF6EE',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {sosHolding ? 'HOLDING... (Keep pressed for 3s)' : 'PRESS & HOLD SOS'}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Right: Live Diagnostics & Telemetry Packet Log */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Status Box */}
          <div style={{
            backgroundColor: '#FDFBF7',
            borderRadius: '20px',
            border: '1px solid #EEDCC0',
            padding: '20px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#064E3B', marginBottom: '10px' }}>
              Broadcast Log
            </h3>
            <p style={{ fontSize: '12px', color: '#4B5563', fontFamily: 'monospace', backgroundColor: '#FAF6EE', padding: '10px', borderRadius: '8px' }}>
              {lastLog}
            </p>
          </div>

          {/* Inbound App Commands */}
          <div style={{
            backgroundColor: '#FDFBF7',
            borderRadius: '20px',
            border: '1px solid #EEDCC0',
            padding: '20px',
            flex: 1,
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#064E3B', marginBottom: '10px' }}>
              Inbound Commands from Mobile App
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {receivedCommands.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#7D8882', fontStyle: 'italic' }}>
                  No commands received yet. (Use the mobile app to trigger an audible chime or lock).
                </p>
              ) : (
                receivedCommands.map((cmd, idx) => (
                  <div key={idx} style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    padding: '6px 10px',
                    backgroundColor: '#FAF6EE',
                    border: '1px solid #EEDCC0',
                    borderRadius: '6px',
                    color: '#064E3B',
                  }}>
                    {cmd}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Packet JSON Preview */}
          <div style={{
            backgroundColor: '#0F1F1A',
            color: '#FAF6EE',
            borderRadius: '20px',
            padding: '16px',
            fontFamily: 'monospace',
            fontSize: '11px',
            overflowX: 'auto',
          }}>
            <div style={{ color: '#10B981', fontWeight: 700, marginBottom: '6px' }}>
              TELEMETRY PACKET BUFFER
            </div>
            <pre style={{ margin: 0 }}>
              {JSON.stringify(telemetry, null, 2)}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
