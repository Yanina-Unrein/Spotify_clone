import { Artist } from '@/app/models/ArtistModel';
import { Song } from '@/app/models/SongModel';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private apiUrl = `${environment.apiUrl}/artists`;

  constructor(private http: HttpClient) {}

  // Obtener todos los artistas
  getArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${this.apiUrl}`);
  }

  // Obtener un artista por ID
  getArtistById(id: number): Observable<Artist> {
    return this.http.get<Artist>(`${this.apiUrl}/${id}`);
  }

  // Obtener canciones de un artista
  getSongsByArtist(id: number): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.apiUrl}/${id}/songs`);
  }

  // Buscar artistas por nombre
  searchArtistsByName(name: string): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${this.apiUrl}/search/${name}`);
  }
}
