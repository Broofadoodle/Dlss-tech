import React from 'react';
import { 
  Sliders, 
  Sparkles, 
  Layers, 
  BellRing, 
  Gamepad2, 
  FileCode,
  Github
} from 'lucide-react';

export type ActiveTab = 'viewport' | 'neural' | 'overlay' | 'notifications' | 'games' | 'apk';

interface BottomTabBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  overlayActive: boolean;
  onTriggerHaptic?: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onSelectTab,
  overlayActive,
  onTriggerHaptic
}) => {
  const tabs = [
    { id: 'viewport' as ActiveTab, label: 'Live View', icon: Sliders },
    { id: 'neural' as ActiveTab, label: 'String AI', icon: Sparkles },
    { id: 'overlay' as ActiveTab, label: 'Overlay', icon: Layers, badge: overlayActive ? 'ON' : undefined },
    { id: 'notifications' as ActiveTab, label: 'Notification', icon: BellRing },
    { id: 'games' as ActiveTab, label: 'Games', icon: Gamepad2 },
    { id: 'apk' as ActiveTab, label: 'APK CI', icon: Github },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel-elevated border-t border-slate-800/90 pb-safe">
      <div className="grid grid-cols-6 items-center h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                onSelectTab(tab.id);
                onTriggerHaptic?.();
              }}
              className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-all ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Tab Glow Pill */}
              {isActive && (
                <div className="absolute top-1 w-6 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-emerald-500 text-[8px] font-mono font-bold text-slate-950">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] font-medium tracking-tight mt-1 truncate ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
