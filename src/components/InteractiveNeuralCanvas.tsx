import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Sliders, 
  Maximize2, 
  Eye, 
  Activity, 
  Layers, 
  Sparkles, 
  Zap, 
  RotateCcw,
  ZoomIn
} from 'lucide-react';
import { DlssSettings, PerformanceTelemetry } from '../types/dlss';

interface InteractiveNeuralCanvasProps {
  settings: DlssSettings;
  telemetry: PerformanceTelemetry;
  onUpdateSettings: (updates: Partial<DlssSettings>) => void;
  onTriggerHaptic?: () => void;
}

export const SCENES = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon Street',
    tag: 'Ray Reconstruction',
    image: '/src/assets/images/game_cyberpunk_neon_1792411307127.jpg',
    baseRes: '720p (1280x720)',
    enhancedRes: '4K (3840x2160)',
    highlights: 'Wet asphalt reflections, neon radiance, volumetric steam'
  },
  {
    id: 'fantasy',
    name: 'Elden Forest Ruins',
    tag: 'Subsurface Scattering',
    image: '/src/assets/images/game_fantasy_forest_1792411308051.jpg',
    baseRes: '720p (1280x720)',
    enhancedRes: '4K (3840x2160)',
    highlights: 'Golden volumetric god-rays, foliage translucency, moss microtexture'
  },
  {
    id: 'mecha',
    name: 'Sci-Fi Mecha Arena',
    tag: 'String AI Materials',
    image: '/src/assets/images/game_mecha_combat_1792411309420.jpg',
    baseRes: '800p (1440x800)',
    enhancedRes: '4K (3840x2160)',
    highlights: 'Brushed titanium anisotropy, plasma heat distortion, sparks'
  },
  {
    id: 'threejs_live',
    name: 'Live 3D Tensor Core',
    tag: 'Real-Time WebGL',
    image: '',
    baseRes: 'Dynamic 3D Geometry',
    enhancedRes: 'Neural Radiance 120Hz',
    highlights: 'Interactive 3D geometry, real-time normal maps & motion vectors'
  }
];

export const InteractiveNeuralCanvas: React.FC<InteractiveNeuralCanvasProps> = ({
  settings,
  telemetry,
  onUpdateSettings,
  onTriggerHaptic
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loupeActive, setLoupeActive] = useState<boolean>(false);
  const [loupePos, setLoupePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [activeTab, setActiveTab] = useState<'comparison' | 'vector_field' | 'latency_view'>('comparison');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const vectorCanvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js 3D Live Scene state
  useEffect(() => {
    if (settings.activeSceneId !== 'threejs_live' || !threeCanvasRef.current) return;

    const canvas = threeCanvasRef.current;
    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080d);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: settings.enabled, alpha: false });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x223344, 1.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f076, 2.5);
    dirLight1.position.set(2, 4, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x818cf8, 2.0);
    dirLight2.position.set(-3, -2, -2);
    scene.add(dirLight2);

    // Neural Core Central Geometry (Polyhedral core with orbital rings)
    const coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x182433,
      metalness: 0.9,
      roughness: settings.rayReconstruction ? 0.15 : 0.6,
      clearcoat: settings.stringAiIntensity > 40 ? 1.0 : 0.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Wireframe overlay to demonstrate base geometry vs neural reconstruction
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: settings.enabled ? 0.35 : 0.8
    });
    const wireMesh = new THREE.Mesh(coreGeo, wireMat);
    coreMesh.add(wireMesh);

    // Outer Gyroscope Rings (Simulating Tensor Motion Vectors)
    const ringGeo = new THREE.TorusGeometry(1.25, 0.02, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ringMesh1);

    const ringMesh2 = new THREE.Mesh(ringGeo, ringMat);
    ringMesh2.rotation.x = Math.PI / 2;
    scene.add(ringMesh2);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const speed = settings.frameGeneration !== 'off' ? 1.5 : 0.8;

      coreMesh.rotation.y += 0.5 * speed * delta;
      coreMesh.rotation.x += 0.25 * speed * delta;
      ringMesh1.rotation.z += 0.8 * speed * delta;
      ringMesh2.rotation.y += 0.6 * speed * delta;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      wireMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, [settings.activeSceneId, settings.enabled, settings.rayReconstruction, settings.stringAiIntensity, settings.frameGeneration]);

  // Optical Flow Vector Field Animation
  useEffect(() => {
    if (!settings.showMotionVectorsDebug && activeTab !== 'vector_field') return;
    const canvas = vectorCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const renderVectors = () => {
      t += 0.04;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const step = 28;
      ctx.lineWidth = 1.5;

      for (let x = 14; x < w; x += step) {
        for (let y = 14; y < h; y += step) {
          const angle = Math.sin(x * 0.01 + t) * Math.cos(y * 0.01 + t) * Math.PI;
          const length = 12 * (0.5 + 0.5 * Math.sin(t + (x + y) * 0.02));
          
          const dx = Math.cos(angle) * length;
          const dy = Math.sin(angle) * length;

          // Vector color based on direction (optical flow standard)
          const r = Math.floor(128 + 127 * Math.cos(angle));
          const g = Math.floor(128 + 127 * Math.sin(angle));
          const b = 255;

          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.65)`;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + dx, y + dy);
          ctx.stroke();

          // Arrowhead
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.beginPath();
          ctx.arc(x + dx, y + dy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(renderVectors);
    };

    renderVectors();

    return () => cancelAnimationFrame(animId);
  }, [settings.showMotionVectorsDebug, activeTab]);

  // Handle pointer/touch dragging on comparison slider
  const handleTouchMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPosition(percent);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handleTouchMove(e.clientX);
    onTriggerHaptic?.();
  };

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        handleTouchMove(e.clientX);
      }
    };
    const onPointerUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isDragging, handleTouchMove]);

  // Handle Loupe movement
  const handleContainerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!loupeActive || !containerRef.current || isDragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLoupePos({
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y))
    });
  };

  const [customImage, setCustomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImage(event.target.result as string);
          onUpdateSettings({ activeSceneId: 'custom_upload' });
          onTriggerHaptic?.();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const activeScene = settings.activeSceneId === 'custom_upload' && customImage
    ? {
        id: 'custom_upload',
        name: 'My Custom Game Screenshot',
        tag: 'User Loaded',
        image: customImage,
        baseRes: 'Original Raster',
        enhancedRes: '4K DLSS 5 Enhanced',
        highlights: 'Real-time neural upscale & ray reconstruction'
      }
    : (SCENES.find(s => s.id === settings.activeSceneId) || SCENES[0]);

  return (
    <div className="w-full space-y-4">
      {/* Top Scene Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {SCENES.map((scene) => {
          const isSelected = scene.id === settings.activeSceneId;
          return (
            <button
              key={scene.id}
              onClick={() => {
                onUpdateSettings({ activeSceneId: scene.id });
                onTriggerHaptic?.();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-950'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span>{scene.name}</span>
            </button>
          );
        })}

        {/* Custom Screenshot Uploader */}
        <label className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer border ${
          settings.activeSceneId === 'custom_upload'
            ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-sm'
            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>Upload Real Screenshot</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCustomImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Main Viewport Container */}
      <div 
        ref={containerRef}
        onPointerMove={handleContainerPointerMove}
        className="relative w-full aspect-video sm:aspect-[16/10] rounded-2xl overflow-hidden glass-panel border border-slate-800/90 shadow-2xl bg-black select-none touch-none"
      >
        {/* Render Layer: Live Three.js vs High-Fidelity Neural Comparison */}
        {settings.activeSceneId === 'threejs_live' ? (
          <div className="absolute inset-0 w-full h-full">
            <canvas 
              ref={threeCanvasRef} 
              className="w-full h-full block"
            />
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full">
            {/* Base Native Render (Simulated 720p / Raster Jagged / Flat Lighting) */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <img
                src={activeScene.image}
                alt="Base Native Geometry"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter contrast-90 brightness-95"
                style={{
                  imageRendering: 'pixelated', // Show jagged base raster resolution
                  filter: 'blur(0.8px) contrast(0.88)'
                }}
              />
              {/* Raster noise texture simulation for low-res baseline */}
              <div className="absolute inset-0 bg-slate-950/20 mix-blend-overlay pointer-events-none" />
              
              <div className="absolute top-3 left-3 pointer-events-none">
                <div className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Native {activeScene.baseRes}</span>
                </div>
              </div>
            </div>

            {/* DLSS 5 Neural Enhanced Overlay (Right side clipped by slider) */}
            <div 
              className="absolute inset-0 w-full h-full overflow-hidden transition-none"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
              <img
                src={activeScene.image}
                alt="DLSS 5 Neural Rendering"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                style={{
                  filter: `contrast(${1 + (settings.stringAiIntensity * 0.002)}) brightness(${settings.hdrToneMapping ? 1.06 : 1}) saturate(${1 + (settings.stringAiIntensity * 0.0015)})`
                }}
              />

              {/* Dynamic Radiance Caching & Photorealistic Highlights Glow */}
              {settings.rayReconstruction && (
                <div 
                  className="absolute inset-0 pointer-events-none mix-blend-screen opacity-30 bg-gradient-to-tr from-emerald-500/10 via-transparent to-cyan-500/15"
                />
              )}

              <div className="absolute top-3 right-3 pointer-events-none">
                <div className="px-2.5 py-1 rounded-md bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 shadow-lg shadow-emerald-950/60">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>DLSS 5 · String AI 4K</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Motion Vector Field Debug Canvas */}
        {(settings.showMotionVectorsDebug || activeTab === 'vector_field') && (
          <canvas
            ref={vectorCanvasRef}
            width={640}
            height={360}
            className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-75 mix-blend-screen"
          />
        )}

        {/* Loupe / Magnifier Tool */}
        {loupeActive && (
          <div
            className="absolute pointer-events-none z-20 w-36 h-36 rounded-full border-2 border-emerald-400 shadow-2xl overflow-hidden glass-panel"
            style={{
              left: `${loupePos.x}%`,
              top: `${loupePos.y}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
            }}
          >
            {activeScene.image && (
              <div 
                className="w-full h-full relative"
                style={{
                  backgroundImage: `url(${activeScene.image})`,
                  backgroundPosition: `${loupePos.x}% ${loupePos.y}%`,
                  backgroundSize: '400%',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Loupe crosshair */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 border border-emerald-400/80 rounded-full" />
                </div>
                <div className="absolute bottom-1 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-400">
                  4X Neural Zoom
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interactive Comparison Split Divider Line */}
        <div
          onPointerDown={handlePointerDown}
          className="absolute top-0 bottom-0 z-20 cursor-ew-resize flex items-center justify-center group"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          {/* Vertical Hairline */}
          <div className="w-[2px] h-full bg-gradient-to-b from-emerald-400 via-white to-cyan-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />

          {/* Center Circular Thumb Handle */}
          <div className="absolute w-8 h-8 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-black group-hover:scale-110 active:scale-95 transition-transform duration-150">
            <Sliders className="w-3.5 h-3.5 text-emerald-400 rotate-90" />
          </div>
        </div>

        {/* Bottom Floating Telemetry Bar on Viewport */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2">
              <span className="text-slate-500">FPS</span>
              <span className="font-bold text-emerald-400 tabular-nums">
                {settings.enabled ? telemetry.fps : telemetry.baseFps}
              </span>
              <span className="text-[9px] text-slate-500">
                ({settings.enabled ? `+${Math.round(((telemetry.fps - telemetry.baseFps) / telemetry.baseFps) * 100)}%` : 'Base'})
              </span>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
              <span className="text-slate-500">LATENCY</span>
              <span className="font-bold text-cyan-400 tabular-nums">
                {settings.enabled ? `${telemetry.totalLatencyMs.toFixed(1)}ms` : '18.4ms'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Loupe Toggle Button */}
            <button
              onClick={() => {
                setLoupeActive(!loupeActive);
                onTriggerHaptic?.();
              }}
              title="4x Neural Sub-pixel Loupe"
              className={`p-2 rounded-lg backdrop-blur-md border transition-all ${
                loupeActive 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Motion Vectors Toggle */}
            <button
              onClick={() => {
                onUpdateSettings({ showMotionVectorsDebug: !settings.showMotionVectorsDebug });
                onTriggerHaptic?.();
              }}
              title="Toggle Optical Flow Vector Field"
              className={`p-2 rounded-lg backdrop-blur-md border transition-all ${
                settings.showMotionVectorsDebug
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Controls & Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-3 rounded-xl glass-panel border border-slate-800/80">
          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            Reconstructed Resolution
          </div>
          <div className="text-sm font-bold text-slate-100 font-mono flex items-center gap-1">
            <span>{activeScene.enhancedRes}</span>
            <span className="text-[10px] text-emerald-400">5.3x</span>
          </div>
        </div>

        <div className="p-3 rounded-xl glass-panel border border-slate-800/80">
          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            Frame Generation
          </div>
          <div className="text-sm font-bold text-slate-100 font-mono flex items-center gap-1">
            <span>{settings.frameGeneration.toUpperCase()}</span>
            <span className="text-[10px] text-cyan-400">Optical Flow</span>
          </div>
        </div>

        <div className="p-3 rounded-xl glass-panel border border-slate-800/80">
          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            Neural Tensor Pass
          </div>
          <div className="text-sm font-bold text-slate-100 font-mono flex items-center gap-1">
            <span className="tabular-nums">{telemetry.aiTensorPassMs.toFixed(1)} ms</span>
            <span className="text-[10px] text-purple-400">NPU</span>
          </div>
        </div>

        <div className="p-3 rounded-xl glass-panel border border-slate-800/80">
          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            VRAM Saved
          </div>
          <div className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1">
            <span className="tabular-nums">+{telemetry.vramSavedMb} MB</span>
            <span className="text-[10px] text-slate-400">Bandwidth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
