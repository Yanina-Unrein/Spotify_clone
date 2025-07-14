import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsideLibraryItemComponent } from "../../shared/aside-library-item/aside-library-item.component";
import { PlaylistService } from '@/app/services/playlist/playlist.service';
import { AuthService } from '@/app/services/auth/auth.service';
import { Playlist } from '@/app/models/PlaylistModel';
import { Router } from '@angular/router';
import { CardAsideComponent } from '../../cards/card-aside/card-aside.component';
import { BtnAddComponent } from '../../buttons/btn-add/btn-add.component';


@Component({
  selector: 'app-aside-menu',
  standalone: true,
  imports: [CommonModule, AsideLibraryItemComponent, CardAsideComponent, BtnAddComponent],
  templateUrl: './aside-menu.component.html',
  styleUrl: './aside-menu.component.css'
})
export class AsideMenuComponent {
  authService = inject(AuthService);
  private playlistService = inject(PlaylistService);
  private router = inject(Router);

  playlists = signal<Playlist[]>([]);

  constructor() {
    // Escuchar actualizaciones de playlists
    this.playlistService.playlistsUpdated$.subscribe(() => {
      this.loadPlaylists();
    });

    // Cargar playlists inicialmente
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.loadPlaylists();
      } else {
        this.playlists.set([]);
      }
    });
  }

  loadPlaylists() {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    this.playlistService.getPlaylistsByUser(userId).subscribe({
      next: (playlists) => this.playlists.set(playlists),
      error: (error) => console.error('Error al cargar playlists:', error)
    });
  }
}