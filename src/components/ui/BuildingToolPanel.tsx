import React from 'react';
import { CrossCloseIcon, WoodIcon, StoneIcon, GoldIcon, HammerIcon } from './MedievalIcons';
import { useGameStore } from '../../store/useGameStore';
import { audioManager } from '../../engine/audio/AudioManager';
import { useTranslation } from '../../i18n';
import { BUILDING_BLUEPRINTS } from '../../engine/buildings/blueprints';

export const BuildingToolPanel: React.FC = React.memo(() => {
  const { dict } = useTranslation();

  const activeTool = useGameStore((s) => s.activeTool);
  const activeBuildType = useGameStore((s) => s.activeBuildType);
  const setActiveTool = useGameStore((s) => s.setActiveTool);
  const buildRotation = useGameStore((s) => s.buildRotation);
  const rotateBuilding = useGameStore((s) => s.rotateBuilding);
  const resources = useGameStore((s) => s.resources);

  if (activeTool !== 'build' || !activeBuildType) return null;

  const blueprint = BUILDING_BLUEPRINTS[activeBuildType];
  if (!blueprint) return null;

  const degrees = Math.round((((buildRotation * 180) / Math.PI) % 360 + 360) % 360);

  const bTrans = dict.buildings.items[activeBuildType] || { name: blueprint.name, description: blueprint.description };

  const handleRotateLeftClick = () => {
    audioManager.playUIClick();
    rotateBuilding('ccw', Math.PI / 12);
  };

  const handleRotateRightClick = () => {
    audioManager.playUIClick();
    rotateBuilding('cw', Math.PI / 12);
  };

  const handleCloseClick = () => {
    audioManager.playUIPanelClose();
    setActiveTool('select');
  };

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="bg-[#121418]/97 backdrop-blur-xl border-2 border-[#5a4830] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] px-4 py-2.5 flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-[#3d3222]">
          <HammerIcon className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col">
            <span className="font-cinzel font-bold text-xs text-amber-100 whitespace-nowrap">
              {bTrans.name}
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono">
              Розмір: {blueprint.width}x{blueprint.height}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-amber-950/60">
          <button
            onClick={handleRotateLeftClick}
            title="Повернути споруду вліво (Клавіша: Q)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-cinzel font-bold transition border cursor-pointer bg-gradient-to-b from-amber-900/70 to-amber-950/80 border-amber-600/60 text-amber-100 hover:border-amber-400 hover:shadow-[0_0_8px_rgba(245,158,11,0.4)] active:scale-95"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>[Q]</span>
          </button>

          <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/90 border border-amber-700/60 text-amber-300 font-mono font-bold min-w-[36px] text-center">
            {degrees}°
          </span>

          <button
            onClick={handleRotateRightClick}
            title="Повернути споруду вправо (Клавіша: E або R)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-cinzel font-bold transition border cursor-pointer bg-gradient-to-b from-amber-900/70 to-amber-950/80 border-amber-600/60 text-amber-100 hover:border-amber-400 hover:shadow-[0_0_8px_rgba(245,158,11,0.4)] active:scale-95"
          >
            <span>[E]</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-black/40 border border-amber-950/60 text-xs">
          {blueprint.cost.wood ? (
            <div className={`flex items-center gap-1 font-mono text-[11px] ${resources.wood >= blueprint.cost.wood ? 'text-amber-200' : 'text-red-400 font-bold'}`}>
              <WoodIcon className="w-3 h-3 text-amber-600" />
              <span>{blueprint.cost.wood}</span>
            </div>
          ) : null}
          {blueprint.cost.stone ? (
            <div className={`flex items-center gap-1 font-mono text-[11px] ${resources.stone >= blueprint.cost.stone ? 'text-stone-300' : 'text-red-400 font-bold'}`}>
              <StoneIcon className="w-3 h-3 text-stone-400" />
              <span>{blueprint.cost.stone}</span>
            </div>
          ) : null}
          {blueprint.cost.gold ? (
            <div className={`flex items-center gap-1 font-mono text-[11px] ${resources.gold >= blueprint.cost.gold ? 'text-yellow-300' : 'text-red-400 font-bold'}`}>
              <GoldIcon className="w-3 h-3 text-yellow-400" />
              <span>{blueprint.cost.gold}</span>
            </div>
          ) : null}
        </div>

        <div className="w-px h-6 bg-[#3d3222]" />

        <button
          onClick={handleCloseClick}
          title="Скасувати будівництво (ESC або ПКМ)"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition cursor-pointer"
        >
          <CrossCloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

BuildingToolPanel.displayName = 'BuildingToolPanel';
export default BuildingToolPanel;
