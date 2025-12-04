import React from 'react';
import { TILE_SCORES } from '../constants';

interface BoardProps {
  grid: string[][];
}

const COL_HEADERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
const ROW_HEADERS = Array.from({ length: 15 }, (_, i) => i + 1);

const Board: React.FC<BoardProps> = ({ grid }) => {
  return (
    <div className="w-full max-w-[850px] mx-auto container-type-size">
      {/* Dark Outer Border/Frame */}
      <div className="bg-gray-800 p-3 rounded-md shadow-xl">
        {/* 
            16x16 Grid:
            - 1 column for row headers + 15 columns for board = 16
            - 1 row for col headers + 15 rows for board = 16 
            - gridTemplateRows ensures rows don't stretch based on content
        */}
        <div 
          className="grid gap-[2px] bg-gray-800 aspect-square" 
          style={{ 
            gridTemplateColumns: 'repeat(16, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(16, minmax(0, 1fr))' 
          }}
        >
          
          {/* Top Left Empty Corner */}
          <div className="bg-gray-300 rounded-[1px]"></div>

          {/* Column Headers (A-O) */}
          {COL_HEADERS.map((col) => (
            <div key={`col-${col}`} className="bg-gray-300 flex items-center justify-center rounded-[1px]">
              <span className="font-bold text-gray-700 text-[clamp(8px,2cqw,16px)]">{col}</span>
            </div>
          ))}

          {/* Board Rows */}
          {grid.map((row, rIndex) => (
            <React.Fragment key={`row-${rIndex}`}>
              {/* Row Header (1-15) */}
              <div className="bg-gray-300 flex items-center justify-center rounded-[1px]">
                 <span className="font-bold text-gray-700 text-[clamp(8px,2cqw,16px)]">{ROW_HEADERS[rIndex]}</span>
              </div>

              {/* Board Cells */}
              {row.map((cell, cIndex) => {
                // Determine background based on content if not a letter
                let bgClass = 'bg-[#e7eaed]'; // Default empty
                let label = null;
                let labelColor = 'text-gray-400';

                const isTile = cell && /[A-Za-z]/.test(cell);
                const rawChar = cell;

                if (!isTile) {
                  switch (rawChar) {
                    case '=': 
                      bgClass = 'bg-[#ff5252]'; // TW - Red
                      label = "TW";
                      labelColor = "text-white/90";
                      break;
                    case '-': 
                      bgClass = 'bg-[#ffb7b2]'; // DW - Pink
                      label = "DW";
                      labelColor = "text-red-900/60";
                      break;
                    case '"': 
                      bgClass = 'bg-[#448aff]'; // TL - Blue
                      label = "TL";
                      labelColor = "text-white/90";
                      break;
                    case '\'': 
                      bgClass = 'bg-[#90caf9]'; // DL - Light Blue
                      label = "DL";
                      labelColor = "text-blue-900/60";
                      break;
                    default: 
                      bgClass = 'bg-[#e0e3e6]'; // Normal empty
                      break;
                  }
                }

                const letter = isTile ? cell.toUpperCase() : null;
                const score = letter && TILE_SCORES[letter] !== undefined ? TILE_SCORES[letter] : null;

                return (
                  <div 
                    key={`${rIndex}-${cIndex}`} 
                    className={`relative w-full h-full flex items-center justify-center rounded-[1px] ${bgClass}`}
                  >
                    {/* Square Label (TW/DL etc) if empty */}
                    {!letter && label && (
                        <span className={`text-[clamp(6px,1.8cqw,12px)] font-bold tracking-tighter select-none ${labelColor}`}>
                            {label}
                        </span>
                    )}

                    {/* Tile Content */}
                    {letter && (
                        // Tile Container (Shadow/Border)
                        <div className="relative w-[92%] h-[92%] flex items-center justify-center bg-[#eab308] rounded-[2px] shadow-sm z-10">
                             {/* Tile Face (Lighter) */}
                             <div className="absolute top-[1px] left-[1px] right-[2px] bottom-[2px] bg-[#fff9c4] rounded-[1px] flex items-center justify-center">
                                {/* Letter */}
                                <span className="text-[clamp(12px,4.5cqw,32px)] font-bold text-gray-900 select-none transform translate-y-[-2%]">
                                  {letter}
                                </span>
                                
                                {/* Score - Upper Right */}
                                {score !== null && (
                                    <span className="absolute top-[2%] right-[4%] text-[clamp(6px,1.6cqw,11px)] font-bold leading-none text-gray-800 select-none">
                                        {score}
                                    </span>
                                )}
                             </div>
                        </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <style>{`
        .container-type-size {
          container-type: inline-size;
        }
      `}</style>
    </div>
  );
};

export default Board;