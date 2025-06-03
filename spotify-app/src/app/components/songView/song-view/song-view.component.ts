import { PlayableSong, Song } from '@/app/models/SongModel';
import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { ButtonPlaySmallComponent } from "../../button-play-small/button-play-small.component";
import { SongActionsMenuComponent } from '../../song-actions-menu/song-actions-menu.component';
import { AuthService } from '@/app/services/auth/auth.service';


@Component({
  selector: 'app-song-view',
  imports: [CommonModule, ButtonPlaySmallComponent, SongActionsMenuComponent],
  templateUrl: './song-view.component.html',
  styleUrl: './song-view.component.css'
})
export class SongViewComponent {
  @Input() isCurrent: boolean = false;
  @Input() isPlaying: boolean = false;
  @Input() song!: Song;
  @Input() playlistId?: string;
  @Input() playlistSongs: Song[] = [];
  isFavorite: boolean = false;

  // Control del menú de acciones
  showActionsMenu = false;
  selectedSong: Song | null = null;
  menuPosition = { x: 0, y: 0 };

  // Control del tooltip
  showLoginTooltip = false;
  tooltipPosition = { x: 0, y: 0 };
  hoveredButton: 'playlist' | 'favorite' | null = null;
  tooltipMessage = '';

  constructor(public authService: AuthService) {}

  getArtistName(): string {
    if (!this.song) return 'Artista desconocido';

    // Caso 1: Verificar si es PlayableSong con artist_name
    if (this.isPlayableSong(this.song)) {
      return this.song.artist_name || this.getArtistsFromArray() || 'Artista desconocido';
    }

    // Caso 2: Verificar array de artistas
    return this.getArtistsFromArray() || 'Artista desconocido';
  }

  private getArtistsFromArray(): string | null {
    if (!this.song.artists) return null;

    // Verificar si artists es un array de objetos con propiedad name
    if (Array.isArray(this.song.artists)) {
      const artistNames = this.song.artists
        .filter(artist => artist && typeof artist === 'object' && 'name' in artist)
        .map(artist => (artist as { name: string }).name);

      return artistNames.length > 0 ? artistNames.join(', ') : null;
    }

    // Verificar si artists es un string (caso alternativo)
    if (typeof this.song.artists === 'string') {
      return this.song.artists;
    }

    return null;
  }

  private isPlayableSong(song: Song | PlayableSong): song is PlayableSong {
    return 'artist_name' in song;
  }


  toggleFavorite(song: Song, event: MouseEvent): void {
    if (!this.authService.currentUser()) {
      this.showTooltip('favorite', event);
      return;
    }
    this.isFavorite = !this.isFavorite;
    console.log(this.isFavorite ? 'Agregado a favoritos' : 'Eliminado de favoritos', song.title);
  }

  openAddToPlaylistMenu(song: Song, event: MouseEvent): void {
    if (!this.authService.currentUser()) {
      this.showTooltip('playlist', event);
      return;
    }
    this.openActionsMenu(song, event);
  }

  showTooltip(buttonType: 'playlist' | 'favorite', event: MouseEvent) {
    this.hoveredButton = buttonType;
    this.tooltipMessage = buttonType === 'playlist' 
      ? 'Inicia sesión para agregar a playlist' 
      : 'Inicia sesión para guardar en favoritos';
    
    this.showLoginTooltip = true;
    this.updateTooltipPosition(event);
  }

  updateTooltipPosition(event: MouseEvent) {
    this.tooltipPosition = {
      x: event.clientX,
      y: event.clientY + 15 
    };
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.showLoginTooltip) {
      this.updateTooltipPosition(event);
    }
  }

  hideTooltip() {
    this.showLoginTooltip = false;
    this.hoveredButton = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showActionsMenu) return;
    
    const target = event.target as HTMLElement;
    const clickedInsideMenu = target.closest('.song-actions-menu');
    const clickedOptionsButton = target.closest('.action-button');
    
    if (!clickedInsideMenu && !clickedOptionsButton) {
      this.closeActionsMenu();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (this.showActionsMenu) {
      this.closeActionsMenu();
    }
    this.hideTooltip();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    if (this.showActionsMenu) {
      this.closeActionsMenu();
    }
    this.hideTooltip();
  }
  
  openActionsMenu(song: Song, event: MouseEvent) {
    event.stopPropagation();
    
    if (this.showActionsMenu && this.selectedSong?.id === song.id) {
      this.closeActionsMenu();
      return;
    }
    
    this.selectedSong = song;
    this.showActionsMenu = true;
    
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
}
