import { Song } from "./SongModel";

export interface Artist {
  id: number;
  photo?: string;
  name: string;
  songs?: Song[];
}