import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { map, Observable } from 'rxjs';
import { Artist } from '@/app/models/ArtistModel';
import { Song } from '@/app/models/SongModel';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/artists`;

  getArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(this.apiUrl);
  }

  getArtistById(id: number): Observable<Artist> {
    return this.http.get<Artist>(`${this.apiUrl}/${id}`);
  }

  getSongsByArtist(id: number): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.apiUrl}/${id}/songs`);
  }

  private getFullSongPath(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl}/${path.replace(/^\//, '')}`;
  }

  searchArtistsByName(name: string): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${this.apiUrl}/search/${name}`);
  }
}
