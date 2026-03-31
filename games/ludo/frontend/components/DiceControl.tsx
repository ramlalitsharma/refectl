import React from 'react';
import { Button } from '@/components/ui/Button';
import { LudoDiceFace } from './LudoDiceFace';

type DiceControlProps = {
  diceValue: number | null;
  lastRoll: number | null;
  rolling: boolean;
  canRoll: boolean;
  winner: string | null;
  aiThinking: boolean;
  disabledBecauseAi: boolean;
  actionLabel: string;
  onRoll: () => void;
  onReset: () => void;
  resetLabel?: string;
  compact?: boolean;
};

export function DiceControl({
  diceValue,
  lastRoll,
  rolling,
  canRoll,
  winner,
  aiThinking,
  disabledBecauseAi,
  actionLabel,
  onRoll,
  onReset,
  resetLabel = 'Reset Match',
  compact = false,
}: DiceControlProps) {
  const rollEnabled = canRoll && !rolling && !winner && !disabledBecauseAi;
  const rollValue = diceValue ?? lastRoll ?? null;
  const turnState = rolling
    ? 'Rolling'
    : aiThinking
      ? 'Computer Turn'
      : canRoll
        ? 'Ready To Roll'
        : 'Waiting For Move';

  return (
    <div
      className={`relative flex flex-wrap items-stretch gap-3 overflow-hidden rounded-[2rem] border border-[#2f5db8]/45 bg-[radial-gradient(circle_at_top,rgba(77,123,229,0.55),rgba(20,45,108,0.96)_58%,rgba(10,22,60,1)_100%)] p-4 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl ${
        compact ? 'rounded-[1.6rem] p-3' : 'xl:justify-end'
      }`}
    >
      <span className="pointer-events-none absolute inset-x-5 top-0 h-[3px] rounded-full bg-[#ffe06a]/75 shadow-[0_0_18px_rgba(255,224,106,0.85)]" />
      <div className={`min-w-[180px] rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,18,48,0.84),rgba(6,16,42,0.92))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${compact ? 'min-w-0' : ''}`}>
        <p className="text-[10px] uppercase tracking-[0.35em] text-slate-300">Turn State</p>
        <p className="mt-2 text-xl font-black text-white">{turnState}</p>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-[1.1rem] border border-[#f0cf52]/35 bg-[linear-gradient(180deg,rgba(245,223,231,0.94),rgba(223,186,196,0.76))] px-3 py-2 shadow-[inset_0_2px_0_rgba(255,255,255,0.72),0_10px_20px_-18px_rgba(255,215,64,0.9)]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#17315d]/70">Roll</span>
            <p className="mt-1 text-2xl font-black text-[#17315d]">{rollValue ?? '-'}</p>
          </div>
          <div className="rounded-[1rem] border border-[#f0cf52]/65 bg-[linear-gradient(180deg,rgba(255,226,106,0.28),rgba(23,49,93,0.02))] p-1">
            <LudoDiceFace
              value={rollValue}
              rolling={rolling}
              pipColor={canRoll ? '#f59e0b' : '#38bdf8'}
              glowColor={canRoll ? 'rgba(245,158,11,0.3)' : 'rgba(56,189,248,0.24)'}
              className="h-11 w-11 border-[2px]"
            />
          </div>
        </div>
      </div>
      <div className={`grid gap-3 ${compact ? 'min-w-[0] grid-cols-2' : 'min-w-[220px] sm:min-w-[260px]'}`}>
        <Button
          onClick={onRoll}
          disabled={!canRoll || rolling || Boolean(winner) || disabledBecauseAi}
          className={`h-12 rounded-2xl border border-[#efcf50] bg-[linear-gradient(180deg,#ffe06a,#ffbf21)] text-[#17315d] shadow-[inset_0_2px_0_rgba(255,255,255,0.65),0_14px_24px_-18px_rgba(255,210,64,0.8)] hover:brightness-105 ${
            rollEnabled ? 'ring-2 ring-[#ffe06a]/40' : 'opacity-75'
          }`}
        >
          {rolling ? 'Rolling...' : aiThinking ? 'Computer Thinking...' : actionLabel}
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          className="h-12 rounded-2xl border-white/20 bg-[#123276]/70 text-white hover:bg-[#1a418d]"
        >
          {resetLabel}
        </Button>
      </div>
    </div>
  );
}

