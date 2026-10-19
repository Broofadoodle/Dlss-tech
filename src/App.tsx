import React, { useState, useEffect, useCallback } from 'react';
import { 
  DlssSettings, 
  PerformanceTelemetry, 
  OverlayConfig, 
  NotificationControlState 
} from './types/dlss';
import { InteractiveNeuralCanvas } from './components/InteractiveNeuralCanvas';
import { FloatingOverlayHUD } from './components/FloatingOverlayHUD';
import { NotificationBarControl } from './components/NotificationBarControl';
import { NeuralEngineControls } from './components/NeuralEngineControls';
import { GameProfilesManager } from './components/GameProfilesManager';
import { ApkCompilerGuide } from './components/ApkCompilerGuide';
import { TopMobileHeader } from './components/TopMobileHeader';
import { BottomTabBar, ActiveTab } from './components/BottomTabBar';
import { 
  Sparkles, 
  Layers, 
  BellRing, 
  Gamepad2, 
  Github, 
  Sliders, 
  Zap, 
  ShieldCheck, 
  RotateCcw,
  Smartphone,
  Monitor
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('viewport');
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);

  // Settings State
  const [settings, setSettings] = useState<DlssSettings>({
    enabled: true,
    mode: 'quality',
    stringAiIntensity: 80,
    rayReconstruction: true,
    motionVectors: true,
    frameGeneration: '2x',
    reflexLatency: 'boost',
    sharpness: 65,
    hdrToneMapping: true,
    subSurfaceScattering: true,
    npuProfile: 'balanced',
    targetFPS: 120,
    resolutionScale: 67,
    showMotionVectorsDebug: false,
    activeSceneId: 'cyberpunk'
  });

  // Overlay State
  const [overlayConfig, setOverlayConfig] = useState<OverlayConfig>({
    permissionGranted: true,
    active: false,
    bubblePosition: { x: 24, y: 160 },
    bubbleCollapsed: false,
    opacity: 0.92,
    showFpsCounter: true,
    showMiniGraph: true
  });

  // Notification Shade State
  const [notificationState, setNotificationState] = useState<NotificationControlState>({
    permission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'granted',
    persistentEnabled: true,
    shadeOpen: false,
    lastUpdated: Date.now()
  });

  // Dynamic Telemetry State (Computed in real time based on settings)
  const [telemetry, setTelemetry] = useState<PerformanceTelemetry>({
    fps: 124,
    baseFps: 42,
    frameTimeMs: 8.06,
    renderLatencyMs: 2.1,
    aiTensorPassMs: 1.4,
    totalLatencyMs: 3.8,
    vramSavedMb: 840,
    npuUtilization: 78,
    powerDrawWatts: 3.2,
    neuralWeightsLoaded: 48.2
  });

  // Haptic feedback trigger
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch (e) {
        // Ignored
      }
    }
  }, []);

  // Update Telemetry based on settings
  useEffect(() => {
    const updateMetrics = () => {
      let base = 42;
      let multiplier = 1;

      if (!settings.enabled) {
        setTelemetry({
          fps: base,
          baseFps: base,
          frameTimeMs: 1000 / base,
          renderLatencyMs: 14.2,
          aiTensorPassMs: 0.1,
          totalLatencyMs: 18.4,
          vramSavedMb: 0,
          npuUtilization: 6,
          powerDrawWatts: 4.8,
          neuralWeightsLoaded: 48.2
        });
        return;
      }

      // Mode multipliers
      if (settings.mode === 'ultra_performance') multiplier = 2.4;
      else if (settings.mode === 'performance') multiplier = 2.0;
      else if (settings.mode === 'balanced') multiplier = 1.7;
      else if (settings.mode === 'quality') multiplier = 1.45;
      else if (settings.mode === 'dlaa') multiplier = 1.1;

      // Frame generation multiplier
      if (settings.frameGeneration === '2x') multiplier *= 1.95;
      else if (settings.frameGeneration === '3x') multiplier *= 2.85;
      else if (settings.frameGeneration === '4x') multiplier *= 3.75;

      const targetCalculatedFps = Math.min(settings.targetFPS, Math.round(base * multiplier));
      const jitter = Math.floor(Math.random() * 3) - 1;
      const finalFps = Math.max(30, targetCalculatedFps + jitter);

      let latency = 8.5;
      if (settings.reflexLatency === 'boost') latency = 3.6 + Math.random() * 0.4;
      else if (settings.reflexLatency === 'on') latency = 5.2 + Math.random() * 0.5;
      else latency = 11.4;

      let vram = 450;
      if (settings.mode === 'ultra_performance') vram = 1120;
      else if (settings.mode === 'performance') vram = 980;
      else if (settings.mode === 'quality') vram = 840;

      let npu = 65;
      if (settings.npuProfile === 'overclock') npu = 92;
      else if (settings.npuProfile === 'efficient') npu = 48;

      setTelemetry({
        fps: finalFps,
        baseFps: base,
        frameTimeMs: 1000 / finalFps,
        renderLatencyMs: latency * 0.4,
        aiTensorPassMs: 1.2 + (settings.stringAiIntensity * 0.005),
        totalLatencyMs: latency,
        vramSavedMb: vram,
        npuUtilization: npu,
        powerDrawWatts: settings.npuProfile === 'efficient' ? 2.1 : settings.npuProfile === 'overclock' ? 4.7 : 3.3,
        neuralWeightsLoaded: 48.2
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1200);
    return () => clearInterval(interval);
  }, [settings]);

  const handleUpdateSettings = (updates: Partial<DlssSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleUpdateOverlay = (updates: Partial<OverlayConfig>) => {
    setOverlayConfig(prev => ({ ...prev, ...updates }));
  };

  const handleUpdateNotificationState = (updates: Partial<NotificationControlState>) => {
    setNotificationState(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Mobile Status Header */}
      <TopMobileHeader
        settings={settings}
        telemetry={telemetry}
        notificationState={notificationState}
        overlayConfig={overlayConfig}
        onToggleShade={() => {
          handleUpdateNotificationState({ shadeOpen: !notificationState.shadeOpen });
        }}
        onTriggerHaptic={triggerHaptic}
      />

      {/* Main Responsive Body Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-8">
        {/* Desktop Split View vs Mobile Tabbed View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Visualizer & Live Interactive Engine (Dominant Visual Anchor) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5">
            {/* Real-time WebGL/2D Neural Canvas */}
            <InteractiveNeuralCanvas
              settings={settings}
              telemetry={telemetry}
              onUpdateSettings={handleUpdateSettings}
              onTriggerHaptic={triggerHaptic}
            />

            {/* Quick Engine Status Bar */}
            <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-200">String AI Active</span>
                <span className="text-slate-500">·</span>
                <span className="font-mono text-emerald-400 capitalize">{settings.mode} Mode</span>
              </div>

              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                <span>NPU: {telemetry.npuUtilization}%</span>
                <span>·</span>
                <span>Reflex: {settings.reflexLatency.toUpperCase()}</span>
                <span>·</span>
                <span>{telemetry.powerDrawWatts.toFixed(1)}W</span>
              </div>
            </div>
          </div>

          {/* Interactive Feature Controls (Mobile Tab-switchable / Desktop Sidebar) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Desktop Navigation Tabs */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-medium">
              <button
                onClick={() => { setActiveTab('viewport'); triggerHaptic(); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === 'viewport' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Engine
              </button>
              <button
                onClick={() => { setActiveTab('neural'); triggerHaptic(); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === 'neural' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                String AI
              </button>
              <button
                onClick={() => { setActiveTab('overlay'); triggerHaptic(); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === 'overlay' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Overlay
              </button>
              <button
                onClick={() => { setActiveTab('notifications'); triggerHaptic(); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === 'notifications' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Shade
              </button>
              <button
                onClick={() => { setActiveTab('games'); triggerHaptic(); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === 'games' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Games
              </button>
              <button
                onClick={() => { setActiveTab('apk'); triggerHaptic(); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === 'apk' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                APK
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'viewport' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <NeuralEngineControls
                  settings={settings}
                  telemetry={telemetry}
                  onUpdateSettings={handleUpdateSettings}
                  onTriggerHaptic={triggerHaptic}
                />
              </div>
            )}

            {activeTab === 'neural' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <NeuralEngineControls
                  settings={settings}
                  telemetry={telemetry}
                  onUpdateSettings={handleUpdateSettings}
                  onTriggerHaptic={triggerHaptic}
                />
              </div>
            )}

            {activeTab === 'overlay' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <FloatingOverlayHUD
                  settings={settings}
                  telemetry={telemetry}
                  overlayConfig={overlayConfig}
                  onUpdateSettings={handleUpdateSettings}
                  onUpdateOverlay={handleUpdateOverlay}
                  onTriggerHaptic={triggerHaptic}
                />
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <NotificationBarControl
                  settings={settings}
                  telemetry={telemetry}
                  notificationState={notificationState}
                  onUpdateSettings={handleUpdateSettings}
                  onUpdateNotificationState={handleUpdateNotificationState}
                  onTriggerHaptic={triggerHaptic}
                />
              </div>
            )}

            {activeTab === 'games' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <GameProfilesManager
                  settings={settings}
                  overlayConfig={overlayConfig}
                  onUpdateSettings={handleUpdateSettings}
                  onUpdateOverlay={handleUpdateOverlay}
                  onTriggerHaptic={triggerHaptic}
                />
              </div>
            )}

            {activeTab === 'apk' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <ApkCompilerGuide
                  onTriggerHaptic={triggerHaptic}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Global Floating Overlay Bubble when Active (Always renders over DOM when toggled) */}
      <FloatingOverlayHUD
        settings={settings}
        telemetry={telemetry}
        overlayConfig={overlayConfig}
        onUpdateSettings={handleUpdateSettings}
        onUpdateOverlay={handleUpdateOverlay}
        onTriggerHaptic={triggerHaptic}
      />

      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="lg:hidden">
        <BottomTabBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          overlayActive={overlayConfig.active}
          onTriggerHaptic={triggerHaptic}
        />
      </div>
    </div>
  );
}
