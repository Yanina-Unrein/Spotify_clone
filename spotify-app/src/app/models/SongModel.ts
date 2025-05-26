import { Artist } from "./ArtistModel";
import { Category } from "./CategoryModel";

export interface Song {
  id: number;
  title: string;
  album?: string;
  path_song: string;
  image_path?: string;
  created_at?: string;
  duration: string;
  artists?: Artist[]; 
  categories?: Category[]; 
  playlist_id?: number; 
}

// Para reproducción/extensión cuando necesites datos adicionales
export interface PlayableSong extends Song {
  artist_name?: string; 
  artist_photo?: string; 
  playlist_color?: string; 
}