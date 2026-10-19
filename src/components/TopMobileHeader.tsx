import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  Sparkles, 
  BellRing, 
  ChevronDown, 
  Layers,
  Activity,
  Zap,
  RotateCcw
} from 'lucide-react';
import { DlssSettings, PerformanceTelemetry, NotificationControlState, OverlayConfig } from '../types/dlss';

interface TopMobileHeaderProps {
  settings: DlssSettings;
  telemetry: PerformanceTelemetry;
  notificationState: NotificationControlState;
  overlayConfig: OverlayConfig;
  onToggleShade: () => void;
  onRevertSettings?: () => void;
  onTriggerHaptic?: () => void;
}

export const TopMobileHeader: React.FC<TopMobileHeaderProps> = ({
  settings,
  telemetry,
  notificationState,
  overlayConfig,
  onToggleShade,
  onRevertSettings,
  onTriggerHaptic
}) => {
  const [timeStr, setTimeStr] = useState<string>('12:45');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 pt-safe">
      {/* Android System Status Bar Strip */}
      <div 
        onClick={() => {
          onToggleShade();
          onTriggerHaptic?.();
        }}
        className="cursor-pointer px-5 py-1.5 flex items-center justify-between text-xs text-slate-400 hover:bg-slate-900/40 transition-colors border-b border-slate-900/60"
        title="Tap to pull down Notification Shade"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-200 font-semibold">{timeStr}</span>
          {overlayConfig.active && (
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>OVERLAY</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <ChevronDown className="w-3 h-3 text-slate-500 animate-bounce" />
          <span className="text-[10px]">Pull Shade</span>
        </div>

        <div className="flex items-center gap-2.5 text-slate-300">
          <Wifi className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono font-bold text-slate-300">5G</span>
          <div className="flex items-center gap-1">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[10px] text-slate-300">92%</span>
          </div>
        </div>
      </div>

      {/* App Branding & Primary Action Row (Top Bar Contract) */}
      <div className="px-5 py-3 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center shadow-sm shadow-emerald-950">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>DLSS 5</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                STRING AI
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Neural Graphics Engine
            </div>
          </div>
        </div>

        {/* Zone 2: Real-time Telemetry Pill */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="font-bold text-emerald-400 tabular-nums">
              {settings.enabled ? telemetry.fps : telemetry.baseFps}
            </span>
            <span className="text-[9px] text-slate-500">FPS</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 hidden xs:flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className="font-bold text-cyan-400 tabular-nums">
              {telemetry.totalLatencyMs.toFixed(1)}
            </span>
            <span className="text-[9px] text-slate-500">ms</span>
          </div>
        </div>

        {/* Zone 3: Revert, Standalone Link & Notification Shade Trigger */}
        <div className="flex items-center gap-2">
          {onRevertSettings && (
            <button
              onClick={() => {
                onRevertSettings();
                onTriggerHaptic?.();
              }}
              title="Revert all settings to defaults"
              className="px-2.5 py-1.5 rounded-xl border bg-slate-900/80 text-slate-300 hover:text-white border-slate-800 text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-medium hidden xs:inline">Revert</span>
            </button>
          )}

          <a
            href={typeof window !== 'undefined' ? window.location.href : '#'}
            target="_blank"
            rel="noopener noreferrer"
            title="Open standalone app in mobile browser"
            className="p-2 rounded-xl border bg-slate-900/80 text-slate-400 hover:text-white border-slate-800 text-xs hidden sm:flex items-center gap-1"
          >
            <span className="text-[10px] font-mono">Direct URL</span>
          </a>

          <button
            onClick={() => {
              onToggleShade();
              onTriggerHaptic?.();
            }}
            className={`p-2 rounded-xl border transition-all ${
              notificationState.shadeOpen
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-950'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-800'
            }`}
            title="Toggle In-Game Notification Controls"
          >
            <BellRing className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
