// search.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { Song } from '@/app/models/SongModel';
import { Artist } from '@/app/models/ArtistModel';
import { Playlist } from '@/app/models/PlaylistModel';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private _searchQuery = signal<string>('');
  private _songs = signal<Song[]>([]);
  private _artists = signal<Artist[]>([]);
  private _playlists = signal<Playlist[]>([]);
  private _isLoading = signal<boolean>(false);

  // Estado público de solo lectura
  searchQuery = this._searchQuery.asReadonly();
  songs = this._songs.asReadonly();
  artists = this._artists.asReadonly();
  playlists = this._playlists.asReadonly();
  isLoading = this._isLoading.asReadonly();

  // Computed properties
  hasResults = computed(() => 
    this.songs().length > 0 || 
    this.artists().length > 0 || 
    this.playlists().length > 0
  );

  updateSearch(query: string) {
    this._searchQuery.set(query);
  }

  setResults(songs: Song[], artists: Artist[], playlists: Playlist[]) {
    this._songs.set(this.sortResults(songs, this._searchQuery()));
    this._artists.set(this.sortResults(artists, this._searchQuery()));
    this._playlists.set(this.sortResults(playlists, this._searchQuery()));
    this._isLoading.set(false);
  }

  clearResults() {
    this._songs.set([]);
    this._artists.set([]);
    this._playlists.set([]);
    this._searchQuery.set('');
  }

  setLoading(state: boolean) {
    this._isLoading.set(state);
  }

  // Normaliza texto para búsqueda insensible
  normalizeSearchText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
      .replace(/[¿?¡!.,;:]/g, "") // Elimina signos de puntuación
      .trim();
  }

  // Filtra y ordena resultados por relevancia
  private sortResults<T extends { title?: string; name?: string }>(
    items: T[],
    query: string
  ): T[] {
    const normalizedQuery = this.normalizeSearchText(query);
    
    return items
      .filter(item => {
        const text = this.normalizeSearchText(item.title || item.name || '');
        return this.fuzzyMatch(text, normalizedQuery);
      })
      .sort((a, b) => {
        const textA = this.normalizeSearchText(a.title || a.name || '');
        const textB = this.normalizeSearchText(b.title || b.name || '');
        
        // Puntuación de coincidencia (mayor es mejor)
        const scoreA = this.getMatchScore(textA, normalizedQuery);
        const scoreB = this.getMatchScore(textB, normalizedQuery);
        
        return scoreB - scoreA; // Orden descendente por puntuación
      });
  }

  public fuzzyMatch(text: string, query: string): boolean {
    if (!query.trim()) return false;
    
    const normalizedText = this.normalizeSearchText(text);
    const normalizedQuery = this.normalizeSearchText(query);

    // Coincidencia exacta
    if (normalizedText.includes(normalizedQuery)) return true;

    // Coincidencia en cualquier palabra
    const textWords = normalizedText.split(/\s+/);
    const queryWords = normalizedQuery.split(/\s+/);

    // Al menos una palabra del query debe coincidir parcialmente
    return queryWords.some(qWord => 
      textWords.some(tWord => tWord.includes(qWord))
    );
  }

  private getMatchScore(text: string, query: string): number {
    let score = 0;
    
    // Coincidencia exacta al inicio
    if (text.startsWith(query)) score += 100;
    
    // Coincidencia exacta en cualquier posición
    if (text.includes(query)) score += 50;
    
    // Coincidencia de palabras
    const queryWords = query.split(/\s+/);
    const textWords = text.split(/\s+/);
    
    // Puntos por cada palabra que coincida
    queryWords.forEach(qWord => {
      if (textWords.some(tWord => tWord.includes(qWord))) {
        score += 10;
      }
    });
    
    // Penalizar textos más largos (preferir coincidencias más cortas)
    score -= text.length / 10;
    
    return score;
  }

  // Búsqueda difusa para coincidencias parciales
  fuzzySearch(text: string, query: string): boolean {
    if (!query.trim()) return false;
    
    const normalizedText = this.normalizeSearchText(text);
    const normalizedQuery = this.normalizeSearchText(query);

    // Coincidencia exacta
    if (normalizedText.includes(normalizedQuery)) return true;

    // Coincidencia de palabras separadas
    const queryWords = normalizedQuery.split(/\s+/);
    
    // Si solo hay una palabra, buscar coincidencia parcial
    if (queryWords.length === 1) {
      return normalizedText.includes(queryWords[0]);
    }
    
    // Si hay múltiples palabras, buscar al menos una coincidencia
    return queryWords.some(word => 
      normalizedText.includes(word)
    );
  }
}