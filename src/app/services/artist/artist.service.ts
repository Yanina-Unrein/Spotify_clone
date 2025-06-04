import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { Observable, catchError, map, of } from 'rxjs';
import { Artist } from '@/app/models/ArtistModel';
import { Song } from '@/app/models/SongModel';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/artists`;

  getArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(this.apiUrl).pipe(
      catchError(this.handleError<Artist[]>('getArtists', []))
    );
  }

  getArtistById(id: number): Observable<Artist> {
    return this.http.get<Artist>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<Artist>(`getArtist id=${id}`))
    );
  }

  getSongsByArtist(id: number): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.apiUrl}/${id}/songs`).pipe(
      map(songs => songs.map(song => ({
        ...song,
        path: this.getFullSongPath(song.path_song)
      }))),
      catchError(this.handleError<Song[]>(`getSongsByArtist id=${id}`, []))
    );
  }

  searchArtistsByName(name: string): Observable<Artist[]> {
    if (!name.trim()) {
      return of([]); // Si no hay término de búsqueda, retornar array vacío
    }
    return this.http.get<Artist[]>(`${this.apiUrl}/search/${name}`).pipe(
      catchError(this.handleError<Artist[]>('searchArtists', []))
    );
  }

  private getFullSongPath(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl}/${path.replace(/^\//, '')}`;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Manejo específico para errores CORS
      if (error.status === 0) {
        console.error('Error de CORS o conexión:', error.message);
      }
      
      // Mantener la app funcionando retornando un resultado vacío
      return of(result as T);
    };
  }
}
