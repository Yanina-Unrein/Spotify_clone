import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardPlaylistButtonComponent } from "../../../components/card-playlist-button/card-playlist-button.component";
import { ButtonPlaySmallComponent } from "../../../components/button-play-small/button-play-small.component";
import { ArtistService } from '@/app/services/artist/artist.service';
import { Song } from '@/app/models/SongModel';
import { Artist } from '@/app/models/ArtistModel';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { SongActionsMenuComponent } from '@/app/components/song-actions-menu/song-actions-menu.component';

@Component({
  selector: 'app-artist-detail-componen',
  imports: [CommonModule, CardPlaylistButtonComponent, ButtonPlaySmallComponent, SongActionsMenuComponent],
  templateUrl: './artist-detail-componen.component.html',
  styleUrl: './artist-detail-componen.component.css'
})
export class ArtistDetailComponenComponent {
  private artistService = inject(ArtistService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  // Estado reactivo
  artist = signal<Artist | null>(null);
  songs = signal<Song[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Computed properties
  backgroundImage = computed(() => {
    const photo = this.artist()?.photo;
    return photo ? `url(${photo})` : 'none';
  });

  // Control del menú de acciones
  showActionsMenu = false;
  selectedSong: Song | null = null;
  menuPosition = { x: 0, y: 0 };

  constructor() {
    this.loadArtistData();
  }

  formatDuration(duration: string | number | null | undefined): string {
    // Si es null/undefined, devolver valor por defecto
    if (duration == null) return '0:00';
    
    // Si ya está en formato MM:SS, devolverlo directamente
    if (typeof duration === 'string' && /^[0-5]?\d:[0-5]\d$/.test(duration)) {
      return duration;
    }
    
    // Si es un número (segundos), convertirlo a MM:SS
    if (typeof duration === 'number') {
      const mins = Math.floor(duration / 60);
      const secs = Math.floor(duration % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Para cualquier otro caso, devolver valor por defecto
    return '0:00';
  }

 @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showActionsMenu) return;
    
    const target = event.target as HTMLElement;
    const clickedInsideMenu = target.closest('.song-actions-menu');
    const clickedOptionsButton = target.closest('.options-button');
    
    if (!clickedInsideMenu && !clickedOptionsButton) {
      this.closeActionsMenu();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event) {
    if (this.showActionsMenu) {
      this.closeActionsMenu();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    if (this.showActionsMenu) {
      this.closeActionsMenu();
    }
  }
  
  openActionsMenu(song: Song, event: MouseEvent) {
    event.stopPropagation();
    
    // Si el menú ya está abierto para esta canción, ciérralo
    if (this.showActionsMenu && this.selectedSong?.id === song.id) {
      this.closeActionsMenu();
      return;
    }
    
    this.selectedSong = song;
    this.showActionsMenu = true;
    
      // Aquí tomamos el elemento que tiene el listener (el botón), no el elemento exacto donde clickeaste
    const button = event.currentTarget as HTMLElement; 
    const rect = button.getBoundingClientRect();

    this.menuPosition = {
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY
    };
  }

  closeActionsMenu() {
    this.showActionsMenu = false;
    this.selectedSong = null;
  }

  private loadArtistData(): void {
    const artistId = this.getArtistIdFromRoute();
    if (!artistId) return;

    this.isLoading.set(true);
    this.error.set(null);

    // Cargar artista y canciones en paralelo
    this.artistService.getArtistById(artistId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(err => {
          this.handleError('Error al cargar el artista', err);
          return of(null);
        })
      )
      .subscribe(artist => {
        this.artist.set(artist);
      });

    this.artistService.getSongsByArtist(artistId)
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(err => {
        this.handleError('Error al cargar canciones', err);
        return of([] as Song[]);
      })
    )
    .subscribe(songs => {
      this.songs.set(songs);
      this.isLoading.set(false);
    });
  }

  private getArtistIdFromRoute(): number | null {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.error.set('ID de artista inválido');
      return null;
    }
    return id;
  }

  private handleError(message: string, error: Error): void {
    this.error.set(message);
    console.error(`${message}:`, error);
    this.isLoading.set(false);
  }
}