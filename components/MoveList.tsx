import React, { useEffect, useRef } from 'react';
import { Move } from '../types';
import { Trophy, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface MoveListProps {
  moves: Move[];
}

const MoveList: React.FC<MoveListProps> = ({ moves }) => {
  const playedRowRef = useRef<HTMLTableRowElement>(null);

  // Find the win percentage of the best move (rank 1 or "best")
  const bestMove = moves.find(m => m.isBest);
  const bestWinProb = bestMove && bestMove.winProb ? parseFloat(bestMove.winProb.replace('%', '')) : 0;

  useEffect(() => {
    if (playedRowRef.current) {
      playedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [moves]);

  if (moves.length === 0) {
    return (
      <div className="p-12 text-gray-400 italic text-center flex flex-col items-center gap-3">
        <AlertCircle size={32} className="opacity-50" />
        <span>No move analysis available for this turn.</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative h-full flex flex-col">
      <table className="min-w-full text-sm text-left border-collapse">
        <thead className="bg-gray-100 text-gray-600 font-semibold border-b sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="py-3 px-4">Rank</th>
            <th className="py-3 px-4">Pos</th>
            <th className="py-3 px-4">Word</th>
            <th className="py-3 px-4 text-right">Pts</th>
            <th className="py-3 px-4 text-right">Win%</th>
            <th className="py-3 px-4 text-right text-gray-500">Diff</th>
            <th className="py-3 px-4 text-gray-500">Leave</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {moves.map((move, idx) => {
            const isBest = move.isBest;
            const isPlayed = move.isPlayed;
            const isExchange = move.coordinate === 'xch';
            
            let rowClass = "hover:bg-gray-50 transition-colors group";
            if (isPlayed) {
                rowClass = "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-l-yellow-400";
            } else if (isBest) {
                rowClass = "bg-blue-50/50 hover:bg-blue-100";
            }
            
            const currentWinProb = move.winProb ? parseFloat(move.winProb.replace('%', '')) : 0;
            const delta = bestWinProb - currentWinProb;
            // Only show delta if valid and not the best move itself (or show 0.00 for best)
            const showDelta = move.winProb && bestWinProb > 0;

            return (
              <tr 
                key={idx} 
                className={rowClass}
                ref={isPlayed ? playedRowRef : null}
              >
                <td className="py-2 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {isBest && <Trophy size={14} className="text-blue-500 shrink-0" />}
                    {isPlayed && (
                        <div className="flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-200 px-1.5 py-0.5 rounded-full shadow-sm">
                            <CheckCircle2 size={12} />
                            <span>PLAYED</span>
                        </div>
                    )}
                    {!isPlayed && !isBest && (
                        <span className="font-mono text-gray-400 w-4 text-center">{move.rank.replace('*', '')}</span>
                    )}
                    {(isPlayed || isBest) && !isPlayed && (
                       <span className="font-mono text-gray-700 font-bold">{move.rank.replace('best', '1')}</span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-4 font-mono text-gray-700">
                    {isExchange ? (
                        <span className="flex items-center gap-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-md w-fit">
                            <RefreshCw size={10} />
                            EXCH
                        </span>
                    ) : move.coordinate}
                </td>
                <td className="py-2 px-4 font-medium text-gray-900 text-base">
                    {isExchange ? <span className="font-mono tracking-widest text-sm">{move.word}</span> : move.word}
                </td>
                <td className="py-2 px-4 text-right font-mono font-bold text-gray-800">{move.score}</td>
                <td className="py-2 px-4 text-right text-gray-700 font-mono text-sm">{move.winProb}</td>
                <td className="py-2 px-4 text-right text-red-500 font-mono text-sm">
                    {showDelta && delta > 0.001 ? `-${delta.toFixed(2)}` : ''}
                </td>
                <td className="py-2 px-4 font-mono tracking-widest text-xs text-gray-400 uppercase">{move.leave}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MoveList;