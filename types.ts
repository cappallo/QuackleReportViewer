export interface Move {
  rank: string; // "best", number, or "*"
  coordinate: string;
  word: string;
  score: number;
  winProb: string;
  leave: string;
  isBest: boolean;
  isPlayed: boolean;
}

export interface PlayerState {
  name: string;
  rack: string;
  score: number;
}

export interface Turn {
  id: number;
  player: string;
  turnNumber: number;
  activePlayer: PlayerState;
  opponent: PlayerState;
  board: string[][]; // 15x15 grid
  moves: Move[];
  isGameOver: boolean;
}

export interface GameData {
  turns: Turn[];
  players: string[];
}
