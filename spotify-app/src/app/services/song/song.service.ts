import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Song } from '@/app/models/SongModel';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private apiUrl = `${environment.apiUrl}/songs`;  // URL base de la API
  private baseUrl = environment.apiUrl;  // URL base para concatenar con las canciones

  constructor(private http: HttpClient) { }

  // GET /api/songs
  getAllSongs(): Observable<Song[]> {
    return this.http.get<Song[]>(this.apiUrl).pipe(
      map(songs => songs.map(song => this.addBaseUrl(song)))  // Añadir la URL completa de las canciones
    );
  }

  // GET /api/songs/:id
  getSongById(id: number): Observable<Song> {
    return this.http.get<Song>(`${this.apiUrl}/${id}`).pipe(
      map(song => this.addBaseUrl(song))  // Añadir la URL completa de la canción
    );
  }

  // GET /api/songs/search?title=&artist=
  searchSongs(title?: string, artist?: string): Observable<Song[]> {
    let params = new URLSearchParams();
    if (title) params.append('title', title);
    if (artist) params.append('artist', artist);
    return this.http.get<Song[]>(`${this.apiUrl}/search?${params}`).pipe(
      map(songs => songs.map(song => this.addBaseUrl(song)))  // Añadir la URL completa de las canciones
    );
  }

  // Método para añadir la URL base a las rutas relativas de las canciones
  private addBaseUrl(song: Song): Song {
    if (song.path_song) {
      song.path_song = this.baseUrl + song.path_song;  // Concatenar la URL base con la ruta relativa
    }
    return song;
  }
}
