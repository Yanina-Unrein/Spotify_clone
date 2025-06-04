import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, EnvironmentInjector, HostListener, inject, runInInjectionContext, Signal, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardPlaylistButtonComponent } from "../../../components/card-playlist-button/card-playlist-button.component";
import { ButtonPlaySmallComponent } from "../../../components/button-play-small/button-play-small.component";
import { PlaylistService } from "../../../services/playlist/playlist.service";
import { PlayableSong } from '@/app/models/SongModel';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Playlist } from '@/app/models/PlaylistModel';
import { SongService } from '@/app/services/song/song.service'; 
import { ModalMessageComponent } from '@/app/components/modalMessage/modal-message/modal-message.component';

@Component({
  selector: 'app-play-list-detail',
  standalone: true,
  imports: [CommonModule, CardPlaylistButtonComponent, ButtonPlaySmallComponent, ModalMessageComponent],
  templateUrl: './play-list-detail.component.html',
  styleUrl: './play-list-detail.component.css'
})
export class PlayListDetailComponent {
  private route = inject(ActivatedRoute);
  private playlistService = inject(PlaylistService);
  private songService = inject(SongService);
  private destroyRef = inject(DestroyRef);
  private injector = inject(EnvironmentInjector);

  // Estado reactivo
  playlist = signal<Playlist | null>(null);
  playListSongs = signal<PlayableSong[]>([]);
  isPlaying = signal(false);
  isLoading = signal(true);
  error = signal<string | null>(null);

  showPlaylistOptions = signal(false);
  isRemoving = signal<{[key: number]: boolean}>({});
  
  // Estado para los modales
  showModal = signal(false);
  modalTitle = signal('');
  modalMessage = signal('');
  pendingAction = signal<(() => void) | null>(null);
  currentSongId = signal<number | null>(null);

  // Método para abrir/cerrar opciones de playlist
  openOptions(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.showPlaylistOptions.update(prev => !prev);
  }

  // Computed properties
  firstSongImage = computed(() => this.playListSongs()[0]?.image_path || null);
  gradientBackground = computed(() => {
    const color = this.playlist()?.color || '#18181b';
    return `linear-gradient(to top, rgba(24, 24, 27, 0.8) 40%, transparent), ${color}`;
  });

  constructor(
    private router: Router
  ) {
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

    // Cargar playlist (Observable)
    this.playlistService.getPlaylistById(playlistId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (playlist) => {
          this.playlist.set(playlist);
          this.loadSongsDetails(playlist.songs || []);
        },
        error: (err) => {
          this.error.set('Error al cargar la playlist');
          console.error('Error loading playlist:', err);
          this.isLoading.set(false);
        }
      });
  }

 private loadSongsDetails(songs: PlayableSong[]) {
    if (songs.length === 0) {
      this.playListSongs.set([]);
      this.isLoading.set(false);
      return;
    }

    runInInjectionContext(this.injector, () => {
      const songSignals = songs.map(song => 
        this.songService.getSongById(song.id) as Signal<PlayableSong | undefined>
      );

      const sub = effect(() => {
        const loadedSongs = songSignals.map(s => {
          const songData = s();
          if (songData) {
            return songData;
          }
          return null;
        }).filter(Boolean) as PlayableSong[];
        
        if (loadedSongs.length === songs.length) {
          this.playListSongs.set(loadedSongs);
          this.isLoading.set(false);
          sub.destroy();
        }
      });
    });
  }

  getArtistsString(song: PlayableSong): string {
    // Prioridad 1: artist_name directo
    if (song.artist_name) {
      return song.artist_name;
    }
    
    // Prioridad 2: artists array
    if (song.artists && song.artists.length > 0) {
      return song.artists
        .map(artist => artist?.name || '')
        .filter(name => name)
        .join(', ');
    }
    
    // Prioridad 3: artist como string (backup)
    if (typeof song.artists === 'string') {
      return song.artists;
    }
    
    return 'Artista desconocido';
  }

  formatDuration(duration: any): string {
    if (!duration) return '0:00';
    
    // Si ya está en formato correcto
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration;
    }
    
    // Si es un número (segundos)
    if (typeof duration === 'number') {
      const mins = Math.floor(duration / 60);
      const secs = Math.floor(duration % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Si es un string numérico
    if (typeof duration === 'string' && !isNaN(Number(duration))) {
      const seconds = parseInt(duration);
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    return '0:00';
  }

  togglePlay() {
    this.isPlaying.update(prev => !prev);
  }

   // Método para eliminar canción
  DeleteSong(songId: number) {
    const playlistId = this.playlist()?.id;
    if (!playlistId) return;

    const songTitle = this.playListSongs().find(s => s.id === songId)?.title || 'esta canción';
    
    // Configura el modal
    this.modalTitle.set('¿Eliminar canción de Tu Playlist?');
    this.modalMessage.set(`Se eliminará "${songTitle}" de tu playlist`);
    
    // Guarda la acción para ejecutar si se confirma
    this.pendingAction.set(() => {
      this.executeSongDeletion(songId, playlistId);
    });
    
    // Muestra el modal
    this.showModal.set(true);
  }

  // Método para cerrar menús al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Cerrar opciones de playlist si se hace clic fuera
    if (!target.closest('.play-button')) {
      this.showPlaylistOptions.set(false);
    }
  }

  deletePlaylist() {
    const playlistId = this.playlist()?.id;
    if (!playlistId) return;

    this.modalTitle.set('¿Eliminar de Tu biblioteca?');
    this.modalMessage.set(`Se eliminará "${this.playlist()?.title}" de Tu biblioteca.`);
    
    this.pendingAction.set(() => {
      this.executePlaylistDeletion(playlistId);
    });
    
    this.showModal.set(true);
  }

  // Métodos auxiliares para mantener la lógica original
  private executeSongDeletion(songId: number, playlistId: number) {
    this.isRemoving.update(state => ({...state, [songId]: true}));

    this.playlistService.removeSongFromPlaylist(playlistId, songId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.playListSongs.update(songs => songs.filter(s => s.id !== songId));
          this.isRemoving.update(state => {
            const newState = {...state};
            delete newState[songId];
            return newState;
          });
        },
        error: (err) => {
          console.error('Error al eliminar canción:', err);
          this.isRemoving.update(state => {
            const newState = {...state};
            delete newState[songId];
            return newState;
          });
          this.error.set('Error al eliminar la canción');
        }
      });
  }

  private executePlaylistDeletion(playlistId: number) {
    this.playlistService.deletePlaylist(playlistId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
          this.playlistService.notifyPlaylistsUpdate();
        },
        error: (err) => {
          console.error('Error al eliminar playlist:', err);
          this.error.set('No se pudo eliminar la playlist');
        }
      });
  }

  // Métodos para manejar las acciones del modal
  onModalConfirm() {
    const action = this.pendingAction();
    if (action) {
      action();
    }
    this.showModal.set(false);
  }

  onModalCancel() {
    this.showModal.set(false);
  }

}
