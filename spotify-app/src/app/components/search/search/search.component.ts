// search.component.ts
import { Component, inject } from '@angular/core';
import { CardArtistComponent } from '../../card-artist/card-artist.component';
import { CardPlayListComponent } from '../../card-play-list/card-play-list.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SongViewComponent } from '../../songView/song-view/song-view.component';
import { SongService } from '@/app/services/song/song.service';
import { ArtistService } from '@/app/services/artist/artist.service';
import { PlaylistService } from '@/app/services/playlist/playlist.service';
import { SearchService } from '@/app/services/search/seach.service';
import { combineLatest, map } from 'rxjs';
import { Playlist } from '@/app/models/PlaylistModel';
import { Song } from '@/app/models/SongModel';
import { Artist } from '@/app/models/ArtistModel';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, CardArtistComponent, CardPlayListComponent, SongViewComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  private route = inject(ActivatedRoute);
  private searchService = inject(SearchService);
  private songService = inject(SongService);
  private artistService = inject(ArtistService);
  private playlistService = inject(PlaylistService);

  // Accedemos a las señales del servicio
  searchQuery = this.searchService.searchQuery;
  songs = this.searchService.songs;
  artists = this.searchService.artists;
  playlists = this.searchService.playlists;
  isLoading = this.searchService.isLoading;
  hasResults = this.searchService.hasResults;

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.search(params['q']);
      } else {
        this.searchService.clearResults();
      }
    });
  }

  search(query: string): void {
    if (!query.trim()) {
      this.searchService.clearResults();
      return;
    }

    this.searchService.setLoading(true);
    this.searchService.updateSearch(query);

    // Obtenemos los Observables tipados correctamente
    const songs$ = this.songService.searchSongs(query);
    const artists$ = this.artistService.searchArtistsByName(query);
    const playlists$ = this.playlistService.getPlaylistsByUser(1).pipe(
      map((data: Playlist[]) => data.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase())
      ))
    );

    // Combinamos los resultados con tipado explícito
    combineLatest([
      songs$,
      artists$,
      playlists$
    ]).subscribe({
      next: ([songs, artists, playlists]: [Song[], Artist[], Playlist[]]) => {
        this.searchService.setResults(songs, artists, playlists);
      },
      error: (err) => {
        console.error('Error en la búsqueda:', err);
        this.searchService.setLoading(false);
        this.searchService.setResults([], [], []); 
      }
    });
  }
}