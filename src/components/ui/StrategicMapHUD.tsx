import { useGameStore } from '../../store/useGameStore';
import { Pause, Play } from 'lucide-react';

export function StrategicMapHUD() {
  const regions = useGameStore((s) => s.regions);
  const playerRegionId = useGameStore((s) => s.playerRegionId);
  const time = useGameStore((s) => s.time);
  const togglePause = useGameStore((s) => s.togglePause);
  const setSpeedMultiplier = useGameStore((s) => s.setSpeedMultiplier);
  const setCameraZoomTarget = useGameStore((s) => s.setCameraZoomTarget);
  const setCameraFocusTarget = useGameStore((s) => s.setCameraFocusTarget);

  const handleReturnTo3D = (center?: [number, number]) => {
    if (center) {
      setCameraFocusTarget(center);
    }
    setCameraZoomTarget(38.0);
  };

  const seasonLabels: Record<string, string> = {
    Spring: 'Весна',
    Summer: 'Літо',
    Autumn: 'Осінь',
    Winter: 'Зима',
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40 p-4 font-cinzel select-none animate-in fade-in duration-300">
      <div className="w-full flex items-center justify-between pointer-events-auto">
        <div className="w-24 hidden lg:block" />

        <div className="hidden md:flex items-center gap-2 bg-[#18140e]/95 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-amber-600/70 shadow-2xl mx-auto">
          {regions.map((reg) => {
            const isPlayer = reg.id === playerRegionId;
            return (
              <button
                key={reg.id}
                onClick={() => handleReturnTo3D(reg.campPosition || reg.center)}
                title={`Перейти до володіння ${reg.name}`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 group cursor-pointer ${
                  isPlayer
                    ? 'bg-amber-950/80 border border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                    : 'bg-[#1e1912]/80 hover:bg-[#2c2217] border border-stone-700/60 hover:border-amber-500/60'
                }`}
              >
                <span className="text-base group-hover:scale-110 transition">{reg.heraldryIcon}</span>
                <div className="text-left">
                  <div className={`text-[11px] font-bold tracking-wider leading-none ${isPlayer ? 'text-amber-300' : 'text-stone-200'}`}>
                    {reg.name}
                  </div>
                  <div className="text-[9px] text-stone-400 font-sans leading-tight">
                    {isPlayer ? 'Ваше' : reg.lordName.split(' ')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 bg-[#18140e]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-600/60 shadow-2xl text-xs ml-auto">
          <div className="flex items-center gap-1.5 font-mono text-amber-200 mr-2 text-[11px]">
            <span>{seasonLabels[time.season] || time.season}</span>
            <span className="text-stone-500">•</span>
            <span>День {time.day}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={togglePause}
              className={`p-1.5 rounded-lg border transition ${
                time.isPaused
                  ? 'bg-amber-600 text-black border-amber-400 font-bold'
                  : 'bg-stone-900/80 hover:bg-stone-800 text-amber-300 border-stone-700'
              }`}
              title="Пауза [Пробіл]"
            >
              {time.isPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} />}
            </button>

            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition border ${
                  time.speedMultiplier === spd && !time.isPaused
                    ? 'bg-amber-600/90 text-black border-amber-400'
                    : 'bg-stone-900/80 hover:bg-stone-800 text-stone-300 border-stone-700'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
