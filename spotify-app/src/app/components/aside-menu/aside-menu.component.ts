import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AsideLibraryItemComponent } from "../aside-library-item/aside-library-item.component";
import { CardAsideComponent } from '../card-aside/card-aside.component';
import { BtnAddComponent } from "../btn-add/btn-add.component";
import { PlaylistService } from '@/app/services/playlist/playlist.service';
import { AuthService } from '@/app/services/auth/auth.service';
import { CreatePlaylistDTO, Playlist } from '@/app/models/PlaylistModel';

@Component({
  selector: 'app-aside-menu',
  standalone: true,
  imports: [CommonModule, AsideLibraryItemComponent, CardAsideComponent, BtnAddComponent],
  templateUrl: './aside-menu.component.html',
  styleUrl: './aside-menu.component.css'
})
export class AsideMenuComponent implements OnInit {
  playlists: Playlist[] = [];

  constructor(
    private playlistService: PlaylistService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.loadUserPlaylists(currentUser.id);
    }
  }

  loadUserPlaylists(userId: number) {
    this.playlistService.getPlaylistsByUser(userId).subscribe({
      next: (playlists) => {
        this.playlists = playlists;
      },
      error: (error) => {
        console.error('Error al cargar las playlists:', error);
      }
    });
  }

  createPlaylist() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const newPlaylist: CreatePlaylistDTO = {
        userId: currentUser.id,
        title: 'Nueva Playlist'
      };

      this.playlistService.createPlaylist(newPlaylist).subscribe({
        next: (playlist) => {
          this.playlists = [...this.playlists, playlist];
        },
        error: (error) => {
          console.error('Error al crear playlist:', error);
        }
      });
    }
  }
}
