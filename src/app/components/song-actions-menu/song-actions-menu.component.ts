import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistService } from '@/app/services/playlist/playlist.service';
import { AuthService } from '@/app/services/auth/auth.service';
import { Playlist } from '@/app/models/PlaylistModel';
import { Song } from '@/app/models/SongModel';
import { FormsModule } from '@angular/forms';
import { ModalPlaylistComponent } from '../modalPlaylistAdd/modal-playlist/modal-playlist.component';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-song-actions-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalPlaylistComponent],
  templateUrl: './song-actions-menu.component.html',
  styleUrl: './song-actions-menu.component.css',
  host: { 'class': 'app-song-actions-menu' }
})
export class SongActionsMenuComponent {
  @Input() song!: Song;
  @Output() closeMenu = new EventEmitter<void>();
  
  showPlaylistOptions = false;
  showCreatePlaylistModal = false;
  userPlaylists: Playlist[] = [];
  searchQuery = '';

  constructor(
    private playlistService: PlaylistService,
    private authService: AuthService
  ) {}

  @HostListener('click', ['$event'])
  onMenuClick(event: MouseEvent) {
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.song-actions-menu') && !target.closest('.options-button')) {
      this.closeMenu.emit();
    }
  }

  ngOnInit() {
    this.loadUserPlaylists();
  }

  private loadUserPlaylists() {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.playlistService.getPlaylistsByUser(userId).subscribe(playlists => {
        this.userPlaylists = playlists;
      });
    }
  }

  togglePlaylistOptions() {
    this.showPlaylistOptions = !this.showPlaylistOptions;
  }

  openCreatePlaylistModal() {
    this.showCreatePlaylistModal = true;
  }

  handlePlaylistSave(playlistName: string) {
    this.showCreatePlaylistModal = false;
    this.createNewPlaylistAndAdd(playlistName);
  }

  private createNewPlaylistAndAdd(playlistName: string) {
    const userId = this.authService.currentUser()?.id;
    if (!userId || !this.song?.id) return;

    this.playlistService.createPlaylist({
      userId,
      title: playlistName
    }).pipe(
      switchMap(newPlaylist => {
        this.userPlaylists.unshift(newPlaylist);
        return this.playlistService.addSongToPlaylist({
          playlistId: newPlaylist.id,
          songId: this.song.id
        });
      })
    ).subscribe({
      next: () => {
        this.closeMenu.emit();
      },
      error: (err) => {
        console.error('Error en el proceso:', err);
        alert(err.error?.error || 'Error en la operación');
      }
    });
  }

  addToPlaylist(playlistId: number) {
    if (!this.song?.id) {
      return;
    }

    this.playlistService.addSongToPlaylist({
      playlistId: playlistId,
      songId: this.song.id
    }).subscribe({
      next: () => {
        this.closeMenu.emit();
      },
      error: (err) => {
        alert(err.error?.error || 'Error al agregar canción');
        console.error('Detalles del error:', err);
      }
    });
  }

  addToFavorites() {
    alert('Canción agregada a favoritos');
    this.closeMenu.emit();
  }

  get filteredPlaylists() {
    return this.userPlaylists.filter(playlist =>
      playlist.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
  
}

