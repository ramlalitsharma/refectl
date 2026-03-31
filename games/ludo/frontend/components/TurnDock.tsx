import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Crown } from 'lucide-react';
import { LudoEngine, type LudoColor, type LudoState } from '@/games/ludo/core/engine';
import { PLAYER_STYLES } from '../ludoUiTokens';

type TurnDockProps = {
  state: LudoState;
};

export function TurnDock({ state }: TurnDockProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Race Table</p>
          <p className="mt-1 text-lg font-semibold text-white">All seats, one real board</p>
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-400">
          <Crown className="h-4 w-4" />
          Real captures and turn order active
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {LudoEngine.DEFAULT_PLAYERS.map((player, index) => {
          const style = PLAYER_STYLES[player.id];
          const playerTokens = state.tokens[player.id];
          const homeCount = playerTokens.filter((token) => token.steps === 57).length;
          const baseCount = playerTokens.filter((token) => token.steps === -1).length;
          const active = state.currentPlayerIndex === index;
          const isWinner = state.winner === (player.id as LudoColor);

          return (
            <div
              key={player.id}
              className={`rounded-[1.6rem] border px-4 py-4 transition ${
                active ? `${style.border} ${style.soft}` : 'border-white/10 bg-slate-950/60'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.token} ${style.tokenText} font-black`}>
                    {style.label.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{style.label}</p>
                    <p className="text-xs text-slate-400">{active ? 'Current turn' : 'Waiting'}</p>
                  </div>
                </div>
                {isWinner ? (
                  <Badge variant="warning" size="sm">
                    Winner
                  </Badge>
                ) : active ? (
                  <Badge variant="info" size="sm">
                    Turn
                  </Badge>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Base</p>
                  <p className="mt-1 font-semibold text-white">{baseCount}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Home</p>
                  <p className="mt-1 font-semibold text-white">{homeCount}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

