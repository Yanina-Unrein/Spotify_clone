import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PlayableSong, Song } from '@/app/models/SongModel';
import { environment } from '@/environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { SearchService } from '../search/seach.service';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private apiUrl = `${environment.apiUrl}/songs`;
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private searchService = inject(SearchService);

  // Obtener todas las canciones con signal
  getAllSongs() {
    return toSignal(
      this.http.get<Song[]>(this.apiUrl),
      { initialValue: [] }
    );
  }

  // Obtener canción por ID con signal
  getSongById(id: number) {
    return toSignal(
      this.http.get<Song>(`${this.apiUrl}/${id}`)
    );
  }

  // Buscar canciones con signal
  searchSongs(query: string): Observable<Song[]> {
    const normalizedQuery = this.normalizeSearchText(query);
    
    return this.http.get<Song[]>(`${this.apiUrl}/search`).pipe(
      map(songs => {
        // Primero aplicamos el mapeo base
        const mappedSongs = songs.map(song => this.addBaseUrl(song));
        
        // Luego filtramos con búsqueda avanzada
        return mappedSongs.filter(song => 
          this.matchSong(song, normalizedQuery)
        );
      })
    );
  }

  // Método para normalizar texto de búsqueda
  private normalizeSearchText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
      .trim();
  }

  // Método para verificar coincidencias
  private matchSong(song: PlayableSong, query: string): boolean {
    // Busca en el título
    const normalizedTitle = this.normalizeSearchText(song.title);
    if (normalizedTitle.includes(query)) return true;
    
    // Busca en el nombre del artista (si existe)
    if (song.artist_name) {
      const normalizedArtist = this.normalizeSearchText(song.artist_name);
      if (normalizedArtist.includes(query)) return true;
    }
    
    // Busca en cada palabra del título
    const titleWords = normalizedTitle.split(/\s+/);
    if (titleWords.some(word => word.includes(query))) return true;
    
    return false;
  }

  private addBaseUrl(song: Song): Song {
    if (song.path_song) {
      song.path_song = this.baseUrl + song.path_song;
    }
    return song;
  }
}
