import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  ShieldAlert, 
  Move, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Sliders, 
  Check, 
  X, 
  ExternalLink,
  Sparkles,
  Gauge,
  Maximize2,
  Tv,
  AlertCircle
} from 'lucide-react';
import { DlssSettings, PerformanceTelemetry, OverlayConfig, DlssMode, FrameGenMode, ReflexMode } from '../types/dlss';
import { 
  requestRealScreenCapturePermission, 
  launchRealFloatingWindow, 
  openAndroidSettings 
} from '../utils/realPermissions';

interface FloatingOverlayHUDProps {
  settings: DlssSettings;
  telemetry: PerformanceTelemetry;
  overlayConfig: OverlayConfig;
  onUpdateSettings: (updates: Partial<DlssSettings>) => void;
  onUpdateOverlay: (updates: Partial<OverlayConfig>) => void;
  onTriggerHaptic?: () => void;
}

export const FloatingOverlayHUD: React.FC<FloatingOverlayHUDProps> = ({
  settings,
  telemetry,
  overlayConfig,
  onUpdateSettings,
  onUpdateOverlay,
  onTriggerHaptic
}) => {
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [isDraggingBubble, setIsDraggingBubble] = useState<boolean>(false);
  const [bubblePos, setBubblePos] = useState(overlayConfig.bubblePosition);
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const [inGameSimulationActive, setInGameSimulationActive] = useState<boolean>(false);
  
  // Real native device permission feedback states
  const [realPermissionStatus, setRealPermissionStatus] = useState<string | null>(null);
  const [realPermissionError, setRealPermissionError] = useState<string | null>(null);
  const [screenCaptureActive, setScreenCaptureActive] = useState<boolean>(false);
  const [floatingWindowActive, setFloatingWindowActive] = useState<boolean>(false);

  const dragStartRef = useRef<{ x: number; y: number; startX: number; startY: number }>({
    x: 0,
    y: 0,
    startX: 0,
    startY: 0
  });

  const liveVideoRef = useRef<HTMLVideoElement>(null);

  // Real Native Permission Request: Screen Capture Overlay
  const handleRequestRealScreenPermission = async () => {
    onTriggerHaptic?.();
    setRealPermissionStatus('Requesting native device screen capture permission...');
    setRealPermissionError(null);

    const result = await requestRealScreenCapturePermission();
    if (result.granted && result.stream) {
      setRealPermissionStatus('Screen capture overlay permission granted by your system!');
      setScreenCaptureActive(true);
      onUpdateOverlay({ permissionGranted: true, active: true });

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = result.stream;
        liveVideoRef.current.play();
      }
    } else {
      setRealPermissionStatus(null);
      setRealPermissionError(result.error || 'Permission was dismissed or not granted by device.');
    }
  };

  // Real OS Floating Picture-in-Picture Window
  const handleLaunchRealFloatingWindow = async () => {
    onTriggerHaptic?.();
    setRealPermissionError(null);

    // Create a temporary canvas or find active canvas
    const canvas = document.querySelector('canvas') || document.createElement('canvas');
    if (!canvas.width) {
      canvas.width = 400;
      canvas.height = 240;
    }

    const res = await launchRealFloatingWindow(canvas);
    if (res.success) {
      setFloatingWindowActive(true);
      setRealPermissionStatus('Native OS Floating Window launched over other apps!');
      onUpdateOverlay({ active: true });
    } else {
      setRealPermissionError(res.error || 'Could not launch native floating window.');
    }
  };

  // Handle dragging floating bubble
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDraggingBubble(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: bubblePos.x,
      startY: bubblePos.y
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingBubble) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      
      const newX = Math.max(10, Math.min(window.innerWidth - 60, dragStartRef.current.startX + dx));
      const newY = Math.max(60, Math.min(window.innerHeight - 80, dragStartRef.current.startY + dy));

      setBubblePos({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      if (isDraggingBubble) {
        setIsDraggingBubble(false);
        onUpdateOverlay({ bubblePosition: bubblePos });
      }
    };

    if (isDraggingBubble) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingBubble, bubblePos, onUpdateOverlay]);

  const requestOverlayPermission = () => {
    onTriggerHaptic?.();
    setShowPermissionModal(true);
  };

  const confirmPermissionGrant = () => {
    onTriggerHaptic?.();
    onUpdateOverlay({ permissionGranted: true, active: true });
    setShowPermissionModal(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Overlay Status & Permission Card */}
      <div className="p-5 rounded-2xl glass-panel-elevated border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              overlayConfig.permissionGranted 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                System Overlay & In-Game HUD
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>SYSTEM_ALERT_WINDOW</span>
                <span>·</span>
                <span className={overlayConfig.permissionGranted ? 'text-emerald-400' : 'text-amber-400'}>
                  {overlayConfig.permissionGranted ? 'Permission Granted' : 'Requires Authorization'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Native Permission Status & Feedback Alerts */}
        {realPermissionStatus && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{realPermissionStatus}</span>
          </div>
        )}

        {realPermissionError && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1">
              <div>{realPermissionError}</div>
              <div className="text-[11px] text-amber-400/80 mt-0.5">
                Note: In compiled APK, this uses Android's native Settings.ACTION_MANAGE_OVERLAY_PERMISSION.
              </div>
            </div>
          </div>
        )}

        {/* Real Android Settings Redirection Buttons */}
        <div className="space-y-2.5 pt-1">
          <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span>Direct Android System Settings Redirection:</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Primary: Grant Permission to Display Over Other Apps */}
            <button
              onClick={() => {
                onTriggerHaptic?.();

                // 1. Check if inside compiled Android APK (AndroidBridge present)
                if (typeof window !== 'undefined' && (window as any).AndroidBridge?.openOverlaySettings) {
                  try {
                    (window as any).AndroidBridge.openOverlaySettings();
                    const isGranted = Boolean((window as any).AndroidBridge.isOverlayGranted?.());
                    onUpdateOverlay({ permissionGranted: isGranted });
                    setRealPermissionStatus(
                      isGranted 
                        ? 'Overlay permission verified active on your Android device!'
                        : 'Opened Android Settings > Display over other apps. Please toggle the switch to ON.'
                    );
                  } catch (e: any) {
                    setRealPermissionError('AndroidBridge Error: ' + e.message);
                  }
                  return;
                }

                // 2. Running in Web App / Browser (Not compiled APK)
                // Real Android OS SYSTEM_ALERT_WINDOW cannot be granted from a web page
                setRealPermissionStatus(null);
                setRealPermissionError(
                  "Android OS Restriction: Web browsers cannot grant 'android.permission.SYSTEM_ALERT_WINDOW' directly due to Android OS security sandbox rules. In the compiled APK on your phone, this opens native Settings. For web testing, launch the OS Floating PiP Window or Screen Capture below."
                );

                // Attempt Android Intent in case running on mobile Chrome with intent routing
                try {
                  const intentUri = 'intent:#Intent;action=android.settings.action.MANAGE_OVERLAY_PERMISSION;category=android.intent.category.DEFAULT;end';
                  const a = document.createElement('a');
                  a.href = intentUri;
                  a.target = '_top';
                  a.rel = 'noopener noreferrer';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                } catch (intentErr) {
                  console.warn('Intent dispatch error', intentErr);
                }
              }}
              className="py-3.5 px-5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 text-center"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>Grant Permission to Display Over Other Apps</span>
            </button>

            {/* Secondary: Android App Details & Settings */}
            <a
              href="intent:#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;data=package:com.stringai.dlss5;end"
              target="_top"
              rel="noopener noreferrer"
              onClick={() => {
                onTriggerHaptic?.();
                if (typeof window !== 'undefined' && (window as any).AndroidBridge?.openOverlaySettings) {
                  (window as any).AndroidBridge.openOverlaySettings();
                }
              }}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 transition-all border border-slate-700 flex items-center justify-center gap-2 text-center"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
              <span>Open Android App Permissions Settings</span>
            </a>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>Viewing in Preview? Open standalone to avoid iframe blocks:</span>
            <a
              href={window.location.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-semibold border border-emerald-500/30 hover:bg-emerald-500/30"
            >
              Open Full Standalone URL ↗
            </a>
          </div>
        </div>

        {/* Real Web OS Tools: Screen Capture & Native Floating Window */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="text-xs font-semibold text-slate-200">
            Or Use Live Web Engine Permissions:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleRequestRealScreenPermission}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Prompt Screen Capture Dialog</span>
            </button>

            <button
              onClick={handleLaunchRealFloatingWindow}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/40 transition-all flex items-center justify-center gap-2"
            >
              <Tv className="w-4 h-4" />
              <span>Launch Floating PiP Window</span>
            </button>
          </div>
        </div>

        {/* Live Real Screen Capture Preview if granted */}
        {screenCaptureActive && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Real Screen Feed Active (Pipe to DLSS 5 Engine)</span>
              </span>
              <button
                onClick={() => {
                  if (liveVideoRef.current && liveVideoRef.current.srcObject) {
                    (liveVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
                    setScreenCaptureActive(false);
                  }
                }}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Stop Feed
              </button>
            </div>
            <video
              ref={liveVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-44 rounded-lg object-contain bg-black border border-slate-800"
            />
          </div>
        )}

        {/* Configuration Options */}
        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="text-xs font-medium text-slate-200">Show Real-Time FPS Badge</div>
              <div className="text-[11px] text-slate-500">Render live 120Hz/144Hz counter on pill</div>
            </div>
            <button
              onClick={() => {
                onUpdateOverlay({ showFpsCounter: !overlayConfig.showFpsCounter });
                onTriggerHaptic?.();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                overlayConfig.showFpsCounter ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                overlayConfig.showFpsCounter ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="text-xs font-medium text-slate-200">Overlay Opacity</div>
              <div className="text-[11px] text-slate-500">Translucent frosted titanium glass</div>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              {Math.round(overlayConfig.opacity * 100)}%
            </span>
          </div>
        </div>

        {/* Launch In-Game Interactive Simulation */}
        <div className="pt-2">
          <button
            onClick={() => {
              setInGameSimulationActive(!inGameSimulationActive);
              if (!overlayConfig.active) {
                onUpdateOverlay({ active: true, permissionGranted: true });
              }
              onTriggerHaptic?.();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-purple-500/20 hover:from-emerald-500/30 hover:via-cyan-500/30 hover:to-purple-500/30 border border-emerald-500/40 text-xs font-semibold text-emerald-300 flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <Maximize2 className="w-4 h-4 text-emerald-400" />
            <span>{inGameSimulationActive ? 'Exit In-Game Simulation' : 'Test In-Game Live Overlay Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Floating Widget Drag Simulator Preview Area */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">Floating Pill Placement Preview</span>
          <span className="text-slate-500">Drag to reposition pill on screen</span>
        </div>

        <div className="relative w-full h-48 rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center">
          <div className="text-center space-y-1 pointer-events-none opacity-40">
            <div className="text-xs font-mono text-slate-400">Game Viewport Area (1080p Target)</div>
            <div className="text-[10px] text-slate-600">The floating pill stays pinned over all game frames</div>
          </div>

          {/* Interactive Floating Pill in Preview */}
          <div
            onClick={() => {
              setPanelOpen(!panelOpen);
              onTriggerHaptic?.();
            }}
            className="absolute cursor-pointer px-3 py-1.5 rounded-full bg-slate-900/95 border border-emerald-500/60 shadow-lg shadow-emerald-950/60 flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
            style={{
              top: '40px',
              right: '24px'
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-300">DLSS 5</span>
            {overlayConfig.showFpsCounter && (
              <span className="text-[11px] font-mono text-white font-semibold tabular-nums">
                {settings.enabled ? telemetry.fps : telemetry.baseFps} FPS
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actual Live Floating Overlay Bubble & Quick HUD (Simulated over screen) */}
      {(overlayConfig.active || inGameSimulationActive) && (
        <>
          {/* Draggable Floating Bubble */}
          <div
            onPointerDown={handlePointerDown}
            onClick={() => {
              if (!isDraggingBubble) {
                setPanelOpen(!panelOpen);
                onTriggerHaptic?.();
              }
            }}
            className="fixed z-50 cursor-grab active:cursor-grabbing px-3.5 py-2 rounded-full glass-panel-elevated border-2 border-emerald-400/80 shadow-2xl shadow-emerald-950/80 flex items-center gap-2.5 transition-transform select-none"
            style={{
              left: `${bubblePos.x}px`,
              top: `${bubblePos.y}px`,
              touchAction: 'none'
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-300">DLSS 5</span>
            {overlayConfig.showFpsCounter && (
              <span className="text-xs font-mono font-bold text-white tabular-nums">
                {settings.enabled ? telemetry.fps : telemetry.baseFps}
              </span>
            )}
            <Move className="w-3 h-3 text-slate-400" />
          </div>

          {/* Floating In-Game Quick Tweak HUD Panel */}
          {panelOpen && (
            <div
              className="fixed z-50 w-[320px] max-w-[90vw] rounded-2xl glass-panel-elevated border border-emerald-500/40 shadow-2xl p-4 space-y-4"
              style={{
                left: `${Math.min(bubblePos.x, window.innerWidth - 340)}px`,
                top: `${Math.min(bubblePos.y + 45, window.innerHeight - 380)}px`
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-100">DLSS 5 Quick Tweak</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-emerald-400">
                    {telemetry.totalLatencyMs.toFixed(1)}ms
                  </span>
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Master String AI Toggle */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <div>
                  <div className="text-xs font-medium text-slate-200">Neural Rendering</div>
                  <div className="text-[10px] text-slate-400">String AI Active Synthesis</div>
                </div>
                <button
                  onClick={() => {
                    onUpdateSettings({ enabled: !settings.enabled });
                    onTriggerHaptic?.();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    settings.enabled 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {settings.enabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Mode Selector */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Quality Preset
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(['performance', 'balanced', 'quality', 'dlaa'] as DlssMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        onUpdateSettings({ mode: m });
                        onTriggerHaptic?.();
                      }}
                      className={`py-1.5 rounded-lg text-[10px] font-semibold uppercase transition-all ${
                        settings.mode === m
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {m === 'dlaa' ? 'DLAA' : m.slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Generation Selector */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Frame Generation</span>
                  <span className="text-cyan-400">{settings.frameGeneration.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(['off', '2x', '3x', '4x'] as FrameGenMode[]).map((fg) => (
                    <button
                      key={fg}
                      onClick={() => {
                        onUpdateSettings({ frameGeneration: fg });
                        onTriggerHaptic?.();
                      }}
                      className={`py-1.5 rounded-lg text-[10px] font-semibold uppercase transition-all ${
                        settings.frameGeneration === fg
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {fg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Low Latency Reflex Boost */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Reflex Latency</span>
                  <span className="text-purple-400">{settings.reflexLatency.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['off', 'on', 'boost'] as ReflexMode[]).map((ref) => (
                    <button
                      key={ref}
                      onClick={() => {
                        onUpdateSettings({ reflexLatency: ref });
                        onTriggerHaptic?.();
                      }}
                      className={`py-1.5 rounded-lg text-[10px] font-semibold uppercase transition-all ${
                        settings.reflexLatency === ref
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {ref}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sharpness Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>String AI Sharpness</span>
                  <span className="font-mono text-emerald-400">{settings.sharpness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sharpness}
                  onChange={(e) => onUpdateSettings({ sharpness: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Permission Request Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl glass-panel-elevated border border-slate-700 p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">
                Enable "Draw Over Other Apps"
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                To allow DLSS 5 String AI to upscale graphics in real-time while you play games, 
                Android requires overlay permission (<code className="text-emerald-400 font-mono text-[10px]">android.permission.SYSTEM_ALERT_WINDOW</code>).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero background telemetry or ad trackers</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Direct hardware NPU acceleration overlay</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmPermissionGrant}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-950"
              >
                Grant Permission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
