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
  private http = inject(HttpClient);
  private searchService = inject(SearchService);

  // Método mejorado para obtener todas las canciones
  getAllSongs() {
    return toSignal(
      this.http.get<Song[]>(this.apiUrl).pipe(
        map(songs => songs.map(song => this.processSong(song)))
      ),
      { initialValue: [] }
    );
  }

  // Método mejorado para obtener canción por ID
  getSongById(id: number) {
    return toSignal(
      this.http.get<Song>(`${this.apiUrl}/${id}`).pipe(
        map(song => this.processSong(song))
      )
    );
  }

  // Método mejorado para buscar canciones
  searchSongs(query: string): Observable<Song[]> {
    const normalizedQuery = this.normalizeSearchText(query);
    
    return this.http.get<Song[]>(`${this.apiUrl}/search`).pipe(
      map(songs => songs.map(song => this.processSong(song))),
      map(songs => songs.filter(song => this.matchSong(song, normalizedQuery))
    ));
  }

  // Procesamiento consistente de las canciones
  private processSong(song: Song): Song {
    return {
      ...song,
      path_song: this.buildSongUrl(song.path_song)
    };
  }

  // Construcción robusta de la URL
  private buildSongUrl(path: string | undefined): string {
    if (!path) return '';
    
    // Si ya es una URL completa, retornarla tal cual
    if (path.startsWith('http')) return path;
    
    // Eliminar barras iniciales duplicadas
    const cleanPath = path.replace(/^\/*/, '');
    
    // Construir URL completa
    return `${environment.apiUrl.replace(/\/+$/, '')}/${cleanPath}`;
  }

  private normalizeSearchText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  private matchSong(song: PlayableSong, query: string): boolean {
    const normalizedTitle = this.normalizeSearchText(song.title);
    if (normalizedTitle.includes(query)) return true;
    
    if (song.artist_name) {
      const normalizedArtist = this.normalizeSearchText(song.artist_name);
      if (normalizedArtist.includes(query)) return true;
    }
    
    const titleWords = normalizedTitle.split(/\s+/);
    if (titleWords.some(word => word.includes(query))) return true;
    
    return false;
  }


  private addBaseUrl(song: Song): Song {
    if (song.path_song) {
      song.path_song = this.apiUrl + song.path_song;
    }
    return song;
  }
}
