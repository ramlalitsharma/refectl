import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { LudoEngine, type LudoState } from '@/games/ludo/core/engine';
import { MODE_META, PLAYER_STYLES } from '../ludoUiTokens';

type GameHudProps = {
  mode: keyof typeof MODE_META;
  state: LudoState;
};

export function GameHud({ mode, state }: GameHudProps) {
  const currentPlayer = LudoEngine.getCurrentPlayer(state);
  const currentStyle = PLAYER_STYLES[currentPlayer.id];
  const modeMeta = MODE_META[mode];

  const currentTokens = state.tokens[currentPlayer.id];
  const finishedCount = currentTokens.filter((token) => token.steps === 57).length;
  const inBaseCount = currentTokens.filter((token) => token.steps === -1).length;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="info" size="sm">
          {modeMeta.label}
        </Badge>
        <span className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Turn {state.turn}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${currentStyle.token} ${currentStyle.tokenText} text-xl font-black shadow-lg`}
        >
          {currentStyle.label.slice(0, 1)}
        </div>

        <div className="min-w-[220px] flex-1">
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Current Turn</p>
          <p className="mt-1 text-2xl font-semibold text-white">{currentStyle.label}</p>
          <p className="mt-2 text-sm text-slate-300">{modeMeta.description}</p>
        </div>

        <div className={`rounded-[1.6rem] border ${currentStyle.border} bg-gradient-to-br ${currentStyle.panel} px-4 py-3`}>
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Seat Focus</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-400">In Base</p>
              <p className="text-xl font-semibold text-white">{inBaseCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Finished</p>
              <p className="text-xl font-semibold text-white">{finishedCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

