import { Playlist } from '@/app/lib/data';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardPlaylistButtonComponent } from "../card-playlist-button/card-playlist-button.component";

@Component({
  selector: 'app-card-play-list',
  imports: [RouterLink, CardPlaylistButtonComponent],
  templateUrl: './card-play-list.component.html',
  styleUrl: './card-play-list.component.css'
})
export class CardPlayListComponent {
  @Input() playlist!: Playlist;
  @Output() cardClick = new EventEmitter<Playlist>();

  get id(): string {
    return this.playlist.id;
  }

  get cover(): string {
    return this.playlist.cover;
  }

  get title(): string {
    return this.playlist.title;
  }
  
  get artistsString(): string {
    return this.playlist.artists.join(", ");
  }

  onCardClick() {
    this.cardClick.emit(this.playlist);  // Emite el evento con la tarjeta seleccionada
  }
}
