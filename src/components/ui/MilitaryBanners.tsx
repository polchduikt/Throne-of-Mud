import { useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { characterEntities } from '../../engine/ecs/world';
import { 
  WeaponsIcon, 
  ShieldIcon, 
  WoodIcon, 
  PeasantsIcon, 
  FleurDeLisIcon 
} from './MedievalIcons';

export function MilitaryBanners() {
  const { 
    selectedEntityId, 
    setSelectedEntityId, 
    setCameraFocusTarget,
    callLevyMilitia
  } = useGameStore();

  const allCharacters = Array.from(characterEntities);
  const lords = allCharacters.filter(
    (c) => c.characterClass === 'king' || c.characterClass === 'lady' || c.characterClass === 'warrior' || c.characterClass === 'lord'
  );
  const king = lords.find((l) => l.characterClass === 'king') || lords[0];
  const peasants = allCharacters.filter((c) => c.characterClass === 'peasant');
  const levyPeasants = peasants.filter((p) => p.isLevy);
  const employedPeasants = peasants.filter((p) => Boolean(p.workBuildingId));

  const regiments = useMemo(() => [
    {
      id: 'retinue-king',
      name: 'Королівська Дружина',
      unitType: 'retinue',
      leader: king,
      count: 1,
      maxCount: 1,
      icon: WeaponsIcon,
      crestNode: <FleurDeLisIcon size={14} className="text-amber-300" />,
      bannerBg: 'from-amber-900 via-amber-950 to-slate-950',
      borderColor: 'border-amber-500/80',
      badgeColor: 'bg-amber-600',
      morale: 100,
    },
    {
      id: 'levy-spearmen',
      name: 'Селянське Ополчення',
      unitType: 'levy',
      leader: lords[1] || king,
      count: levyPeasants.length,
      maxCount: Math.max(4, levyPeasants.length),
      icon: ShieldIcon,
      crestNode: <ShieldIcon size={14} className="text-amber-300" />,
      bannerBg: 'from-blue-900 via-indigo-950 to-slate-950',
      borderColor: 'border-blue-500/80',
      badgeColor: 'bg-blue-600',
      morale: 85,
    },
    {
      id: 'woodsmen-militia',
      name: 'Варта Лісорубів',
      unitType: 'workers',
      leader: null,
      count: employedPeasants.length,
      maxCount: Math.max(2, employedPeasants.length),
      icon: WoodIcon,
      crestNode: <WoodIcon size={14} className="text-amber-300" />,
      bannerBg: 'from-emerald-900 via-green-950 to-slate-950',
      borderColor: 'border-emerald-500/80',
      badgeColor: 'bg-emerald-600',
      morale: 90,
    },
    {
      id: 'free-settlers',
      name: 'Вільні Поселенці',
      unitType: 'settlers',
      leader: null,
      count: peasants.filter(p => !p.workBuildingId && !p.isLevy).length,
      maxCount: peasants.length,
      icon: PeasantsIcon,
      crestNode: <PeasantsIcon size={14} className="text-amber-300" />,
      bannerBg: 'from-rose-900 via-red-950 to-slate-950',
      borderColor: 'border-rose-500/80',
      badgeColor: 'bg-rose-600',
      morale: 75,
    }
  ], [king, lords, levyPeasants.length, employedPeasants.length, peasants]);

  const handleBannerClick = (reg: typeof regiments[0]) => {
    if (reg.unitType === 'retinue' && king) {
      setSelectedEntityId(king.id);
      if (king.position) setCameraFocusTarget([king.position[0], king.position[2]]);
    } else if (reg.unitType === 'levy') {
      if (king) {
        callLevyMilitia(king.id);
      }
    } else if (reg.unitType === 'workers') {
      const firstWorker = employedPeasants[0];
      if (firstWorker && firstWorker.position) {
        setSelectedEntityId(firstWorker.id);
        setCameraFocusTarget([firstWorker.position[0], firstWorker.position[2]]);
      }
    }
  };

  return (
    <div className="absolute top-16 right-3 flex items-start gap-1.5 pointer-events-auto z-20 select-none">
      {regiments.map((reg) => {
        const Icon = reg.icon;
        const isSelected = selectedEntityId === reg.leader?.id;

        return (
          <button
            key={reg.id}
            onClick={() => handleBannerClick(reg)}
            className={`group relative flex flex-col items-center w-11 transition transform hover:-translate-y-1 focus:outline-none ${
              isSelected ? 'scale-105 drop-shadow-[0_0_12px_rgba(212,175,55,0.7)]' : ''
            }`}
            title={`${reg.name} (${reg.count}/${reg.maxCount}) — Клікніть для вибору`}
          >
            <div className={`w-full bg-gradient-to-b ${reg.bannerBg} rounded-t-sm border-x border-t ${reg.borderColor} shadow-2xl flex flex-col items-center pt-1.5 pb-2 px-1 relative`}>
              
              <div className="w-7 h-8 rounded-b-md bg-[#16141a] border border-amber-400/80 shadow-md flex items-center justify-center mb-1 group-hover:scale-110 transition">
                {reg.crestNode}
              </div>

              <Icon size={14} className="text-amber-200/90 my-0.5" />

              <div className="text-[10px] font-mono font-bold text-slate-100 mt-0.5 tracking-tighter">
                {reg.count}
              </div>

              <div className="text-[8px] font-mono text-slate-400">
                /{reg.maxCount}
              </div>

              <div className="w-6 h-1 rounded-full bg-slate-800 mt-1 overflow-hidden border border-slate-700">
                <div 
                  className={`h-full ${reg.badgeColor}`} 
                  style={{ width: `${reg.morale}%` }} 
                />
              </div>

              <div className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-b from-transparent to-black/30 flex justify-between overflow-hidden">
                <div className="w-1/2 h-full bg-inherit border-l border-b border-inherit -skew-y-12" />
                <div className="w-1/2 h-full bg-inherit border-r border-b border-inherit skew-y-12" />
              </div>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition duration-150 absolute top-full mt-2.5 px-2 py-1 bg-slate-950/95 border border-amber-500/60 rounded text-[10px] font-cinzel font-bold text-amber-200 whitespace-nowrap shadow-xl pointer-events-none z-30">
              {reg.name}
            </div>
          </button>
        );
      })}
    </div>
  );
}
