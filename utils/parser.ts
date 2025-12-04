import { GameData, Turn, Move, PlayerState } from '../types';

export const parseGameReport = (text: string): GameData => {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const turns: Turn[] = [];
  
  let currentTurn: Partial<Turn> | null = null;
  let buffer: string[] = [];
  let playersFound = new Set<string>();
  
  let turnCounter = 0;

  // Header regex: "Trev: Turn 1"
  const turnHeaderRegex = /^\s*([A-Za-z0-9?]+):\s+Turn\s+(\d+)/;
  // Board line regex: " 1| ... |"
  const boardLineRegex = /^\s*(\d+)\|(.+)\|/; 

  const processBuffer = () => {
    if (!currentTurn) return;

    // --- 1. Parse Board ---
    const grid: string[][] = Array(15).fill(null).map(() => Array(15).fill(' '));
    
    // We also use this loop to determine when to stop parsing players
    // Player info is ALWAYS above the board grid in Quackle reports.
    let stopParsingPlayers = false;

    buffer.forEach(line => {
      // If we hit a board row, we are past the player info section
      if (line.match(boardLineRegex)) {
          stopParsingPlayers = true;
      }

      const match = line.match(boardLineRegex);
      if (match) {
        const rowNum = parseInt(match[1], 10) - 1;
        const rowContent = match[2]; 
        
        if (rowNum >= 0 && rowNum < 15) {
            for (let c = 0; c < 15; c++) {
              const charIndex = c * 2; 
              if (charIndex < rowContent.length) {
                // Do NOT strip special characters (=, -, ", '), we need them for board layout
                const char = rowContent[charIndex];
                grid[rowNum][c] = char;
              }
            }
        }
      }
    });
    currentTurn.board = grid;

    // --- 2. Parse Players ---
    // Strategies to find player info (Name Rack Score) to the right of the board
    // We strip the first ~33 characters (board width) or split by pipe/arrow
    let activePlayerState: PlayerState = { name: 'Unknown', rack: '', score: 0 };
    let opponentState: PlayerState = { name: 'Opponent', rack: '', score: 0 };
    let hasFoundActive = false;
    let hasFoundOpponent = false;
    
    // Reset stop flag for the second pass (parsing logic)
    stopParsingPlayers = false;

    // Regex for "Name Rack Score"
    // Name: Alphanumeric
    // Rack: Uppercase letters or ? or # (Empty allowed via *)
    // Score: Number (can be negative)
    const playerRegex = /([A-Za-z0-9?]+)\s+([A-Za-z?#]*)\s+(-?\d+)/;

    buffer.forEach(line => {
        // Stop parsing players if we hit the board rows or analysis headers
        if (line.match(boardLineRegex) || line.includes('--Championship') || line.includes('Player\'s choices')) {
            stopParsingPlayers = true;
        }

        if (stopParsingPlayers) return;
        
        // Skip the turn header line itself (e.g., "Trev: Turn 1") to avoid parsing "Turn" as a rack
        if (line.match(turnHeaderRegex)) return;

        // Strip board part
        let content = line;
        
        // Remove board header "  A B C ..."
        if (line.trim().startsWith('A B C D')) {
            // Usually header is followed by "-> Name"
             if (line.includes('->')) {
                content = line.substring(line.indexOf('->'));
             } else {
                 // Or it's just the header, strip it carefully
                 // The header is "   A B C D E F G H I J K L M N O"
                 const headerStr = "A B C D E F G H I J K L M N O";
                 const idx = line.indexOf(headerStr);
                 if (idx !== -1) {
                     content = line.substring(idx + headerStr.length).trim();
                 } else if (line.length > 30) {
                     // Fallback trim
                     content = line.substring(30);
                 }
             }
        }
        // Remove horizontal dividers "  -----" or "----------------"
        else if (line.trim().startsWith('-')) {
             // Robustly strip dashes and leading/trailing spaces
             // "   -------   Name" -> "Name"
             content = line.trim().replace(/^-+/, '').trim();
        }

        const isActive = line.includes('->');
        content = content.replace('->', '').trim();

        const match = content.match(playerRegex);
        if (match) {
            const name = match[1];
            // Filter invalid names
            if (name === 'Turn' || name === 'Opponent') return;

            const rack = match[2];
            const score = parseInt(match[3], 10);
            
            if (name !== 'Unknown') {
                 playersFound.add(name);
            }

            const pState = { name, rack, score };
            
            if (isActive) {
                // If we found the arrow, this is definitely the active player
                activePlayerState = pState;
                hasFoundActive = true;
            } else {
                // It's the opponent if it's not the active line
                // Only set if we haven't found a definitive opponent yet, 
                // OR if the current opponent is unknown/placeholder
                if (!hasFoundOpponent || opponentState.name === 'Opponent') {
                    opponentState = pState;
                    hasFoundOpponent = true;
                }
            }
        }
    });

    currentTurn.activePlayer = activePlayerState;
    currentTurn.opponent = opponentState;


    // --- 3. Parse Moves ---
    const moves: Move[] = [];
    
    buffer.forEach(line => {
        let cleanAnalysis = line.trim();
        
        // Skip purely board/header lines unless they have analysis appended
        if (cleanAnalysis.startsWith('??') || cleanAnalysis.startsWith('A B C')) {
             if (!line.includes('|')) return; // No board pipe, probably just header
        }

        // Extract analysis from right of board
        const boardMatch = line.match(boardLineRegex);
        if (boardMatch) {
            cleanAnalysis = line.substring(boardMatch[0].length + (boardMatch.index || 0)).trim();
        }

        if (!cleanAnalysis) return;
        if (cleanAnalysis.startsWith('--')) return; // Separators
        
        // Determine if played via asterisk presence
        const isPlayed = cleanAnalysis.includes('*');
        
        // Remove asterisk to simplify regex matching
        // e.g. "best *8D" -> "best 8D", "2.47*H4" -> "2.47 H4"
        cleanAnalysis = cleanAnalysis.replace(/\*/g, ' ').trim();
        // Normalize multiple spaces
        cleanAnalysis = cleanAnalysis.replace(/\s+/g, ' ');

        // Regex for move line (now asterisk free)
        // Group 1: Rank/Score (e.g. "best", "14.1", "2.47")
        // Group 2: Coordinate (e.g. "8D", "H4", "xch", "pas")
        // Group 3: Word (e.g. "CURVY", "-", "UUVY")
        // Group 4: Score (e.g. "30")
        // Group 5: Win% (optional)
        // Group 6: Leave (optional)
        const moveRegex = /^([a-zA-Z0-9.]+)\s+([A-Z0-9]+|xch|pas)\s+([A-Za-z().?]+|-)\s+(\d+)(\s+([0-9.]+%)?)?(\s+(.*))?$/;
        
        const match = cleanAnalysis.match(moveRegex);
        if (match) {
            const rawRank = match[1];
            const coordinate = match[2];
            const word = match[3];
            const score = parseInt(match[4], 10);
            const winProb = match[6] || ''; 
            const leave = match[8] || '';

            const isBest = rawRank.toLowerCase().includes('best') || rawRank === '1';

            moves.push({
                rank: rawRank,
                coordinate,
                word,
                score,
                winProb,
                leave,
                isBest,
                isPlayed
            });
        }
    });
    
    // Fallback: Check header for played index if no asterisk found
    if (!moves.some(m => m.isPlayed)) {
        const headerPlayMatch = buffer.find(l => l.includes('(your play:'))?.match(/your play:\s*(\w+)/);
        if (headerPlayMatch) {
             const playIndicator = headerPlayMatch[1];
             // If indicator is "best", find best move
             if (playIndicator.toLowerCase() === 'best') {
                 const best = moves.find(m => m.isBest);
                 if (best) best.isPlayed = true;
             } else {
                 // Try to match by rank number if possible (heuristic)
                 const moveByRank = moves.find(m => m.rank === playIndicator);
                 if (moveByRank) moveByRank.isPlayed = true;
             }
        }
    }

    currentTurn.moves = moves;
    turns.push(currentTurn as Turn);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === 'Game over.') {
        if (buffer.length > 0 && currentTurn) processBuffer();
        buffer = [];
        continue;
    }

    const turnMatch = line.match(turnHeaderRegex);
    if (turnMatch) {
      if (currentTurn) processBuffer();
      buffer = [];
      turnCounter++;
      currentTurn = {
        id: turnCounter,
        player: turnMatch[1],
        turnNumber: parseInt(turnMatch[2], 10),
        moves: [],
        board: [],
        isGameOver: false
      };
      buffer.push(line);
    } else {
      buffer.push(line);
    }
  }

  if (buffer.length > 0 && currentTurn) processBuffer();

  return {
    turns,
    players: Array.from(playersFound)
  };
};