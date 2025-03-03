import { Song } from './SongModel';

export interface Playlist {
    id: number;
    user_id: number;
    title: string;
    color: string;
    songs?: Song[];
}

export interface PlaylistColor {
    id: number;
    color: string;
    accent: string;
    dark: string;
}

// Para cuando necesites crear una playlist
export interface CreatePlaylistDTO {
    userId: number;
    title: string;
}

// Para cuando necesites actualizar una playlist
export interface UpdatePlaylistDTO {
    title?: string;
    color?: string;
}