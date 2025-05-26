import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { environment } from '@/environments/environment';
import { Playlist } from '@/app/models/PlaylistModel';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/playlists`;

  // Subject para notificar cambios en las playlists
  private playlistsUpdated = new BehaviorSubject<void>(undefined);
  playlistsUpdated$ = this.playlistsUpdated.asObservable();

  // Crear playlist - CORREGIDO para coincidir con backend
    createPlaylist(data: { userId: number, title: string }): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.apiUrl}/createPlaylist`, data).pipe(
      tap((newPlaylist) => {
        console.log('Notificando actualización de playlists');
        this.playlistsUpdated.next();
      }),
      catchError(error => {
        console.error('Error creating playlist:', error);
        throw error;
      })
    );
  }

  // Obtener playlists de usuario
  getPlaylistsByUser(userId: number): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.apiUrl}/user/${userId}`).pipe(
      catchError(error => {
        console.error('Error getting user playlists:', error);
        return of([]);
      })
    );
  }

  // Versión con signal (opcional)
  getPlaylistsByUserSignal(userId: number): Observable<Playlist[]> {
    return userId > 0 
      ? this.getPlaylistsByUser(userId)
      : of([] as Playlist[]);
  }

  // Obtener playlist específica
  getPlaylistById(id: number): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error getting playlist:', error);
        throw error;
      })
    );
  }

  // Actualizar playlist
  updatePlaylist(id: number, data: { title?: string, color?: string }): Observable<Playlist> {
    return this.http.put<Playlist>(`${this.apiUrl}/${id}/update`, data).pipe(
      catchError(error => {
        console.error('Error updating playlist:', error);
        throw error;
      })
    );
  }

  // Eliminar playlist
  deletePlaylist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/delete`).pipe(
      catchError(error => {
        console.error('Error deleting playlist:', error);
        throw error;
      })
    );
  }

  // Añadir canción a playlist - CORREGIDO para coincidir con backend
  addSongToPlaylist(data: { playlist_id: number, song_id: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-song`, data).pipe(
      catchError(error => {
        console.error('Error adding song to playlist:', error);
        throw error;
      })
    );
  }

  // Remover canción de playlist - CORREGIDO para coincidir con backend
  removeSongFromPlaylist(playlistId: number, songId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove-song/${songId}`, {
      params: { playlist_id: playlistId.toString() }
    }).pipe(
      catchError(error => {
        console.error('Error removing song from playlist:', error);
        throw error;
      })
    );
  }

  getOtherUsersPlaylists(userId: number): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.apiUrl}/others/${userId}`).pipe(
      tap(playlists => console.log('Playlists recibidas:', playlists)), // Debug
      catchError(error => {
        console.error('Error:', error);
        return of([]); // Devuelve array vacío si hay error
      })
    );
  }

  notifyPlaylistsUpdate(): void {
    this.playlistsUpdated.next();
  }
}