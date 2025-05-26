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
    this._songs.set(songs);
    this._artists.set(artists);
    this._playlists.set(playlists);
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
}
