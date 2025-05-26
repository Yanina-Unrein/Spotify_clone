import { Song } from './SongModel';

export interface Playlist {
    id: number;
    user_id: number;
    title: string;
    color: string;
    songs?: Song[]; 
}

export interface PlaylistDTO {
    title: string;
    color?: string; 
}

// Para los colores (si realmente necesitas esta interfaz)
export interface PlaylistColor {
    id: number;
    color: string;
    accent: string;
    dark: string;
}