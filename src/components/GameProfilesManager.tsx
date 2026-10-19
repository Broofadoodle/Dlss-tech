import React, { useState } from 'react';
import { 
  Gamepad2, 
  Plus, 
  Play, 
  Check, 
  Sliders, 
  Sparkles, 
  Layers, 
  Zap, 
  Trash2, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { GameProfile, DlssMode, FrameGenMode, DlssSettings, OverlayConfig } from '../types/dlss';

interface GameProfilesManagerProps {
  settings: DlssSettings;
  overlayConfig: OverlayConfig;
  onUpdateSettings: (updates: Partial<DlssSettings>) => void;
  onUpdateOverlay: (updates: Partial<OverlayConfig>) => void;
  onTriggerHaptic?: () => void;
}

export const INITIAL_GAMES: GameProfile[] = [
  {
    id: 'cyberpunk_mobile',
    name: 'Cyberpunk: Neo Night',
    packageName: 'com.cdpr.cyberpunk.mobile',
    genre: 'Open-World Action RPG',
    nativeResolution: '720p',
    enhancedResolution: '4K Ultra',
    baseFps: 42,
    targetFps: 120,
    recommendedMode: 'quality',
    recommendedFrameGen: '2x',
    bannerImage: '/src/assets/images/game_cyberpunk_neon_1792411307127.jpg'
  },
  {
    id: 'elden_rpg',
    name: 'Elden Relics: Forest',
    packageName: 'com.fromsoft.eldenrelics',
    genre: 'Dark Fantasy RPG',
    nativeResolution: '720p',
    enhancedResolution: '4K Dynamic',
    baseFps: 38,
    targetFps: 120,
    recommendedMode: 'balanced',
    recommendedFrameGen: '3x',
    bannerImage: '/src/assets/images/game_fantasy_forest_1792411308051.jpg'
  },
  {
    id: 'mech_combat',
    name: 'Titan Mecha: Warframe',
    packageName: 'com.mecha.armoredcore',
    genre: 'Sci-Fi Mech Arena',
    nativeResolution: '800p',
    enhancedResolution: '4K Pro',
    baseFps: 45,
    targetFps: 144,
    recommendedMode: 'performance',
    recommendedFrameGen: '4x',
    bannerImage: '/src/assets/images/game_mecha_combat_1792411309420.jpg'
  },
  {
    id: 'genshin_impact',
    name: 'Genshin Impact',
    packageName: 'com.miHoYo.GenshinImpact',
    genre: 'Open-World Fantasy',
    nativeResolution: '720p',
    enhancedResolution: '1440p High 120Hz',
    baseFps: 40,
    targetFps: 120,
    recommendedMode: 'quality',
    recommendedFrameGen: '2x',
    bannerImage: '/src/assets/images/game_fantasy_forest_1792411308051.jpg'
  },
  {
    id: 'warzone_mobile',
    name: 'Warzone Mobile',
    packageName: 'com.activision.callofduty.warzone',
    genre: 'Battle Royale FPS',
    nativeResolution: '800p',
    enhancedResolution: '1440p Competitive',
    baseFps: 50,
    targetFps: 144,
    recommendedMode: 'performance',
    recommendedFrameGen: '3x',
    bannerImage: '/src/assets/images/game_mecha_combat_1792411309420.jpg'
  }
];

export const GameProfilesManager: React.FC<GameProfilesManagerProps> = ({
  settings,
  overlayConfig,
  onUpdateSettings,
  onUpdateOverlay,
  onTriggerHaptic
}) => {
  const [games, setGames] = useState<GameProfile[]>(INITIAL_GAMES);
  const [selectedGameId, setSelectedGameId] = useState<string>(INITIAL_GAMES[0].id);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [launchStatus, setLaunchStatus] = useState<string | null>(null);

  // New Game Form
  const [newGameName, setNewGameName] = useState<string>('');
  const [newGamePackage, setNewGamePackage] = useState<string>('');
  const [newGameTargetFps, setNewGameTargetFps] = useState<number>(120);
  const [newGameMode, setNewGameMode] = useState<DlssMode>('quality');
  const [newGameFrameGen, setNewGameFrameGen] = useState<FrameGenMode>('2x');

  const selectedGame = games.find(g => g.id === selectedGameId) || games[0];

  const handleApplyProfile = (game: GameProfile) => {
    setSelectedGameId(game.id);
    onUpdateSettings({
      mode: game.recommendedMode,
      frameGeneration: game.recommendedFrameGen,
      targetFPS: game.targetFps
    });
    onTriggerHaptic?.();
  };

  const handleLaunchGame = (game: GameProfile) => {
    handleApplyProfile(game);
    // Activate overlay automatically when launching
    onUpdateOverlay({ active: true, permissionGranted: true });
    setLaunchStatus(`DLSS 5 Hooked into ${game.name}. Floating HUD Active.`);
    onTriggerHaptic?.();

    setTimeout(() => {
      setLaunchStatus(null);
    }, 4000);
  };

  const handleAddCustomGame = () => {
    if (!newGameName.trim() || !newGamePackage.trim()) return;

    const newGame: GameProfile = {
      id: `custom_${Date.now()}`,
      name: newGameName.trim(),
      packageName: newGamePackage.trim(),
      genre: 'Custom Mobile Game',
      nativeResolution: 'Auto-Detect',
      enhancedResolution: '4K DLSS 5',
      baseFps: 40,
      targetFps: newGameTargetFps,
      recommendedMode: newGameMode,
      recommendedFrameGen: newGameFrameGen,
      bannerImage: '/src/assets/images/game_cyberpunk_neon_1792411307127.jpg',
      isCustom: true
    };

    setGames([newGame, ...games]);
    setSelectedGameId(newGame.id);
    setShowAddModal(false);
    setNewGameName('');
    setNewGamePackage('');
    onTriggerHaptic?.();
  };

  const handleDeleteCustomGame = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGames(games.filter(g => g.id !== id));
    if (selectedGameId === id) {
      setSelectedGameId(games[0].id);
    }
    onTriggerHaptic?.();
  };

  return (
    <div className="w-full space-y-6">
      {/* Launch notification banner */}
      {launchStatus && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{launchStatus}</span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">READY</span>
        </div>
      )}

      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
            <span>Installed Games & Neural Profiles</span>
          </h2>
          <div className="text-xs text-slate-400">
            Auto-detects framebuffers and injects DLSS 5 post-processing
          </div>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            onTriggerHaptic?.();
          }}
          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all shadow-md"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add Game</span>
        </button>
      </div>

      {/* Games Horizontal / Vertical List */}
      <div className="space-y-3">
        {games.map((game) => {
          const isSelected = game.id === selectedGameId;
          return (
            <div
              key={game.id}
              onClick={() => handleApplyProfile(game)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                isSelected
                  ? 'glass-panel-elevated border-emerald-500/50 shadow-lg shadow-emerald-950/40'
                  : 'glass-panel border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                    <img
                      src={game.bannerImage}
                      alt={game.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-100">{game.name}</h3>
                      {game.isCustom && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {game.packageName}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                      <span>{game.nativeResolution} → {game.enhancedResolution}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-bold">{game.targetFps} FPS</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {game.isCustom && (
                    <button
                      onClick={(e) => handleDeleteCustomGame(game.id, e)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove Game"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchGame(game);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch</span>
                  </button>
                </div>
              </div>

              {/* Expanded details when selected */}
              {isSelected && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Mode</div>
                    <div className="font-mono font-bold text-emerald-400 uppercase mt-0.5">
                      {game.recommendedMode}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Frame Gen</div>
                    <div className="font-mono font-bold text-cyan-400 uppercase mt-0.5">
                      {game.recommendedFrameGen}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Latency Gain</div>
                    <div className="font-mono font-bold text-purple-400 mt-0.5">
                      -68%
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Custom Game Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl glass-panel-elevated border border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Android Game Profile</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Game Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. CarX Street Mobile"
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Android Package Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. com.carxtech.street"
                  value={newGamePackage}
                  onChange={(e) => setNewGamePackage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Target FPS
                  </label>
                  <select
                    value={newGameTargetFps}
                    onChange={(e) => setNewGameTargetFps(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value={60}>60 FPS</option>
                    <option value={90}>90 FPS</option>
                    <option value={120}>120 FPS</option>
                    <option value={144}>144 FPS</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    DLSS Mode
                  </label>
                  <select
                    value={newGameMode}
                    onChange={(e) => setNewGameMode(e.target.value as DlssMode)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="quality">Quality</option>
                    <option value="balanced">Balanced</option>
                    <option value="performance">Performance</option>
                    <option value="ultra_performance">Ultra Perf</option>
                    <option value="dlaa">DLAA</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomGame}
                disabled={!newGameName.trim() || !newGamePackage.trim()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-md shadow-emerald-950"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
