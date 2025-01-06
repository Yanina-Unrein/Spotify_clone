import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Artist, artists, Playlist, playlists } from '@/app/lib/data';
import { CardPlayListComponent } from '../card-play-list/card-play-list.component';
import { GreetingComponent } from "../greeting/greeting.component";
import { CardArtistComponent } from "../card-artist/card-artist.component";

@Component({
  selector: 'app-playlist-container',
  imports: [CommonModule, CardPlayListComponent, GreetingComponent, CardArtistComponent],
  templateUrl: './playlist-container.component.html',
  styleUrl: './playlist-container.component.css',
})

export class PlaylistContainerComponent {
  playlists: Playlist[] = [];
  artists: Artist[] = []; // Aquí asignamos los artistas a la propiedad

  @Output() cardClick = new EventEmitter<Playlist>();
  @Output() cardArtistClick = new EventEmitter<Artist>();

  ngOnInit(): void {
    this.playlists = playlists;
    this.artists = artists;
  }

  onCardClick(playlist: Playlist) {
    this.cardClick.emit(playlist);
  }

  onArtistSelected(artist: Artist) {
    this.cardArtistClick.emit(artist);
  }
}
