import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardPlaylistButtonComponent } from "../../../components/card-playlist-button/card-playlist-button.component";
import { ButtonPlaySmallComponent } from "../../../components/button-play-small/button-play-small.component";
import { PlaylistService } from "../../../services/playlist/playlist.service";
import { Song } from '@/app/models/SongModel';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Playlist } from '@/app/models/PlaylistModel';


@Component({
  selector: 'app-play-list-detail',
  imports: [CommonModule, CardPlaylistButtonComponent, ButtonPlaySmallComponent],
  templateUrl: './play-list-detail.component.html',
  styleUrl: './play-list-detail.component.css'
})
export class PlayListDetailComponent  {
private route = inject(ActivatedRoute);
  private playlistService = inject(PlaylistService);
  private destroyRef = inject(DestroyRef);

  // Estado reactivo
  playlist = signal<Playlist | null>(null);
  playListSongs = signal<Song[]>([]);
  isPlaying = signal(false);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Computed properties
  firstSongImage = computed(() => {
    const songs = this.playListSongs();
    return songs[0]?.image_path || null;
  });

  gradientBackground = computed(() => {
    const color = this.playlist()?.color || '#18181b';
    return `linear-gradient(to top, rgba(24, 24, 27, 0.8) 40%, transparent), ${color}`;
  });

  constructor() {
    this.loadPlaylist();
  }

  private loadPlaylist() {
    const playlistId = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(playlistId)) {
      this.error.set('ID de playlist inválido');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    // Asegúrate que getPlaylistById devuelva un Observable
    this.playlistService.getPlaylistById(playlistId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (playlist: Playlist) => {
          this.playlist.set(playlist);
          this.playListSongs.set(playlist.songs || []);
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.error.set('Error al cargar la playlist');
          console.error('Error loading playlist:', err);
          this.isLoading.set(false);
        }
      });
  }

  togglePlay() {
    this.isPlaying.update(prev => !prev);
  }

  getArtistsString(song: Song): string {
    return song.artists?.map(artist => artist.name).join(', ') || '';
  }
}
