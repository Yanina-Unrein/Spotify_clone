import { Component, inject, signal } from '@angular/core';
import { AsideMenuComponent } from "../../components/aside-menu/aside-menu.component";
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { PlayerComponent } from '@/app/components/player/player.component';
import { MenuTopComponent } from "../../components/menu-top/menu-top.component";
import { Playlist } from '@/app/models/PlaylistModel';

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, AsideMenuComponent, RouterOutlet, PlayerComponent, MenuTopComponent],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.css'
})
export class HomeComponent {
 private router = inject(Router);
  selectedPlaylist = signal<Playlist | null>(null);

  onPlaylistSelected(playlist: Playlist) {
    this.selectedPlaylist.set(playlist);
    this.router.navigate(['playlist', playlist.id]);
  }

  clearSelection() {
    this.selectedPlaylist.set(null);
    this.router.navigate(['/']);
  }
}
