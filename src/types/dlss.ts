export type DlssMode = 'ultra_performance' | 'performance' | 'balanced' | 'quality' | 'dlaa';

export type FrameGenMode = 'off' | '2x' | '3x' | '4x';

export type ReflexMode = 'off' | 'on' | 'boost';

export type NpuProfile = 'efficient' | 'balanced' | 'overclock';

export interface DlssSettings {
  enabled: boolean;
  mode: DlssMode;
  stringAiIntensity: number; // 0 - 100
  rayReconstruction: boolean;
  motionVectors: boolean;
  frameGeneration: FrameGenMode;
  reflexLatency: ReflexMode;
  sharpness: number; // 0 - 100
  hdrToneMapping: boolean;
  subSurfaceScattering: boolean;
  npuProfile: NpuProfile;
  targetFPS: number;
  resolutionScale: number; // percentage
  showMotionVectorsDebug: boolean;
  activeSceneId: string;
}

export interface PerformanceTelemetry {
  fps: number;
  baseFps: number;
  frameTimeMs: number;
  renderLatencyMs: number;
  aiTensorPassMs: number;
  totalLatencyMs: number;
  vramSavedMb: number;
  npuUtilization: number;
  powerDrawWatts: number;
  neuralWeightsLoaded: number; // in Millions of parameters
}

export interface GameProfile {
  id: string;
  name: string;
  packageName: string;
  genre: string;
  nativeResolution: string;
  enhancedResolution: string;
  baseFps: number;
  targetFps: number;
  recommendedMode: DlssMode;
  recommendedFrameGen: FrameGenMode;
  bannerImage: string;
  isCustom?: boolean;
}

export interface OverlayConfig {
  permissionGranted: boolean;
  active: boolean;
  bubblePosition: { x: number; y: number };
  bubbleCollapsed: boolean;
  opacity: number;
  showFpsCounter: boolean;
  showMiniGraph: boolean;
}

export interface NotificationControlState {
  permission: NotificationPermission;
  persistentEnabled: boolean;
  shadeOpen: boolean;
  lastUpdated: number;
}
