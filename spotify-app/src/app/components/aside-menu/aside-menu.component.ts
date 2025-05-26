import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsideLibraryItemComponent } from "../aside-library-item/aside-library-item.component";
import { CardAsideComponent } from '../card-aside/card-aside.component';
import { BtnAddComponent } from "../btn-add/btn-add.component";
import { PlaylistService } from '@/app/services/playlist/playlist.service';
import { AuthService } from '@/app/services/auth/auth.service';
import { Playlist } from '@/app/models/PlaylistModel';

@Component({
  selector: 'app-aside-menu',
  standalone: true,
  imports: [CommonModule, AsideLibraryItemComponent, CardAsideComponent, BtnAddComponent],
  templateUrl: './aside-menu.component.html',
  styleUrl: './aside-menu.component.css'
})
export class AsideMenuComponent {
  private playlistService = inject(PlaylistService);
  private authService = inject(AuthService);

  // Usamos signal para las playlists
  playlists = signal<Playlist[]>([]);

  constructor() {
    this.loadPlaylists();
  }

  // Método para cargar playlists
  loadPlaylists() {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    this.playlistService.getPlaylistsByUser(userId).subscribe({
      next: (playlists) => {
        this.playlists.set(playlists);
      },
      error: (error) => {
        console.error('Error al cargar playlists:', error);
      }
    });
  }
}