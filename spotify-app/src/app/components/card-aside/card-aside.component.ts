import { Playlist, playlists } from '@/app/lib/data';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonPlaySmallComponent } from '../button-play-small/button-play-small.component';

@Component({
  selector: 'app-card-aside',
  imports: [CommonModule, RouterLink, ButtonPlaySmallComponent],
  templateUrl: './card-aside.component.html',
  styleUrl: './card-aside.component.css'
})
export class CardAsideComponent {
  @Input() playlist!: Playlist;

  get artistsString(): string {
    return this.playlist.artists.join(", ");
  }

  isPlaying: boolean = false; // Estado de reproducción

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    // Aquí puedes agregar lógica adicional para controlar la reproducción de música
  }
}
