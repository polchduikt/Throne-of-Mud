import type { GameEntity } from '../../../engine/ecs/world';
import { world } from '../../../engine/ecs/world';
import { BUILDING_BLUEPRINTS } from '../../../engine/buildings/blueprints';
import {
  CrownIcon,
  PeasantsIcon,
  GoldIcon,
  WoodIcon,
} from '../MedievalIcons';
import { Plus, Minus } from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';
import { useTranslation } from '../../../i18n';
import { MIN_BUILDING_WAGE, MAX_BUILDING_WAGE } from '../../../constants/economy';

interface BuildingInspectorSectionProps {
  entity: GameEntity;
  isForeign: boolean;
  ownerRegionName?: string;
  ownerLordName?: string;
  freePeasantsCount: number;
  lords: GameEntity[];
}

export function BuildingInspectorSection({
  entity,
  isForeign,
  ownerRegionName,
  ownerLordName,
  freePeasantsCount,
  lords,
}: BuildingInspectorSectionProps) {
  const { dict, language } = useTranslation();
  const {
    assignWorkerToBuilding,
    removeWorkerFromBuilding,
    assignLordToBuilding,
    setBuildingWage,
  } = useGameStore();

  const bType = entity.buildingType;
  if (!bType) return null;

  const blueprint = BUILDING_BLUEPRINTS[bType];
  const defaultWage = blueprint?.defaultWage ?? 2;
  const currentWage = entity.wage ?? defaultWage;
  const maxSlots = entity.workerSlots ?? blueprint?.workSlots ?? 1;
  const assignedWorkers = entity.assignedWorkers || [];

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/40 flex flex-col gap-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">{dict.inspector.status}:</span>
          <span className="font-bold text-emerald-400">
            {entity.isCompleted ? dict.buildings.statusCompleted : dict.buildings.statusUnderConstruction}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">{dict.buildings.hp}:</span>
          <span className="font-mono text-slate-200">
            {entity.buildingHealth} / {entity.maxBuildingHealth}
          </span>
        </div>
      </div>

      {blueprint && (
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
          {dict.buildings.items[bType]?.description || blueprint.description}
        </p>
      )}

      {isForeign && (
        <div className="bg-amber-950/40 border border-amber-600/60 p-3 rounded-xl flex flex-col gap-1.5 text-xs shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <div>
              <div className="font-bold text-amber-200 uppercase tracking-wider text-[11px]">
                {dict.inspector.foreignTerritory}
              </div>
              <div className="text-[11px] text-slate-300">
                {dict.inspector.foreignOwner}: <span className="font-semibold text-amber-300">{ownerLordName || (language === 'uk' ? 'Сусідній правитель' : 'Neighboring Lord')}</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 bg-black/40 p-2 rounded-lg border border-amber-900/40 leading-snug">
            {language === 'uk'
              ? `Ця споруда розташована в регіоні ${ownerRegionName || 'Сусідні землі'}. Ви не маєте юрисдикції наймати тут робітників або змінювати платню.`
              : `This structure is located in ${ownerRegionName || 'neighboring fief'}. You have no jurisdiction to appoint workers or adjust wages here.`}
          </div>
        </div>
      )}

      {entity.isCompleted && (blueprint?.maxStorage || entity.buildingType === 'lumberjack_hut' || entity.buildingType === 'stockpile') && (() => {
        const maxStorage = blueprint?.maxStorage || (entity.buildingType === 'lumberjack_hut' ? 20 : 100);
        const storedWood = entity.localInventory?.wood || 0;
        const isFull = storedWood >= maxStorage;
        const pct = Math.min(100, Math.round((storedWood / maxStorage) * 100));

        return (
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🪵</span>
                {dict.buildings.storage} ({dict.buildings.capacity})
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                  isFull
                    ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse'
                    : storedWood > 0
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                    : 'bg-slate-900 text-slate-400 border-slate-750'
                }`}
              >
                {isFull ? dict.buildings.storageFull : `${storedWood} / ${maxStorage}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">{language === 'uk' ? 'Наявний запас:' : 'Current Stock:'}</span>
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <WoodIcon className="w-3.5 h-3.5 text-amber-500" />
                {dict.hud.wood}:
              </span>
              <span className="font-mono font-bold text-amber-300">
                {storedWood} / {maxStorage}
              </span>
            </div>

            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isFull ? 'bg-rose-500' : storedWood > 14 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {isFull ? (
              <div className="text-[10px] text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-800/50 flex flex-col gap-0.5">
                <span className="font-bold">{dict.buildings.storageFull} ({maxStorage}/{maxStorage})</span>
                <span className="text-slate-300">
                  {language === 'uk'
                    ? 'Лісоруби припинили вирубку лісу, щоб не винищувати дерева даремно. Витратьте деревину на будівництво, щоб відновити роботу.'
                    : 'Woodcutters paused logging to avoid wasting felled timber. Consume logs for construction to resume operations.'}
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 leading-tight">
                {language === 'uk'
                  ? `Лісоруби рубають навколишні дерева та заповнюють сховище хатини (до ${maxStorage} од.).`
                  : `Workers harvest surrounding woodland and fill internal storage (up to ${maxStorage} logs).`}
              </span>
            )}
          </div>
        );
      })()}

      {entity.isCompleted && !isForeign && (
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <PeasantsIcon className="w-3.5 h-3.5 text-amber-400" />
              {dict.buildings.workers}
            </span>
            <span className="font-mono text-xs font-bold text-amber-300">
              {assignedWorkers.length} / {maxSlots}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {assignedWorkers.map((workerId) => {
              const worker = world.entities.find((e) => e.id === workerId);
              if (!worker) return null;

              return (
                <div
                  key={workerId}
                  className="flex items-center justify-between bg-slate-900/90 px-2 py-1.5 rounded-lg border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: worker.avatarColor || '#10b981' }}
                    >
                      <PeasantsIcon className="w-3.5 h-3.5 text-emerald-100" />
                    </div>
                    <span className="font-semibold text-slate-200 truncate">
                      {worker.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeWorkerFromBuilding(entity.id, workerId)}
                    className="px-2 py-0.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-[10px] rounded border border-rose-800/60 transition cursor-pointer"
                  >
                    {dict.inspector.removeWorker}
                  </button>
                </div>
              );
            })}

            {assignedWorkers.length < maxSlots && (
              <button
                onClick={() => assignWorkerToBuilding(entity.id)}
                disabled={freePeasantsCount === 0}
                className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                  freePeasantsCount > 0
                    ? 'bg-amber-950/70 hover:bg-amber-900/90 text-amber-300 border-amber-700/60 shadow-md active:scale-98'
                    : 'bg-slate-800/40 text-slate-500 border-slate-750 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                {dict.inspector.assignWorker} ({freePeasantsCount} {language === 'uk' ? 'вільних' : 'idle'})
              </button>
            )}
          </div>
        </div>
      )}

      {entity.isCompleted && !isForeign && (
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <CrownIcon className="w-3.5 h-3.5 text-amber-400" />
            {dict.buildings.assignedLord}
          </span>

          <select
            value={entity.assignedLordId || ''}
            onChange={(e) => {
              const val = e.target.value;
              assignLordToBuilding(entity.id, val ? val : null);
            }}
            className="bg-slate-900 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="">{dict.buildings.noLordAssigned}</option>
            {lords.map((lord) => (
              <option key={lord.id} value={lord.id}>
                {lord.name} (+{Math.min(100, 50 + (lord.skills?.intellect || 5) * 5)}% {language === 'uk' ? 'виробництво' : 'production'})
              </option>
            ))}
          </select>

          {entity.assignedLordId && (
            <div className="text-[10px] text-emerald-400 bg-emerald-950/30 p-1.5 rounded border border-emerald-900/40">
              {language === 'uk' ? 'Лорд наглядає за виробництвом: швидкість збільшено!' : 'Lord is supervising production: output boosted!'}
            </div>
          )}
        </div>
      )}

      {entity.isCompleted && !isForeign && (
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <GoldIcon className="w-3.5 h-3.5 text-amber-400" />
              {dict.buildings.wagePerDay}
            </span>
            <span className="font-mono text-xs font-bold text-amber-300">
              {currentWage} {dict.common.gold.toLowerCase()} / {dict.common.day.toLowerCase()}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setBuildingWage(entity.id, Math.max(MIN_BUILDING_WAGE, currentWage - 1));
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-1 bg-slate-900 rounded-lg font-mono font-bold text-amber-300 text-xs border border-slate-800">
                {currentWage} {dict.common.gold.toLowerCase()}
              </span>
              <button
                onClick={() => {
                  setBuildingWage(entity.id, Math.min(MAX_BUILDING_WAGE, currentWage + 1));
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[10px] text-slate-400">
              {language === 'uk' ? 'Мотивація робітників' : 'Worker incentive'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
