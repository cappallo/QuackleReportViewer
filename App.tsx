import React, { useState, useEffect, useMemo } from 'react';
import { parseGameReport } from './utils/parser';
import { GameData, PlayerState } from './types';
import Board from './components/Board';
import Controls from './components/Controls';
import MoveList from './components/MoveList';
import { User, Layers, Hash, Upload as UploadIcon, UserCheck } from 'lucide-react';

const App: React.FC = () => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseGameReport(text);
      if (parsed.turns.length > 0) {
        setGameData(parsed);
        setCurrentTurnIndex(0);
      } else {
        alert("Could not parse turns from this file. Please ensure it is a valid Quackle text report.");
      }
    };
    reader.readAsText(file);
  };

  const handleNext = () => {
    if (gameData && currentTurnIndex < gameData.turns.length - 1) {
      setCurrentTurnIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (gameData && currentTurnIndex > 0) {
      setCurrentTurnIndex(prev => prev - 1);
    }
  };

  const handleFirst = () => setCurrentTurnIndex(0);
  const handleLast = () => {
    if (gameData) setCurrentTurnIndex(gameData.turns.length - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameData, currentTurnIndex]);

  const currentTurn = gameData ? gameData.turns[currentTurnIndex] : null;

  // Identify two main players to keep UI slots consistent
  const [player1Name, player2Name] = useMemo(() => {
     if (!gameData || gameData.players.length === 0) return ['Player 1', 'Player 2'];
     return [gameData.players[0], gameData.players[1] || 'Opponent'];
  }, [gameData]);

  // Determine state for fixed slots based on current turn
  let p1State: PlayerState | null = null;
  let p2State: PlayerState | null = null;
  let p1IsActive = false;
  let p2IsActive = false;

  if (currentTurn) {
      if (currentTurn.activePlayer.name === player1Name) {
          p1State = currentTurn.activePlayer;
          p2State = currentTurn.opponent;
          p1IsActive = true;
      } else {
          // If active player is P2, or unknown
          p1State = currentTurn.opponent; // P1 must be opponent
          p2State = currentTurn.activePlayer;
          p2IsActive = true;
          
          // Double check names in case of parsing weirdness, map by name if possible
          if (currentTurn.activePlayer.name === player2Name) {
              // Standard case
          } else if (currentTurn.opponent.name === player2Name) {
              // Should not happen if P2 is active, but safe fallback
              p2State = currentTurn.opponent;
          }
      }
  }

  // Fallback defaults if null
  const safeP1 = p1State || { name: player1Name, score: 0, rack: '' };
  const safeP2 = p2State || { name: player2Name, score: 0, rack: '' };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        
        {/* Header / Controls */}
        <div className="mb-6">
          <Controls 
            currentTurn={currentTurnIndex}
            totalTurns={gameData?.turns.length || 0}
            onNext={handleNext}
            onPrev={handlePrev}
            onFirst={handleFirst}
            onLast={handleLast}
            onUpload={handleFileUpload}
            fileName={fileName}
          />
        </div>

        {!gameData ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm text-center">
             <div className="bg-indigo-50 p-4 rounded-full mb-4">
               <UploadIcon size={48} className="text-indigo-500" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload a Game Report</h2>
             <p className="text-gray-500 max-w-md">
               Select a Quackle text export file to visualize the game, review moves, and analyze strategy.
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Column: Board */}
            <div className="lg:col-span-7 flex justify-center w-full">
               <div className="w-full">
                  {currentTurn && <Board grid={currentTurn.board} />}
               </div>
            </div>

            {/* Right Column: Info & Analysis */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Scoreboard Card */}
              {currentTurn && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden shrink-0">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                     <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                       <User size={18} /> Players
                     </h3>
                     <span className="text-xs font-mono bg-white border px-2 py-0.5 rounded text-gray-500">
                        Turn {currentTurn.turnNumber}
                     </span>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100">
                     <PlayerScoreCard 
                        player={safeP1} 
                        isActive={p1IsActive} 
                     />
                     <PlayerScoreCard 
                        player={safeP2} 
                        isActive={p2IsActive} 
                     />
                  </div>
                </div>
              )}

              {/* Analysis Panel */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden max-h-[600px]">
                 <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 shrink-0">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                       <Layers size={18} /> Move Analysis
                    </h3>
                 </div>
                 <div className="overflow-y-auto custom-scrollbar">
                    {currentTurn && <MoveList moves={currentTurn.moves} />}
                 </div>
                 <div className="p-2 bg-gray-50 text-xs text-center text-gray-400 border-t shrink-0">
                    * = Played Move | Trophy = Best Move
                 </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const PlayerScoreCard = ({ player, isActive }: { player: PlayerState, isActive: boolean }) => (
    <div className={`p-4 flex flex-col items-center transition-colors ${isActive ? 'bg-indigo-50/60' : ''}`}>
        <div className="flex items-center gap-1.5 mb-1">
            {isActive && <UserCheck size={14} className="text-indigo-600" />}
            <span className={`text-sm uppercase tracking-wider font-semibold ${isActive ? 'text-indigo-700' : 'text-gray-400'}`}>
                {isActive ? 'To Play' : 'Waiting'}
            </span>
        </div>
        
        <span className={`text-lg font-bold truncate max-w-full ${isActive ? 'text-indigo-900' : 'text-gray-800'}`}>
            {player.name || 'Unknown'}
        </span>
        <div className="text-3xl font-black text-gray-900 my-1 font-mono">
            {isNaN(player.score) ? '-' : player.score}
        </div>
        <div className="mt-2 flex items-center gap-1">
             <div className="flex gap-1 flex-wrap justify-center">
                {player.rack ? player.rack.split('').map((char: string, i: number) => (
                    <span key={i} className="w-5 h-5 flex items-center justify-center bg-[#f4d03f] text-[10px] font-bold border border-[#b7950b] rounded-[2px] shadow-sm uppercase">
                        {char}
                    </span>
                )) : <span className="text-xs text-gray-400 italic">Empty</span>}
             </div>
        </div>
    </div>
);

export default App;