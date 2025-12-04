import React from 'react';
import { ChevronLeft, ChevronRight, SkipBack, SkipForward, Upload } from 'lucide-react';

interface ControlsProps {
  currentTurn: number;
  totalTurns: number;
  onNext: () => void;
  onPrev: () => void;
  onFirst: () => void;
  onLast: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string | null;
}

const Controls: React.FC<ControlsProps> = ({ 
  currentTurn, 
  totalTurns, 
  onNext, 
  onPrev, 
  onFirst, 
  onLast,
  onUpload,
  fileName
}) => {
  return (
    <div className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
         <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-800">Quackle Replay</h1>
            <span className="text-xs text-gray-500 truncate max-w-[150px]" title={fileName || ''}>
                {fileName ? fileName : 'No file loaded'}
            </span>
         </div>
         <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700 transition-colors shadow-sm">
            <Upload size={16} />
            <span className="text-sm font-medium">Upload Report</span>
            <input type="file" onChange={onUpload} className="hidden" accept=".txt" />
         </label>
      </div>

      <div className="flex items-center justify-center gap-2 mt-2">
        <button 
          onClick={onFirst} 
          disabled={currentTurn === 0}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="First Turn"
        >
          <SkipBack size={20} />
        </button>
        <button 
          onClick={onPrev} 
          disabled={currentTurn === 0}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
           title="Previous Turn"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="px-4 py-1 bg-gray-50 rounded-md border border-gray-200 min-w-[100px] text-center">
            <span className="text-sm font-semibold text-gray-700">Turn {currentTurn + 1}</span>
            <span className="text-xs text-gray-400 mx-1">/</span>
            <span className="text-xs text-gray-500">{totalTurns}</span>
        </div>

        <button 
          onClick={onNext} 
          disabled={currentTurn === totalTurns - 1}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
           title="Next Turn"
        >
          <ChevronRight size={24} />
        </button>
        <button 
          onClick={onLast} 
          disabled={currentTurn === totalTurns - 1}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
           title="Last Turn"
        >
          <SkipForward size={20} />
        </button>
      </div>
    </div>
  );
};

export default Controls;
