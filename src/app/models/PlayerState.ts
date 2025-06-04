import { PlayableSong } from "./SongModel";

export interface PlayerState {
  currentSong: PlayableSong | null;
  queue: PlayableSong[];
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: 'none' | 'all' | 'one';
}