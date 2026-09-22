import React, { useState } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { BUILDING_BLUEPRINTS } from '../../../engine/buildings/blueprints';
import type { BuildingType } from '../../../types/game';
import {
  TownCenterIcon,
  WoodIcon,
  WheatIcon,
  BreadIcon,
  ShieldIcon,
  GoldIcon,
  StoneIcon,
  CrossCloseIcon,
} from '../MedievalIcons';
import { audioManager } from '../../../engine/audio/AudioManager';
import { useTranslation } from '../../../i18n';

interface BuildingsMenuModalProps {
  onClose: () => void;
}

export const BuildingsMenuModal: React.FC<BuildingsMenuModalProps> = React.memo(({ onClose }) => {
  const { dict, language } = useTranslation();

  const activeBuildType = useGameStore((s) => s.activeBuildType);
  const setActiveBuildType = useGameStore((s) => s.setActiveBuildType);
  const setActiveTool = useGameStore((s) => s.setActiveTool);
  const resources = useGameStore((s) => s.resources);

  const [activeCategory, setActiveCategory] = useState<'housing' | 'gathering' | 'farming' | 'industry' | 'military' | 'trade'>('housing');

  const categories = [
    { id: 'housing', label: dict.buildings.categories.housing, icon: TownCenterIcon },
    { id: 'gathering', label: dict.buildings.categories.gathering, icon: WoodIcon },
    { id: 'farming', label: dict.buildings.categories.farming, icon: WheatIcon },
    { id: 'industry', label: dict.buildings.categories.industry, icon: BreadIcon },
    { id: 'military', label: dict.buildings.categories.military, icon: ShieldIcon },
    { id: 'trade', label: dict.buildings.categories.trade, icon: GoldIcon },
  ] as const;

  const categoryBlueprints: Record<typeof activeCategory, (typeof BUILDING_BLUEPRINTS[BuildingType])[]> = {
    housing: [
      BUILDING_BLUEPRINTS.tent,
      BUILDING_BLUEPRINTS.peasant_house,
      BUILDING_BLUEPRINTS.manor,
    ].filter(Boolean),
    gathering: [
      BUILDING_BLUEPRINTS.lumberjack_hut,
      BUILDING_BLUEPRINTS.stockpile,
      BUILDING_BLUEPRINTS.campfire,
    ].filter(Boolean),
    farming: [
      BUILDING_BLUEPRINTS.wheat_farm,
      BUILDING_BLUEPRINTS.windmill,
    ].filter(Boolean),
    industry: [
      BUILDING_BLUEPRINTS.bakery,
      BUILDING_BLUEPRINTS.brewery,
    ].filter(Boolean),
    military: [
      BUILDING_BLUEPRINTS.barracks,
      BUILDING_BLUEPRINTS.wooden_wall,
      BUILDING_BLUEPRINTS.wooden_gate,
      BUILDING_BLUEPRINTS.stone_wall,
    ].filter(Boolean),
    trade: [
      BUILDING_BLUEPRINTS.market,
    ].filter(Boolean),
  };

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#121418]/98 backdrop-blur-xl p-4 rounded-2xl border-2 border-[#5a4830] shadow-[0_12px_40px_rgba(0,0,0,0.95)] flex flex-col gap-3 w-[640px] max-w-[95vw] pointer-events-auto z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center justify-between border-b border-[#3d3222] pb-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  audioManager.playUIClick();
                  setActiveCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-b from-[#8c6b38] to-[#422d10] text-amber-100 border border-[#d4af37] shadow-md'
                    : 'text-slate-400 hover:text-amber-200 hover:bg-[#1f222a]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title={dict.common.close}
        >
          <CrossCloseIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
        {categoryBlueprints[activeCategory].map((b) => {
          const isSelected = activeBuildType === b.type;
          const bTrans = dict.buildings.items[b.type] || { name: b.name, description: b.description };

          let canAfford = true;
          if (b.cost.wood && resources.wood < b.cost.wood) canAfford = false;
          if (b.cost.stone && resources.stone < b.cost.stone) canAfford = false;
          if (b.cost.gold && resources.gold < b.cost.gold) canAfford = false;

          return (
            <button
              key={b.type}
              onClick={() => {
                audioManager.playUIClick();
                setActiveBuildType(b.type);
                setActiveTool('build');
              }}
              className={`flex flex-col p-3 rounded-xl text-left transition border relative cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-[#3b2a15] to-[#1a1208] border-[#d4af37] ring-1 ring-amber-400 shadow-xl'
                  : canAfford
                  ? 'bg-[#181a20] border-[#3a3224] hover:border-[#8c6b38] hover:bg-[#20232b]'
                  : 'bg-[#121317]/60 border-slate-800/80 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-cinzel font-bold text-xs text-amber-100 truncate">
                  {bTrans.name}
                </span>
                <span className="text-[10px] text-amber-400/90 font-mono px-1.5 py-0.2 rounded bg-black/40 border border-amber-900/40">
                  {b.width}x{b.height}
                </span>
              </div>

              <p className="text-[10px] text-slate-300 line-clamp-2 mb-2 leading-relaxed font-sans">
                {bTrans.description}
              </p>

              <div className="flex items-center gap-2.5 mt-auto pt-1.5 border-t border-[#2e261b] text-[10px] font-mono">
                {b.cost.wood && (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <WoodIcon className="w-3 h-3" />
                    {b.cost.wood} {language === 'uk' ? 'дер.' : 'log'}
                  </span>
                )}
                {b.cost.stone && (
                  <span className="flex items-center gap-1 text-slate-300 font-bold">
                    <StoneIcon className="w-3 h-3" />
                    {b.cost.stone} {language === 'uk' ? 'кам.' : 'st.'}
                  </span>
                )}
                {b.cost.gold && (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <GoldIcon className="w-3 h-3" />
                    {b.cost.gold} {language === 'uk' ? 'зол.' : 'g.'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

BuildingsMenuModal.displayName = 'BuildingsMenuModal';
