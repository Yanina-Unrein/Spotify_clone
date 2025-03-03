import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardPlaylistButtonComponent } from "../card-playlist-button/card-playlist-button.component";
import { Playlist } from '@/app/models/PlaylistModel';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-play-list',
  standalone: true,
  imports: [RouterLink, CardPlaylistButtonComponent, CommonModule],
  templateUrl: './card-play-list.component.html',
  styleUrl: './card-play-list.component.css'
})
export class CardPlayListComponent {
  @Input() playlist!: Playlist;
  @Output() cardClick = new EventEmitter<Playlist>();

  get id(): number {
    return this.playlist.id;
  }

  get title(): string {
    return this.playlist.title;
  }

  get hasImage(): boolean {
    return !!(this.playlist.songs && this.playlist.songs.length > 0 && this.playlist.songs[0].image_path);
  }

  get cover(): string | null {
    return this.hasImage ? (this.playlist.songs?.[0]?.image_path || null) : null;
  }

  get artistsString(): string {
    if (!this.playlist.songs || this.playlist.songs.length === 0) {
      return 'Playlist vacía';
    }

    const uniqueArtists = new Set<string>();
    this.playlist.songs.forEach(song => {
      song.artists?.forEach(artist => {
        uniqueArtists.add(artist.name);
      });
    });

    const artistsArray = Array.from(uniqueArtists);
    return artistsArray.length > 0 ? artistsArray.join(', ') : 'Sin artistas';
  }

  onCardClick() {
    console.log('Playlist ID:', this.playlist.id); // Debug
    this.cardClick.emit(this.playlist);
  }
}
