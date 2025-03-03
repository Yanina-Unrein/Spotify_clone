import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { Playlist } from '@/app/models/PlaylistModel';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private apiUrl = `${environment.apiUrl}/playlists`;

  constructor(private http: HttpClient) {}

  // Crear una nueva playlist
  createPlaylist(data: { userId: number, title: string }): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.apiUrl}/createPlaylist`, data);
  }

  // Obtener todas las playlists de un usuario
  getPlaylistsByUser(userId: number): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Obtener una playlist específica
  getPlaylistById(id: number): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.apiUrl}/${id}`);
  }

  // Actualizar una playlist
  updatePlaylist(id: number, data: { title?: string, color?: string }): Observable<Playlist> {
    return this.http.put<Playlist>(`${this.apiUrl}/${id}/update`, data);
  }

  // Eliminar una playlist
  deletePlaylist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/delete`);
  }

  // Añadir canción a playlist
  addSongToPlaylist(data: { playlist_id: number, song_id: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-song`, data);
  }

  // Remover canción de playlist
  removeSongFromPlaylist(playlistId: number, songId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove-song/${songId}`, {
      params: { playlist_id: playlistId.toString() }
    });
  }
}
