import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useTranslation } from '../../i18n';
import {
  ScrollIcon,
  CrossCloseIcon,
  DiplomacyPactIcon,
  ScalesIcon,
  WeaponsIcon,
} from './MedievalIcons';

export const NotificationsBar: React.FC = React.memo(() => {
  const { dict } = useTranslation();
  const activeCorrespondence = useGameStore((s) => s.activeCorrespondence);
  const dismissCorrespondence = useGameStore((s) => s.dismissCorrespondence);
  const addChronicleEvent = useGameStore((s) => s.addChronicleEvent);

  const [isOpenLetter, setIsOpenLetter] = useState(false);

  const handleRespond = (responseType: 'friendly' | 'neutral' | 'hostile') => {
    if (responseType === 'friendly') {
      addChronicleEvent({
        title: dict.diplomacy.friendlyTitle,
        description: dict.diplomacy.friendlyDesc,
        type: 'success',
      });
    } else if (responseType === 'hostile') {
      addChronicleEvent({
        title: dict.diplomacy.hostileTitle,
        description: dict.diplomacy.hostileDesc,
        type: 'warning',
      });
    } else {
      addChronicleEvent({
        title: dict.diplomacy.neutralTitle,
        description: dict.diplomacy.neutralDesc,
        type: 'info',
      });
    }
    dismissCorrespondence();
    setIsOpenLetter(false);
  };

  if (!activeCorrespondence) return null;

  return (
    <>
      {!isOpenLetter && (
        <div className="absolute top-16 left-4 pointer-events-auto z-40 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => setIsOpenLetter(true)}
            className="bg-[#181510]/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-500/80 shadow-[0_8px_30px_rgba(0,0,0,0.9)] text-amber-200 text-xs font-cinzel font-bold tracking-wider flex items-center gap-2 hover:bg-[#252018] transition cursor-pointer"
          >
            <ScrollIcon className="w-4 h-4 text-amber-400" />
            <span>{activeCorrespondence.title}</span>
          </button>
        </div>
      )}

      {isOpenLetter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto select-none p-4 font-cinzel">
          <div className="bg-[#181510] border-2 border-[#8c6b38] rounded-2xl p-6 max-w-lg w-full shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#4a3a22] pb-3">
              <div className="flex items-center gap-2.5">
                <ScrollIcon className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-amber-100 tracking-wider uppercase">
                  {activeCorrespondence.title}
                </h3>
              </div>
              <button
                onClick={() => setIsOpenLetter(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title={dict.diplomacy.close}
              >
                <CrossCloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#241e15] border border-[#52422d] p-4 rounded-xl text-xs text-amber-100 leading-relaxed font-serif shadow-inner">
              <p className="font-bold text-amber-300 mb-2">
                {dict.diplomacy.letterGreeting}
              </p>
              <p className="mb-3 font-sans">
                {activeCorrespondence.message}
              </p>
              <div className="text-right italic text-amber-200/80 font-cinzel text-[11px]">
                — {activeCorrespondence.sender}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-[#4a3a22]">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                {dict.diplomacy.chooseResponse}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleRespond('friendly')}
                  className="px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  <DiplomacyPactIcon className="w-4 h-4" />
                  <span>{dict.diplomacy.friendly}</span>
                </button>
                <button
                  onClick={() => handleRespond('neutral')}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  <ScalesIcon className="w-4 h-4" />
                  <span>{dict.diplomacy.neutral}</span>
                </button>
                <button
                  onClick={() => handleRespond('hostile')}
                  className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/60 text-rose-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  <WeaponsIcon className="w-4 h-4" />
                  <span>{dict.diplomacy.hostile}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

NotificationsBar.displayName = 'NotificationsBar';
