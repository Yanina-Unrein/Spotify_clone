import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CardArtistComponent } from '../../card-artist/card-artist.component';
import { CardPlayListComponent } from '../../card-play-list/card-play-list.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SongViewComponent } from '../../songView/song-view/song-view.component';
import { SongService } from '@/app/services/song/song.service';
import { ArtistService } from '@/app/services/artist/artist.service';
import { PlaylistService } from '@/app/services/playlist/playlist.service';
import { SearchService } from '@/app/services/search/seach.service';
import { combineLatest, map, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, CardArtistComponent, CardPlayListComponent, SongViewComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit, OnDestroy {
 private route = inject(ActivatedRoute);
  private searchService = inject(SearchService);
  private songService = inject(SongService);
  private artistService = inject(ArtistService);
  private playlistService = inject(PlaylistService);
  private destroy$ = new Subject<void>();

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

  ngOnInit() {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['q']) {
        this.performSearch(params['q']);
      } else {
        this.searchService.clearResults();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private performSearch(query: string): void {
    this.searchService.setLoading(true);
    
    combineLatest([
      this.songService.searchSongs(query),
      this.artistService.searchArtistsByName(query),
      this.playlistService.getPlaylistsByUser(1)
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([songs, artists, playlists]) => {
        const filteredPlaylists = playlists.filter(playlist => 
          this.searchService.fuzzySearch(playlist.title, query)
        );
        this.searchService.setResults(songs, artists, filteredPlaylists);
      },
      error: (err) => {
        console.error('Error en la búsqueda:', err);
        this.searchService.setLoading(false);
        this.searchService.setResults([], [], []); 
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

    // Usamos los métodos existentes de búsqueda
    combineLatest([
      this.songService.searchSongs(query),
      this.artistService.searchArtistsByName(query),
      this.playlistService.getPlaylistsByUser(1).pipe(
        map(playlists => playlists.filter(playlist => 
          this.searchService.fuzzySearch(playlist.title, query)
        ))
      )
    ]).subscribe({
      next: ([songs, artists, playlists]) => {
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