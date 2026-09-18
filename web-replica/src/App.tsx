import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  BatteryMedium,
  Droplets,
  Scale,
  AlertTriangle,
  Send,
  Lock,
  Unlock,
  Radio,
  Wifi,
  Flame,
  Volume2,
  Box,
  Image as ImageIcon,
} from 'lucide-react';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://mlfkgcriezxzyapjixip.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sZmtnY3JpZXhnenlhcGppeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NzY4MDIsImV4cCI6MjEwNTA1MjgwMn0.GnLZJ6ImOewz9BqiosxqAt2moH_UAIsY0uXHJFy7rA4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface BagModelDef {
  id: string;
  name: string;
  model: string;
  colorName: string;
  image: string;
  modelGlb: string;
  role: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
}

const BAG_MODELS: BagModelDef[] = [
  {
    id: 'bag-01',
    name: 'Executive Smart Pack',
    model: 'Model EXP-01 • Carbon Weave',
    colorName: 'Imperial Emerald',
    image: '/image1.png',
    modelGlb: '/models/sentia_exp01.glb',
    role: 'primary',
  },
  {
    id: 'bag-02',
    name: 'Weekender Travel Duffel',
    model: 'Model WKD-02 • Ballistic Canvas',
    colorName: 'Porcelain Sand',
    image: '/image4.png',
    modelGlb: '/models/sentia_wkd02.glb',
    role: 'secondary',
  },
  {
    id: 'bag-03',
    name: 'Leather Crossbody Purse',
    model: 'Model CRB-03 • Saddle Tan',
    colorName: 'Cognac Saddle',
    image: '/image3.png',
    modelGlb: '/models/sentia_crb03.glb',
    role: 'tertiary',
  },
  {
    id: 'bag-04',
    name: 'Smart Commuter Sling',
    model: 'Model SLG-04 • Aerodynamic Carbon',
    colorName: 'Obsidian Carbon',
    image: '/image5.png',
    modelGlb: '/models/sentia_slg04.glb',
    role: 'quaternary',
  },
];

interface BagHardwareState {
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
  isLocked: boolean;
  lumbarHeatActive: boolean;
  isPairingMode: boolean;
}

const INITIAL_HARDWARE_MAP: Record<string, BagHardwareState> = {
  'bag-01': {
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
    isLocked: true,
    lumbarHeatActive: false,
    isPairingMode: false,
  },
  'bag-02': {
    bagId: 'bag-02',
    batteryLevel: 94,
    isCharging: false,
    zipperClosed: true,
    bottleInserted: false,
    weightKg: 4.8,
    internalTempC: 22.0,
    humidityPct: 50,
    bleRssi: -64,
    tamperDetected: false,
    sosTriggered: false,
    isLocked: true,
    lumbarHeatActive: false,
    isPairingMode: false,
  },
  'bag-03': {
    bagId: 'bag-03',
    batteryLevel: 72,
    isCharging: false,
    zipperClosed: true,
    bottleInserted: false,
    weightKg: 1.1,
    internalTempC: 21.8,
    humidityPct: 48,
    bleRssi: -72,
    tamperDetected: false,
    sosTriggered: false,
    isLocked: false,
    lumbarHeatActive: false,
    isPairingMode: false,
  },
  'bag-04': {
    bagId: 'bag-04',
    batteryLevel: 98,
    isCharging: false,
    zipperClosed: true,
    bottleInserted: false,
    weightKg: 0.9,
    internalTempC: 22.8,
    humidityPct: 46,
    bleRssi: -52,
    tamperDetected: false,
    sosTriggered: false,
    isLocked: true,
    lumbarHeatActive: false,
    isPairingMode: false,
  },
};

// Web Audio API Acoustic Buzzer Synthesizer
const playBuzzerChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
      gain.gain.setValueAtTime(0.28, audioCtx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + start);
      osc.stop(audioCtx.currentTime + start + duration);
    };

    // Dual-frequency locator pattern (880Hz / 1760Hz)
    playTone(880, 0, 0.14);
    playTone(1760, 0.16, 0.22);
    playTone(880, 0.42, 0.14);
    playTone(1760, 0.58, 0.32);
  } catch (err) {
    console.error('Audio synthesizer error:', err);
  }
};

export default function App() {
  const [activeBagId, setActiveBagId] = useState<string>('bag-01');
  const [hardwareMap, setHardwareMap] = useState<Record<string, BagHardwareState>>(INITIAL_HARDWARE_MAP);
  const [connected, setConnected] = useState(false);
  const [twinViewMode, setTwinViewMode] = useState<'2d' | '3d'>('2d');
  const [lastLog, setLastLog] = useState<string>('Simulator initialized. Subscribing to Supabase Realtime channels...');
  const [receivedCommands, setReceivedCommands] = useState<string[]>([]);
  const [sosHolding, setSosHolding] = useState(false);
  const sosHoldTimer = useRef<any>(null);
  const telemetryChannelsRef = useRef<Record<string, any>>({});

  const activeDef = BAG_MODELS.find((b) => b.id === activeBagId) || BAG_MODELS[0];
  const activeBag = hardwareMap[activeBagId] || INITIAL_HARDWARE_MAP['bag-01'];

  // Subscribe to bidirectional commands and pre-warm telemetry channels for all 3 bags
  useEffect(() => {
    // Pre-subscribe telemetry channels for 0ms broadcast delay
    BAG_MODELS.forEach((bagDef) => {
      const telemChannel = supabase.channel(`telemetry:${bagDef.id}`).subscribe();
      telemetryChannelsRef.current[bagDef.id] = telemChannel;
    });

    const commandChannels = BAG_MODELS.map((bagDef) => {
      return supabase
        .channel(`commands:${bagDef.id}`)
        .on('broadcast', { event: 'hardware_command' }, (payload) => {
          const cmd = payload.payload;
          const timestamp = new Date().toLocaleTimeString();
          const logEntry = `[${timestamp}] [${bagDef.id.toUpperCase()}] RECV: ${cmd.command} ${JSON.stringify(cmd.params || '')}`;

          setReceivedCommands((prev) => [logEntry, ...prev.slice(0, 10)]);

          if (cmd.command === 'SOUND_ALARM') {
            playBuzzerChime();
            setLastLog(`Buzzer locator chime activated for ${bagDef.name}`);
          } else if (cmd.command === 'LOCK') {
            setHardwareMap((prev) => ({
              ...prev,
              [bagDef.id]: { ...prev[bagDef.id], isLocked: true, zipperClosed: true },
            }));
            setLastLog(`Cryptographic lock engaged on ${bagDef.name}`);
          } else if (cmd.command === 'UNLOCK') {
            setHardwareMap((prev) => ({
              ...prev,
              [bagDef.id]: { ...prev[bagDef.id], isLocked: false },
            }));
            setLastLog(`Lock disengaged on ${bagDef.name}`);
          } else if (cmd.command === 'HEAT_ON') {
            setHardwareMap((prev) => ({
              ...prev,
              [bagDef.id]: { ...prev[bagDef.id], lumbarHeatActive: true },
            }));
            setLastLog(`40C lumbar thermal heat pouch activated on ${bagDef.name}`);
          } else if (cmd.command === 'HEAT_OFF') {
            setHardwareMap((prev) => ({
              ...prev,
              [bagDef.id]: { ...prev[bagDef.id], lumbarHeatActive: false },
            }));
            setLastLog(`Lumbar thermal heat pouch deactivated on ${bagDef.name}`);
          } else if (cmd.command === 'DISMISS_ALARM') {
            setHardwareMap((prev) => ({
              ...prev,
              [bagDef.id]: {
                ...prev[bagDef.id],
                sosTriggered: false,
                tamperDetected: false,
              },
            }));
            setLastLog(`Locator alarm dismissed on ${bagDef.name}`);
          } else if (cmd.command === 'LED_COLOR') {
            const color = cmd.color || cmd.payload?.color || '#10B981';
            setLastLog(`LED ambient smart ring color updated (${color}) on ${bagDef.name}`);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnected(true);
          }
        });
    });

    return () => {
      commandChannels.forEach((ch) => supabase.removeChannel(ch));
      Object.values(telemetryChannelsRef.current).forEach((ch) => supabase.removeChannel(ch));
    };
  }, []);

  // Broadcast function for a specific bag
  const broadcastBagTelemetry = async (bagId: string, updated?: Partial<BagHardwareState>) => {
    setHardwareMap((prev) => {
      const current = prev[bagId] || INITIAL_HARDWARE_MAP[bagId];
      const next = { ...current, ...updated };

      // Dispatch payload to Supabase Realtime channel
      const channel = telemetryChannelsRef.current[bagId] || supabase.channel(`telemetry:${bagId}`);
      channel
        .send({
          type: 'broadcast',
          event: 'live_telemetry',
          payload: {
            bag_id: next.bagId,
            battery_level: next.batteryLevel,
            is_charging: next.isCharging,
            zipper_closed: next.zipperClosed,
            bottle_inserted: next.bottleInserted,
            weight_kg: next.weightKg,
            internal_temp_c: next.internalTempC,
            humidity_pct: next.humidityPct,
            ble_rssi: next.bleRssi,
            tamper_detected: next.tamperDetected,
            sos_triggered: next.sosTriggered,
            is_locked: next.isLocked,
            lumbar_heat_active: next.lumbarHeatActive,
            is_pairing_mode: next.isPairingMode,
            recorded_at: new Date().toISOString(),
          },
        })
        .then(() => {
          setLastLog(`Broadcasted ${bagId.toUpperCase()} at ${new Date().toLocaleTimeString()} (Battery: ${next.batteryLevel}%, Weight: ${next.weightKg}kg)`);
        })
        .catch((err: any) => {
          setLastLog(`Broadcast error: ${String(err)}`);
        });

      return { ...prev, [bagId]: next };
    });
  };

  // Heartbeat loop: periodically pulses live telemetry for all 3 bags
  useEffect(() => {
    const timer = setInterval(() => {
      BAG_MODELS.forEach((bagDef) => {
        const bagState = hardwareMap[bagDef.id];
        if (bagState) {
          const channel = telemetryChannelsRef.current[bagDef.id] || supabase.channel(`telemetry:${bagDef.id}`);
          channel.send({
            type: 'broadcast',
            event: 'live_telemetry',
            payload: {
              bag_id: bagState.bagId,
              battery_level: bagState.batteryLevel,
              is_charging: bagState.isCharging,
              zipper_closed: bagState.zipperClosed,
              bottle_inserted: bagState.bottleInserted,
              weight_kg: bagState.weightKg,
              internal_temp_c: bagState.internalTempC,
              humidity_pct: bagState.humidityPct,
              ble_rssi: bagState.bleRssi,
              tamper_detected: bagState.tamperDetected,
              sos_triggered: bagState.sosTriggered,
              is_locked: bagState.isLocked,
              lumbar_heat_active: bagState.lumbarHeatActive,
              is_pairing_mode: bagState.isPairingMode,
              recorded_at: new Date().toISOString(),
            },
          });
        }
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [hardwareMap]);

  // SOS Hold Handler
  const startSosHold = () => {
    setSosHolding(true);
    sosHoldTimer.current = setTimeout(() => {
      broadcastBagTelemetry(activeBagId, { sosTriggered: true });
      setLastLog(`EMERGENCY SOS DISPATCH TRIGGERED ON ${activeBagId.toUpperCase()}`);
      setSosHolding(false);
    }, 3000);
  };

  const cancelSosHold = () => {
    if (sosHoldTimer.current) clearTimeout(sosHoldTimer.current);
    setSosHolding(false);
  };

  const togglePairingMode = () => {
    const nextState = !activeBag.isPairingMode;
    broadcastBagTelemetry(activeBagId, { isPairingMode: nextState });
    if (nextState) {
      setLastLog(`${activeBagId.toUpperCase()} is now advertising 2.4GHz BLE pairing beacon (Ready for phone bonding).`);
    } else {
      setLastLog(`${activeBagId.toUpperCase()} exited pairing mode.`);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/logo.png" alt="Sentia Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#064E3B', letterSpacing: '0.8px', margin: 0 }}>
              SENTIA HARDWARE DIGITAL TWIN
            </h1>
            <p style={{ fontSize: '12px', color: '#7D8882', margin: '2px 0 0 0' }}>
              Multi-Device Realtime Cloud Simulation Console • 4-Bag Ecosystem
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            onClick={() => broadcastBagTelemetry(activeBagId)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#064E3B',
              color: '#FAF6EE',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Send size={13} />
            Force Sync
          </button>
        </div>
      </header>

      {/* 4-Bag Selector Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '24px',
      }}>
        {BAG_MODELS.map((b) => {
          const state = hardwareMap[b.id];
          const isSelected = b.id === activeBagId;

          return (
            <div
              key={b.id}
              onClick={() => setActiveBagId(b.id)}
              style={{
                backgroundColor: isSelected ? '#064E3B' : '#FDFBF7',
                border: isSelected ? '1.5px solid #064E3B' : '1px solid #EEDCC0',
                borderRadius: '18px',
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: isSelected ? '0 6px 18px rgba(6, 78, 59, 0.16)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={b.image}
                  alt={b.name}
                  style={{ width: '42px', height: '42px', objectFit: 'contain' }}
                />
                <div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isSelected ? '#FAF6EE' : '#0F1F1A',
                  }}>
                    {b.name}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: isSelected ? '#D1FAE5' : '#7D8882',
                  }}>
                    {b.model}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: isSelected ? '#FAF6EE' : '#064E3B',
                }}>
                  {state.batteryLevel}%
                </div>
                <div style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: state.isPairingMode
                    ? (isSelected ? '#93C5FD' : '#2563EB')
                    : (isSelected ? '#A7F3D0' : '#10B981'),
                  textTransform: 'uppercase',
                }}>
                  {state.isPairingMode ? 'PAIRING BEACON' : 'CONNECTED'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Simulation Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '24px' }}>
        {/* Left: Active Hardware Controls */}
        <section style={{
          backgroundColor: '#FDFBF7',
          borderRadius: '24px',
          border: '1px solid #EEDCC0',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(6, 78, 59, 0.04)',
        }}>
          {/* Active Bag Top Info Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F1F1A', margin: 0 }}>
                {activeDef.name}
              </h2>
              <span style={{ fontSize: '12px', color: '#7D8882' }}>
                {activeDef.model} • Colorway: {activeDef.colorName}
              </span>
            </div>

            {/* BLE Pairing Mode Button */}
            <button
              onClick={togglePairingMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '999px',
                border: '1.5px solid ' + (activeBag.isPairingMode ? '#2563EB' : '#EEDCC0'),
                backgroundColor: activeBag.isPairingMode ? '#EFF6FF' : '#FFFFFF',
                color: activeBag.isPairingMode ? '#1D4ED8' : '#064E3B',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Radio size={14} color={activeBag.isPairingMode ? '#1D4ED8' : '#064E3B'} />
              {activeBag.isPairingMode ? 'BLE Pairing Active' : 'Start BLE Pairing'}
            </button>
          </div>

          {/* Bag Image / 3D Model with Simulated LED Smart Rim */}
          <div style={{
            position: 'relative',
            backgroundColor: '#FAF6EE',
            borderRadius: '20px',
            padding: '24px 20px 36px 20px',
            textAlign: 'center',
            marginBottom: '24px',
            border: '1px solid #EEDCC0',
            minHeight: '230px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Floating 3D/2D Toggle Badge (Exclusive to EXP-01 and CRB-03) */}
            {(activeDef.id === 'bag-01' || activeDef.id === 'bag-03') && (
              <button
                type="button"
                onClick={() => setTwinViewMode((prev) => (prev === '2d' ? '3d' : '2d'))}
                title={twinViewMode === '3d' ? 'Switch to 2D studio photo' : 'Switch to 3D interactive model'}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '14px',
                  zIndex: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: 'rgba(250, 246, 238, 0.94)',
                  border: '1px solid rgba(6, 78, 59, 0.16)',
                  padding: '5px 10px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(6, 78, 59, 0.08)',
                  color: '#064E3B',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.4px',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  transition: 'all 0.18s ease',
                }}
              >
                {twinViewMode === '3d' ? (
                  <>
                    <ImageIcon size={12} color="#064E3B" />
                    <span>2D</span>
                  </>
                ) : (
                  <>
                    <Box size={12} color="#064E3B" />
                    <span>3D</span>
                  </>
                )}
              </button>
            )}

            {(activeDef.id === 'bag-01' || activeDef.id === 'bag-03') && twinViewMode === '3d' ? (
              <model-viewer
                key={activeDef.id}
                src={activeDef.modelGlb}
                camera-controls
                auto-rotate
                auto-rotate-delay="800"
                rotation-per-second="18deg"
                shadow-intensity="1.3"
                shadow-softness="0.75"
                exposure="1.08"
                environment-image="neutral"
                style={{ width: '100%', height: '210px', margin: '0 auto', display: 'block', backgroundColor: 'transparent' }}
              />
            ) : (
              <img
                src={activeDef.image}
                alt={activeDef.name}
                style={{ maxHeight: '185px', margin: '0 auto', display: 'block', objectFit: 'contain' }}
              />
            )}

            {/* Hardware Status Ribbons */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}>
              <div style={{
                padding: '4px 14px',
                borderRadius: '999px',
                backgroundColor: activeBag.sosTriggered
                  ? '#B91C1C'
                  : (activeBag.tamperDetected ? '#D97706' : '#10B981'),
                color: '#FAF6EE',
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.6px',
                boxShadow: activeBag.sosTriggered ? '0 0 14px #B91C1C' : 'none',
              }}>
                LED RIM: {activeBag.sosTriggered ? 'SOS RED STROBE' : (activeBag.tamperDetected ? 'TAMPER AMBER' : 'EMERALD SECURE')}
              </div>

              {activeBag.lumbarHeatActive && (
                <div style={{
                  padding: '4px 12px',
                  borderRadius: '999px',
                  backgroundColor: '#92400E',
                  color: '#FAF6EE',
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <Flame size={12} color="#FAF6EE" />
                  40C LUMBAR HEAT ACTIVE
                </div>
              )}
            </div>
          </div>

          {/* Control Sliders & Switches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* 1. Battery Level & Charging */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: '#0F1F1A' }}>
                  <BatteryMedium size={16} color="#064E3B" />
                  Battery Level: {activeBag.batteryLevel}%
                </span>
                <label style={{ fontSize: '12px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={activeBag.isCharging}
                    onChange={(e) => broadcastBagTelemetry(activeBagId, { isCharging: e.target.checked })}
                  />
                  USB-C Fast Charging
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeBag.batteryLevel}
                onChange={(e) => broadcastBagTelemetry(activeBagId, { batteryLevel: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#064E3B' }}
              />
            </div>

            {/* 2. Lock & Zipper Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => broadcastBagTelemetry(activeBagId, { isLocked: !activeBag.isLocked })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #EEDCC0',
                  backgroundColor: activeBag.isLocked ? '#FAF6EE' : '#FEF3C7',
                  color: '#0F1F1A',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {activeBag.isLocked ? <Lock size={15} color="#064E3B" /> : <Unlock size={15} color="#D97706" />}
                Lock: {activeBag.isLocked ? 'Armed (Locked)' : 'Disarmed'}
              </button>

              <button
                onClick={() => broadcastBagTelemetry(activeBagId, { zipperClosed: !activeBag.zipperClosed })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #EEDCC0',
                  backgroundColor: activeBag.zipperClosed ? '#FAF6EE' : '#FEE2E2',
                  color: '#0F1F1A',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Zipper: {activeBag.zipperClosed ? 'Closed & Sealed' : 'Unzipped (Open)'}
              </button>
            </div>

            {/* 3. Hydration Bottle & BLE RSSI */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => broadcastBagTelemetry(activeBagId, { bottleInserted: !activeBag.bottleInserted })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #EEDCC0',
                  backgroundColor: activeBag.bottleInserted ? '#FAF6EE' : '#F3F4F6',
                  color: '#0F1F1A',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Droplets size={15} color={activeBag.bottleInserted ? '#064E3B' : '#9CA3AF'} />
                Flask: {activeBag.bottleInserted ? 'Docked (Full)' : 'Pocket Empty'}
              </button>

              <div style={{
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #EEDCC0',
                backgroundColor: '#FAF6EE',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#7D8882', marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Wifi size={12} color="#064E3B" /> BLE Signal
                  </span>
                  <span style={{ fontWeight: 700, color: '#0F1F1A' }}>{activeBag.bleRssi} dBm</span>
                </div>
                <input
                  type="range"
                  min="-90"
                  max="-35"
                  value={activeBag.bleRssi}
                  onChange={(e) => broadcastBagTelemetry(activeBagId, { bleRssi: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#064E3B' }}
                />
              </div>
            </div>

            {/* 4. Load Cell Weight Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: '#0F1F1A' }}>
                  <Scale size={16} color="#064E3B" />
                  Load Cell Weight: {activeBag.weightKg} kg
                </span>
                <span style={{ fontSize: '11px', color: activeBag.weightKg > 5.0 ? '#B91C1C' : '#7D8882', fontWeight: 600 }}>
                  {activeBag.weightKg > 5.0 ? 'HEAVY LOAD WARNING' : 'Optimal Carry Load'}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.1"
                value={activeBag.weightKg}
                onChange={(e) => broadcastBagTelemetry(activeBagId, { weightKg: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#064E3B' }}
              />
            </div>

            {/* 5. Temperature & Humidity Sliders */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  <span>Internal Temp</span>
                  <span style={{ color: '#064E3B' }}>{activeBag.internalTempC} C</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  step="0.5"
                  value={activeBag.internalTempC}
                  onChange={(e) => broadcastBagTelemetry(activeBagId, { internalTempC: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#064E3B' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  <span>Humidity</span>
                  <span style={{ color: '#064E3B' }}>{activeBag.humidityPct}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="95"
                  value={activeBag.humidityPct}
                  onChange={(e) => broadcastBagTelemetry(activeBagId, { humidityPct: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#064E3B' }}
                />
              </div>
            </div>

            {/* 6. Gyroscope Anti-Tamper Trigger */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px',
              backgroundColor: '#FAF6EE',
              borderRadius: '12px',
              border: '1px solid #EEDCC0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color={activeBag.tamperDetected ? '#D97706' : '#7D8882'} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Gyroscope Anti-Tamper Trigger</div>
                  <div style={{ fontSize: '11px', color: '#7D8882' }}>Simulates unauthorized bag displacement</div>
                </div>
              </div>
              <button
                onClick={() => broadcastBagTelemetry(activeBagId, { tamperDetected: !activeBag.tamperDetected })}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: '1px solid #EEDCC0',
                  backgroundColor: activeBag.tamperDetected ? '#D97706' : '#FAF6EE',
                  color: activeBag.tamperDetected ? '#FAF6EE' : '#0F1F1A',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {activeBag.tamperDetected ? 'Tamper Active' : 'Trip Sensor'}
              </button>
            </div>

            {/* 7. 3-Second SOS Emergency Button */}
            <div style={{
              padding: '16px',
              backgroundColor: activeBag.sosTriggered ? '#FEE2E2' : '#FAF6EE',
              borderRadius: '16px',
              border: '1px solid ' + (activeBag.sosTriggered ? '#B91C1C' : '#EEDCC0'),
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 800,
                color: activeBag.sosTriggered ? '#B91C1C' : '#0F1F1A',
                marginBottom: '4px',
              }}>
                {activeBag.sosTriggered ? 'SOS DISPATCH BROADCAST ACTIVE' : 'School / Personal Safety 3-Second SOS Trigger'}
              </div>
              <p style={{ fontSize: '11px', color: '#7D8882', margin: '0 0 12px 0' }}>
                Hold button for 3 seconds to prevent accidental alarm trigger
              </p>

              {activeBag.sosTriggered ? (
                <button
                  onClick={() => broadcastBagTelemetry(activeBagId, { sosTriggered: false })}
                  style={{
                    backgroundColor: '#B91C1C',
                    color: '#FAF6EE',
                    border: 'none',
                    padding: '8px 22px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 800,
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
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {sosHolding ? 'HOLDING... (Keep pressed for 3s)' : 'PRESS AND HOLD SOS (3s)'}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Right: Live Diagnostics, Inbound Commands & Audio Locator */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Audio Beeper Test Card */}
          <div style={{
            backgroundColor: '#FDFBF7',
            borderRadius: '20px',
            border: '1px solid #EEDCC0',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={18} color="#064E3B" />
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#064E3B', margin: 0 }}>
                  Acoustic Hardware Chime Synthesizer
                </h3>
              </div>
              <button
                onClick={playBuzzerChime}
                style={{
                  padding: '4px 12px',
                  borderRadius: '999px',
                  backgroundColor: '#FAF6EE',
                  border: '1px solid #EEDCC0',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#064E3B',
                  cursor: 'pointer',
                }}
              >
                Test Chime
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#7D8882', margin: 0 }}>
              Synthesizes physical dual-tone sound waves (880Hz / 1760Hz) when the mobile app taps Sound Buzzer on Bag Radar.
            </p>
          </div>

          {/* Broadcast Status Log */}
          <div style={{
            backgroundColor: '#FDFBF7',
            borderRadius: '20px',
            border: '1px solid #EEDCC0',
            padding: '20px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#064E3B', margin: '0 0 10px 0' }}>
              Cloud Broadcast Status
            </h3>
            <p style={{
              fontSize: '11px',
              color: '#374151',
              fontFamily: 'monospace',
              backgroundColor: '#FAF6EE',
              padding: '10px 12px',
              borderRadius: '8px',
              margin: 0,
              wordBreak: 'break-word',
            }}>
              {lastLog}
            </p>
          </div>

          {/* Inbound Phone Commands */}
          <div style={{
            backgroundColor: '#FDFBF7',
            borderRadius: '20px',
            border: '1px solid #EEDCC0',
            padding: '20px',
            flex: 1,
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#064E3B', margin: '0 0 10px 0' }}>
              Inbound Commands from Phone
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {receivedCommands.length === 0 ? (
                <p style={{ fontSize: '11px', color: '#7D8882', fontStyle: 'italic', margin: 0 }}>
                  Awaiting phone actions. Tap Sound Buzzer, Toggle Lock, or Activate Lumbar Heat in the app.
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
            <div style={{ color: '#10B981', fontWeight: 800, marginBottom: '6px', letterSpacing: '0.5px' }}>
              LIVE TELEMETRY PACKET BUFFER ({activeBagId.toUpperCase()})
            </div>
            <pre style={{ margin: 0 }}>
              {JSON.stringify(activeBag, null, 2)}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
