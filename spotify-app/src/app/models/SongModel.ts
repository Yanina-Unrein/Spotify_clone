import { Playlist } from './PlaylistModel';
import { Artist } from './ArtistModel';
import { Category } from './CategoryModel';

export interface Song {
  id: number;
  title: string;
  album?: string; 
  playlist_id?: number; 
  path_song: string;
  image_path?: string; 
  created_at?: string; 
  duration: string;
  playlist?: Playlist; 
  artists?: Artist[]; 
  categories?: Category[]; 
}

// Para usar en los componentes de reproducción
export interface PlayableItem extends Song {
  id: number;
  title: string;
  path_song: string;
  image_path?: string;
  artists?: Artist[];
  duration: string;
}