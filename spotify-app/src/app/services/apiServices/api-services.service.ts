import { Playlist, playlists, Song, songs } from '@/app/lib/data';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'; // Asegúrate de importar los datos correctos

@Injectable({
  providedIn: 'root'
})
export class ApiServicesService {

  // Método para obtener las playlists
  getPlaylists(): Playlist[] {
    return playlists;
  }

  // Método para obtener canciones por albumId
  getSongsByAlbumId(albumId: number): Song[] {
    return songs.filter(song => song.albumId === albumId);
  }

  // Método para obtener una playlist por id
  getPlaylistById(id: string): Playlist | undefined {
    return playlists.find(playlist => playlist.id === id);
  }
}

// Uso del MusicService
const musicService = new ApiServicesService();

// Obtener todas las playlists
const allPlaylists = musicService.getPlaylists();
console.log(allPlaylists);

// Obtener canciones de un album específico
const albumId = 1;
const songsInAlbum = musicService.getSongsByAlbumId(albumId);
console.log(songsInAlbum);

// Obtener una playlist específica
const playlistId = '1';
const playlist = musicService.getPlaylistById(playlistId);
console.log(playlist);

