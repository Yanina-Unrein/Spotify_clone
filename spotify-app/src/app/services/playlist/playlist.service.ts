import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap, throwError } from 'rxjs';
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

  // Crear playlist
  createPlaylist(data: { userId: number, title: string }): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.apiUrl}/createPlaylist`, data).pipe(
      tap(() => this.notifyPlaylistsUpdate()),
      catchError(this.handleError)
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

  // Obtener playlist específica
  getPlaylistById(id: number): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar playlist
  updatePlaylist(id: number, data: { title?: string }): Observable<Playlist> {
    return this.http.put<Playlist>(`${this.apiUrl}/${id}/update`, data).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar playlist
  deletePlaylist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/delete`).pipe(
      tap(() => this.notifyPlaylistsUpdate()), // Añade esto
      catchError(this.handleError)
    );
  }

  // Añadir canción a playlist - Corregido para usar playlistId y songId
  addSongToPlaylist(data: { playlistId: number, songId: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-song`, data).pipe(
      tap(() => this.notifyPlaylistsUpdate()),
      catchError(this.handleError)
    );
  }

  // Remover canción de playlist
  removeSongFromPlaylist(playlistId: number, songId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove-song/${songId}`, {
      params: { playlistId: playlistId.toString() }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener playlists de otros usuarios
  getOtherUsersPlaylists(userId: number): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.apiUrl}/others/${userId}`).pipe(
      catchError(error => {
        console.error('Error:', error);
        return of([]);
      })
    );
  }

  // Manejo de errores centralizado
  private handleError(error: any): Observable<never> {
    console.error('Error in playlist service:', error);
    return throwError(() => error);
  }

  // Notificar actualización de playlists
  notifyPlaylistsUpdate(): void {
    this.playlistsUpdated.next();
  }
}