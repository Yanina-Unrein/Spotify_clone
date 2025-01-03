import { Playlist, playlists } from '@/app/lib/data';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-aside',
  imports: [CommonModule, RouterLink],
  templateUrl: './card-aside.component.html',
  styleUrl: './card-aside.component.css'
})
export class CardAsideComponent {
  @Input() playlist!: Playlist;

  get artistsString(): string {
    return this.playlist.artists.join(", ");
  }
}
