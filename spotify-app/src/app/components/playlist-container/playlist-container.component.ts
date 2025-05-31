import { CommonModule } from '@angular/common';
import { Component, computed, effect, EventEmitter, inject, Output, signal } from '@angular/core';
import { CardPlayListComponent } from '../card-play-list/card-play-list.component';
import { GreetingComponent } from "../greeting/greeting.component";
import { CardArtistComponent } from "../card-artist/card-artist.component";
import { Artist } from '@/app/models/ArtistModel';
import { ArtistService } from '@/app/services/artist/artist.service';
import { PlaylistService } from '@/app/services/playlist/playlist.service';
import { AuthService } from '@/app/services/auth/auth.service';
import { Playlist } from '@/app/models/PlaylistModel';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-playlist-container',
  standalone: true,
  imports: [CommonModule, CardPlayListComponent, GreetingComponent, CardArtistComponent],
  templateUrl: './playlist-container.component.html',
  styleUrl: './playlist-container.component.css',
})
export class PlaylistContainerComponent {
  private artistService = inject(ArtistService);
  private playlistService = inject(PlaylistService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  // Signals
  artists = toSignal(
    this.artistService.getArtists().pipe(
      catchError(() => of([] as Artist[]))
    ),
    { initialValue: [] as Artist[] }
  );

  // Playlists signals
  userPlaylists = signal<Playlist[]>([]);
  otherUsersPlaylists = signal<Playlist[]>([]);
  
  // Computed properties
  currentUser = this.authService.currentUser;
  
  // Outputs
  @Output() cardClick = new EventEmitter<Playlist>();
  @Output() cardArtistClick = new EventEmitter<Artist>();

  constructor() {
    // Carga inicial
    this.loadAllPlaylists();

    // Escuchar cambios en el usuario
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.loadAllPlaylists();
      }
    });

    // Escuchar actualizaciones de playlists
    this.playlistService.playlistsUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAllPlaylists();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAllPlaylists(): void {
    const userId = this.currentUser()?.id;
    if (!userId) return;

    // Cargar playlists del usuario actual
    this.playlistService.getPlaylistsByUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (playlists) => {
          this.userPlaylists.set(playlists);
        },
        error: (err) => console.error('Error loading user playlists:', err)
      });

    // Cargar playlists comunitarias
    this.playlistService.getOtherUsersPlaylists(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (playlists) => {
          this.otherUsersPlaylists.set(playlists);
        },
        error: (err) => {
          console.error('Error loading community playlists:', err);
          this.otherUsersPlaylists.set([]);
        }
      });
  }

  onCardClick(playlist: Playlist): void {
    this.cardClick.emit(playlist);
  }

  onArtistSelected(artist: Artist): void {
    this.cardArtistClick.emit(artist);
  }
}
