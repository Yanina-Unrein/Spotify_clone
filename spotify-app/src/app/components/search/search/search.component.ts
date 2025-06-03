import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
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
import { Playlist } from '@/app/models/PlaylistModel';
import { Artist } from '@/app/models/ArtistModel';
import { Song } from '@/app/models/SongModel';
import { PlayerService } from '@/app/services/player/player.service';

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
  private playerService = inject(PlayerService);
  private destroy$ = new Subject<void>();

  // Signals del search service
  searchQuery = this.searchService.searchQuery;
  songs = this.searchService.songs;
  artists = this.searchService.artists;
  playlists = this.searchService.playlists;
  isLoading = this.searchService.isLoading;
  hasResults = this.searchService.hasResults;

  // Signals del player service
  currentSong = this.playerService.currentSong;
  isPlaying = this.playerService.isPlaying;
  currentPlaylistId = this.playerService.currentPlaylistId;

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
      this.playlistService.getPlaylistsByUser(1) // Asume userId 1 o ajusta según tu lógica
    ]).pipe(
      takeUntil(this.destroy$),
      map(([songs, artists, playlists]) => {
        // Filtra playlists que coincidan con la búsqueda
        const filteredPlaylists = playlists.filter(playlist => 
          playlist.title.toLowerCase().includes(query.toLowerCase())
        );
        return { songs, artists, filteredPlaylists };
      })
    ).subscribe({
      next: ({ songs, artists, filteredPlaylists }) => {
        this.searchService.setResults(songs, artists, filteredPlaylists);
      },
      error: (err) => {
        console.error('Error en la búsqueda:', err);
        this.searchService.setLoading(false);
        this.searchService.setResults([], [], []);
      }
    });
  }

  // Métodos para manejar la reproducción
  playSong(song: Song): void {
    if (this.isCurrentSong(song) && this.isPlaying()) {
      this.playerService.pause();
    } else if (this.isCurrentSong(song)) {
      this.playerService.togglePlay();
    } else {
      this.playerService.playSong(song);
    }
  }

  // Métodos de verificación de estado
  isCurrentSong(song: Song): boolean {
    return this.currentSong()?.id === song.id;
  }
}