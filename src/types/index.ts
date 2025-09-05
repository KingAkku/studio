export interface Player {
  id: string;
  name: string;
  email: string;
  score: number;
}

export interface GameRound {
  clickX: number;
  clickY: number;
  ladyX: number;
  ladyY: number;
  score: number;
}
