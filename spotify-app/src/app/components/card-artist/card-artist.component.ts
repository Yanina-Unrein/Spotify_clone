import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardPlaylistButtonComponent } from "../card-playlist-button/card-playlist-button.component";
import { RouterLink } from '@angular/router';
import { Artist } from '@/app/lib/data';

@Component({
  selector: 'app-card-artist',
  imports: [CardPlaylistButtonComponent, RouterLink],
  templateUrl: './card-artist.component.html',
  styleUrl: './card-artist.component.css'
})
export class CardArtistComponent {
  @Input() artist!: Artist;
  @Output() cardClick = new EventEmitter<Artist>(); 

  get id(): number {
    return this.artist.id;
  }

  get name(): string {
    return this.artist.name;
  }

  get photo(): string {
    return this.artist.photo;
  }


  // Método para manejar el clic en la tarjeta
  onCardClick() {
    this.cardClick.emit(this.artist);  // Emite el artista completo
  }
}
