import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap, throwError } from 'rxjs';
import { environment } from '@/environments/environment';
import { Playlist } from '@/app/models/PlaylistModel';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/playlists`;
  private playlistsUpdated = new BehaviorSubject<void>(undefined);
  playlistsUpdated$ = this.playlistsUpdated.asObservable();
  private authService = inject(AuthService);

  getUserPlaylists() {
    throw new Error('Method not implemented.');
  }

  private getAuthHeaders(): { headers: HttpHeaders } {
    return this.authService.getAuthHeaders();
  }

  // Crear playlist
 createPlaylist(data: { userId: number, title: string }): Observable<Playlist> {
    return this.http.post<Playlist>(
      `${this.apiUrl}/createPlaylist`, 
      data,
      this.getAuthHeaders() 
    ).pipe(
      tap(() => this.notifyPlaylistsUpdate()),
      catchError(this.handleError)
    );
  }

  // Obtener playlists de usuario
  getPlaylistsByUser(userId: number): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(
      `${this.apiUrl}/user/${userId}`,
      this.getAuthHeaders()  
    ).pipe(
      catchError(this.handleError)  
    );
  }

  // Obtener playlist específica
  getPlaylistById(id: number): Observable<Playlist> {
    return this.http.get<Playlist>(
      `${this.apiUrl}/${id}`,
      this.getAuthHeaders()  
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar playlist
  updatePlaylist(id: number, data: { title?: string }): Observable<Playlist> {
    return this.http.put<Playlist>(
      `${this.apiUrl}/${id}/update`, 
      data,
      this.getAuthHeaders()  
    ).pipe(
      tap(() => this.notifyPlaylistsUpdate()), 
      catchError(this.handleError)
    );
  }

  // Eliminar playlist
  deletePlaylist(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}/delete`,  // Corregida la ruta
      this.getAuthHeaders()  // Añade encabezados
    ).pipe(
      tap(() => this.notifyPlaylistsUpdate()),
      catchError(this.handleError)
    );
  }

  // Añadir canción a playlist
  addSongToPlaylist(data: { playlistId: number, songId: number }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/add-song`, 
      data,
      this.getAuthHeaders()  // Añade encabezados
    ).pipe(
      tap(() => this.notifyPlaylistsUpdate()),
      catchError(this.handleError)
    );
  }

  // Remover canción de playlist
  removeSongFromPlaylist(playlistId: number, songId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/remove-song/${songId}`, 
      {
        ...this.getAuthHeaders(),  // Añade encabezados
        params: { playlistId: playlistId.toString() }
      }
    ).pipe(
      tap(() => this.notifyPlaylistsUpdate()), // Notificar actualización
      catchError(this.handleError)
    );
  }

  // Obtener playlists de otros usuarios
  getOtherUsersPlaylists(userId: number): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(
      `${this.apiUrl}/others/${userId}`,
      this.getAuthHeaders()  // Añade encabezados
    ).pipe(
      catchError(this.handleError)  // Manejo consistente de errores
    );
  }

  // Manejo de errores centralizado
  private handleError(error: any): Observable<never> {
    console.error('Error in playlist service:', error);
    
    // Manejar específicamente errores 401/403
    if (error.status === 401 || error.status === 403) {
      // Opcional: forzar logout si es necesario
      // this.authService.logout();
    }
    
    return throwError(() => error);
  }

  // Notificar actualización de playlists
  notifyPlaylistsUpdate(): void {
    this.playlistsUpdated.next();
  }
}