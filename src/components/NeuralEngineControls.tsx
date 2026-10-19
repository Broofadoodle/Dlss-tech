import React from 'react';
import { 
  Cpu, 
  Sparkles, 
  Zap, 
  Layers, 
  Eye, 
  Sun, 
  Activity, 
  Gauge, 
  Sliders, 
  ShieldCheck,
  Check,
  Boxes
} from 'lucide-react';
import { DlssSettings, PerformanceTelemetry, DlssMode, FrameGenMode, ReflexMode, NpuProfile } from '../types/dlss';

interface NeuralEngineControlsProps {
  settings: DlssSettings;
  telemetry: PerformanceTelemetry;
  onUpdateSettings: (updates: Partial<DlssSettings>) => void;
  onTriggerHaptic?: () => void;
}

export const NeuralEngineControls: React.FC<NeuralEngineControlsProps> = ({
  settings,
  telemetry,
  onUpdateSettings,
  onTriggerHaptic
}) => {
  return (
    <div className="w-full space-y-6">
      {/* String AI Neural Rendering Card */}
      <div className="p-5 rounded-2xl glass-panel-elevated border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>String AI Neural Model</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  DLSS 5 Core
                </span>
              </h2>
              <div className="text-xs text-slate-400">
                Photorealistic lighting, material synthesis & motion vectors
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onUpdateSettings({ enabled: !settings.enabled });
              onTriggerHaptic?.();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              settings.enabled
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-950'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {settings.enabled ? 'Active' : 'Bypassed'}
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          String AI actively evaluates the game's low-resolution raster geometry and motion vectors, 
          generating physically plausible micro-materials, ray-traced reflections, and volumetric radiance 
          directly on the mobile GPU/NPU tensor pipeline.
        </p>

        {/* String AI Intensity Slider */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">Neural Material & Detail Intensity</span>
            <span className="font-mono font-bold text-emerald-400">{settings.stringAiIntensity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.stringAiIntensity}
            onChange={(e) => onUpdateSettings({ stringAiIntensity: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Standard PBR</span>
            <span>Balanced Micro-Facets</span>
            <span>Ultra Photorealism</span>
          </div>
        </div>

        {/* Neural Pipeline Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Ray Reconstruction */}
          <div 
            onClick={() => {
              onUpdateSettings({ rayReconstruction: !settings.rayReconstruction });
              onTriggerHaptic?.();
            }}
            className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
              settings.rayReconstruction
                ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-100'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Sun className={`w-4 h-4 ${settings.rayReconstruction ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold">Ray Reconstruction</span>
              </div>
              <span className={`text-[10px] font-mono ${settings.rayReconstruction ? 'text-emerald-400' : 'text-slate-500'}`}>
                {settings.rayReconstruction ? 'ON' : 'OFF'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              AI model replaces traditional denoisers to render glossy reflections and indirect bounces.
            </p>
          </div>

          {/* Subsurface Scattering */}
          <div 
            onClick={() => {
              onUpdateSettings({ subSurfaceScattering: !settings.subSurfaceScattering });
              onTriggerHaptic?.();
            }}
            className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
              settings.subSurfaceScattering
                ? 'bg-cyan-500/10 border-cyan-500/40 text-slate-100'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${settings.subSurfaceScattering ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold">Sub-surface Scattering</span>
              </div>
              <span className={`text-[10px] font-mono ${settings.subSurfaceScattering ? 'text-cyan-400' : 'text-slate-500'}`}>
                {settings.subSurfaceScattering ? 'ON' : 'OFF'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Light penetration for realistic skin, leaves, wax, and volumetric environmental mist.
            </p>
          </div>

          {/* Motion Vector Acceleration */}
          <div 
            onClick={() => {
              onUpdateSettings({ motionVectors: !settings.motionVectors });
              onTriggerHaptic?.();
            }}
            className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
              settings.motionVectors
                ? 'bg-purple-500/10 border-purple-500/40 text-slate-100'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Activity className={`w-4 h-4 ${settings.motionVectors ? 'text-purple-400' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold">Optical Flow Vectors</span>
              </div>
              <span className={`text-[10px] font-mono ${settings.motionVectors ? 'text-purple-400' : 'text-slate-500'}`}>
                {settings.motionVectors ? 'TRACKING' : 'OFF'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Tracks sub-pixel velocity vectors to eliminate temporal ghosting in fast camera pans.
            </p>
          </div>

          {/* Neural HDR Tone Mapping */}
          <div 
            onClick={() => {
              onUpdateSettings({ hdrToneMapping: !settings.hdrToneMapping });
              onTriggerHaptic?.();
            }}
            className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
              settings.hdrToneMapping
                ? 'bg-amber-500/10 border-amber-500/40 text-slate-100'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Sun className={`w-4 h-4 ${settings.hdrToneMapping ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold">HDR Tone Mapping</span>
              </div>
              <span className={`text-[10px] font-mono ${settings.hdrToneMapping ? 'text-amber-400' : 'text-slate-500'}`}>
                {settings.hdrToneMapping ? '12-BIT' : 'SDR'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Extends peak highlight nits without clipping specular reflections in neon & sunlight.
            </p>
          </div>
        </div>
      </div>

      {/* Low-Latency Pipeline Visualizer */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Low-Latency Execution Pipeline</span>
            </h3>
            <div className="text-[11px] text-slate-400">Total pipeline budget & sub-frame pacing</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
              {telemetry.totalLatencyMs.toFixed(1)} ms
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">End-to-End</div>
          </div>
        </div>

        {/* Step-by-Step Latency Breakdown */}
        <div className="space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">1</span>
              <div>
                <div className="font-semibold text-slate-200">Base Geometry & Depth Buffer</div>
                <div className="text-[10px] text-slate-500">Raster extraction from Vulkan/GLES frame</div>
              </div>
            </div>
            <span className="font-mono text-slate-300 font-semibold">0.9 ms</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-md bg-purple-950 text-purple-300 font-mono text-[10px] flex items-center justify-center font-bold">2</span>
              <div>
                <div className="font-semibold text-slate-200">Optical Flow Motion Vectors</div>
                <div className="text-[10px] text-slate-500">Pixel trajectory velocity computation</div>
              </div>
            </div>
            <span className="font-mono text-purple-300 font-semibold">1.1 ms</span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-md bg-emerald-500 text-slate-950 font-mono text-[10px] flex items-center justify-center font-bold">3</span>
              <div>
                <div className="font-semibold text-emerald-300">String AI Tensor Inference Pass</div>
                <div className="text-[10px] text-emerald-500/80">Neural radiance caching & material synthesis</div>
              </div>
            </div>
            <span className="font-mono text-emerald-400 font-bold tabular-nums">
              {telemetry.aiTensorPassMs.toFixed(1)} ms
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-md bg-cyan-950 text-cyan-300 font-mono text-[10px] flex items-center justify-center font-bold">4</span>
              <div>
                <div className="font-semibold text-slate-200">Multi-Frame Generation & Pacing</div>
                <div className="text-[10px] text-slate-500">Interpolates {settings.frameGeneration.toUpperCase()} with Reflex queue bypass</div>
              </div>
            </div>
            <span className="font-mono text-cyan-300 font-semibold">0.8 ms</span>
          </div>
        </div>
      </div>

      {/* Hardware NPU & Power Allocation */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">NPU & Tensor Hardware Allocation</h3>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            {telemetry.neuralWeightsLoaded}M FP8 Params
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['efficient', 'balanced', 'overclock'] as NpuProfile[]).map((prof) => (
            <button
              key={prof}
              onClick={() => {
                onUpdateSettings({ npuProfile: prof });
                onTriggerHaptic?.();
              }}
              className={`p-3 rounded-xl border text-center transition-all ${
                settings.npuProfile === prof
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-bold capitalize">{prof}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {prof === 'efficient' ? 'Battery (~2.1W)' : prof === 'balanced' ? 'Optimal (~3.4W)' : 'Max 144Hz (~4.8W)'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
