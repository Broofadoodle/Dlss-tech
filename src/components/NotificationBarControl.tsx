import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  Sliders, 
  Zap, 
  ChevronDown, 
  Sparkles, 
  Play, 
  Pause, 
  RefreshCw,
  Cpu,
  Shield,
  Wifi,
  Battery
} from 'lucide-react';
import { 
  DlssSettings, 
  PerformanceTelemetry, 
  NotificationControlState, 
  DlssMode, 
  FrameGenMode, 
  ReflexMode 
} from '../types/dlss';

import { 
  requestRealNotificationPermission 
} from '../utils/realPermissions';

interface NotificationBarControlProps {
  settings: DlssSettings;
  telemetry: PerformanceTelemetry;
  notificationState: NotificationControlState;
  onUpdateSettings: (updates: Partial<DlssSettings>) => void;
  onUpdateNotificationState: (updates: Partial<NotificationControlState>) => void;
  onTriggerHaptic?: () => void;
}

export const NotificationBarControl: React.FC<NotificationBarControlProps> = ({
  settings,
  telemetry,
  notificationState,
  onUpdateSettings,
  onUpdateNotificationState,
  onTriggerHaptic
}) => {
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentBrowserStatus, setCurrentBrowserStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  // Request real device notification permission
  const handleRequestPermission = async () => {
    onTriggerHaptic?.();
    setErrorMessage(null);
    setRequestStatus('Prompting your device for notification permissions...');

    const result = await requestRealNotificationPermission();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setCurrentBrowserStatus(Notification.permission);
    }

    if (result.granted) {
      setRequestStatus('Real device notification permission granted! A test notification has been sent.');
      onUpdateNotificationState({ permission: 'granted', persistentEnabled: true });
    } else {
      setRequestStatus(null);
      setErrorMessage(result.error || 'Notification permission was denied or dismissed.');
      if (result.nativeStatus) {
        onUpdateNotificationState({ permission: result.nativeStatus as NotificationPermission });
      }
    }
  };

  // Dispatch real notification immediately to user's device
  const dispatchRealNotification = () => {
    onTriggerHaptic?.();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const notif = new Notification('🎮 DLSS 5 Mobile Active', {
          body: `String AI Neural Rendering: ${settings.mode.toUpperCase()} · ${telemetry.fps} FPS · ${telemetry.totalLatencyMs.toFixed(1)}ms Latency`,
          icon: '/favicon.ico',
          tag: 'dlss5-status',
          silent: false
        });
        setRequestStatus('Dispatched live notification to your phone notification bar!');
      } catch (err: any) {
        setErrorMessage(`Could not dispatch: ${err.message}. If testing in iframe, open direct URL.`);
      }
    }
  };

  const cycleMode = () => {
    const modes: DlssMode[] = ['performance', 'balanced', 'quality', 'dlaa'];
    const currentIndex = modes.indexOf(settings.mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    onUpdateSettings({ mode: nextMode });
    onTriggerHaptic?.();
  };

  const cycleFrameGen = () => {
    const gens: FrameGenMode[] = ['off', '2x', '3x', '4x'];
    const currentIndex = gens.indexOf(settings.frameGeneration);
    const nextGen = gens[(currentIndex + 1) % gens.length];
    onUpdateSettings({ frameGeneration: nextGen });
    onTriggerHaptic?.();
  };

  const toggleReflex = () => {
    const nextReflex: ReflexMode = settings.reflexLatency === 'boost' ? 'off' : 'boost';
    onUpdateSettings({ reflexLatency: nextReflex });
    onTriggerHaptic?.();
  };

  return (
    <div className="w-full space-y-6">
      {/* Notification Permission Card */}
      <div className="p-5 rounded-2xl glass-panel-elevated border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              notificationState.permission === 'granted'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
            }`}>
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Notification Bar Quick Controls
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>POST_NOTIFICATIONS</span>
                <span>·</span>
                <span className={notificationState.permission === 'granted' ? 'text-emerald-400' : 'text-slate-400'}>
                  {notificationState.permission === 'granted' ? 'Notifications Enabled' : 'Action Required'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).AndroidBridge?.requestNotificationPermission) {
                  (window as any).AndroidBridge.requestNotificationPermission();
                  setRequestStatus('Requested native Android POST_NOTIFICATIONS permission.');
                  return;
                }
                handleRequestPermission();
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-950 flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Grant Notification Permission</span>
            </button>
            <a
              href="intent:#Intent;action=android.settings.APP_NOTIFICATION_SETTINGS;package=com.stringai.dlss5;end"
              target="_top"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            >
              <span>Android Notification Settings</span>
            </a>
            {currentBrowserStatus === 'granted' && (
              <button
                onClick={dispatchRealNotification}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-all border border-emerald-500/30 flex items-center gap-1.5"
                title="Send a real test notification to your phone notification bar"
              >
                <span>Test Notification</span>
              </button>
            )}
          </div>
        </div>

        {/* Real Feedback message */}
        {requestStatus && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>{requestStatus}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs space-y-1">
            <div className="font-semibold">{errorMessage}</div>
            <div className="text-[11px] text-amber-400/80">
              Browser permission is currently: <code className="font-mono bg-amber-950/60 px-1 py-0.5 rounded">{currentBrowserStatus}</code>. 
              {currentBrowserStatus === 'denied' && ' To unblock, tap the lock/tune icon in your browser address bar and set Notifications to Allow.'}
            </div>
          </div>
        )}

        <div className="text-xs text-slate-300 leading-relaxed flex items-center justify-between">
          <span>Browser Notification State:</span>
          <span className="font-mono font-bold text-emerald-400 uppercase">{currentBrowserStatus}</span>
        </div>

        {/* Pull Down Trigger Simulator Button */}
        <button
          onClick={() => {
            onUpdateNotificationState({ shadeOpen: !notificationState.shadeOpen });
            onTriggerHaptic?.();
          }}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-all"
        >
          <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform ${notificationState.shadeOpen ? 'rotate-180' : ''}`} />
          <span>{notificationState.shadeOpen ? 'Close Notification Shade' : 'Pull Down Android Notification Shade Preview'}</span>
        </button>
      </div>

      {/* Interactive Notification Shade Simulator */}
      {notificationState.shadeOpen && (
        <div className="w-full rounded-3xl glass-panel-elevated border border-slate-700 p-5 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          {/* Android Status Bar Header inside Shade */}
          <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-mono text-white font-semibold">12:45</span>
              <span className="text-[10px] text-emerald-400">· DLSS 5 Active</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[11px]">94%</span>
            </div>
          </div>

          {/* Quick Settings Tiles Grid */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => {
                onUpdateSettings({ enabled: !settings.enabled });
                onTriggerHaptic?.();
              }}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                settings.enabled
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold">DLSS 5</span>
            </button>

            <button
              onClick={() => {
                toggleReflex();
                onTriggerHaptic?.();
              }}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                settings.reflexLatency === 'boost'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-950'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-bold">Reflex</span>
            </button>

            <button
              onClick={() => {
                onUpdateSettings({ rayReconstruction: !settings.rayReconstruction });
                onTriggerHaptic?.();
              }}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                settings.rayReconstruction
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span className="text-[10px] font-bold">Ray Reconst.</span>
            </button>

            <button
              onClick={() => {
                onUpdateSettings({ hdrToneMapping: !settings.hdrToneMapping });
                onTriggerHaptic?.();
              }}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                settings.hdrToneMapping
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-bold">Neural HDR</span>
            </button>
          </div>

          {/* Persistent In-Game Notification Tile */}
          <div className="rounded-2xl bg-slate-900/90 border border-emerald-500/30 p-4 space-y-3 shadow-lg">
            {/* Notification App Title & Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-3 h-3" />
                </div>
                <span className="text-xs font-bold text-slate-200">DLSS 5 Mobile Engine</span>
                <span className="text-[10px] text-slate-500">· Ongoing</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">now</span>
            </div>

            {/* Notification Content & Live Metrics */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-100 flex items-center justify-between">
                <span>Neural Upscaling Active</span>
                <span className="font-mono text-emerald-400 tabular-nums">
                  {settings.enabled ? telemetry.fps : telemetry.baseFps} FPS
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                <span>Latency: {telemetry.totalLatencyMs.toFixed(1)}ms</span>
                <span>·</span>
                <span>NPU: {telemetry.npuUtilization}%</span>
                <span>·</span>
                <span>VRAM: +{telemetry.vramSavedMb}MB</span>
              </div>
            </div>

            {/* Interactive Notification Action Buttons */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-2">
              {/* Preset Switcher Action */}
              <button
                onClick={cycleMode}
                className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-center transition-all group"
              >
                <div className="text-[9px] text-slate-400 font-medium">MODE</div>
                <div className="text-xs font-bold font-mono text-emerald-400 capitalize">
                  {settings.mode === 'dlaa' ? 'DLAA' : settings.mode}
                </div>
              </button>

              {/* Frame Generation Action */}
              <button
                onClick={cycleFrameGen}
                className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-center transition-all group"
              >
                <div className="text-[9px] text-slate-400 font-medium">FRAME GEN</div>
                <div className="text-xs font-bold font-mono text-cyan-400 uppercase">
                  {settings.frameGeneration}
                </div>
              </button>

              {/* Reflex Boost Action */}
              <button
                onClick={toggleReflex}
                className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-center transition-all group"
              >
                <div className="text-[9px] text-slate-400 font-medium">REFLEX</div>
                <div className="text-xs font-bold font-mono text-purple-400 uppercase">
                  {settings.reflexLatency}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Explainer */}
      <div className="p-4 rounded-xl glass-panel border border-slate-800/80 text-xs text-slate-400 space-y-2">
        <div className="font-semibold text-slate-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Android Foreground Service & Notification Shade Architecture</span>
        </div>
        <p className="leading-relaxed">
          When compiled into an APK via Capacitor/Cordova, a native Android Foreground Service 
          keeps the DLSS 5 notification pinned in the shade. Android Broadcast Receivers 
          allow the action buttons to adjust GPU upscaling frequencies in sub-millisecond intervals.
        </p>
      </div>
    </div>
  );
};
