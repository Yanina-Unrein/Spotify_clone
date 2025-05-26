import { Song } from '@/app/models/SongModel';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonPlaySmallComponent } from "../../button-play-small/button-play-small.component";

@Component({
  selector: 'app-song-view',
  imports: [CommonModule, ButtonPlaySmallComponent],
  templateUrl: './song-view.component.html',
  styleUrl: './song-view.component.css'
})
export class SongViewComponent {
  @Input() song!: Song;
  @Input() playlistId?: string;  // Nuevo input opcional
  @Input() playlistSongs: Song[] = [];  // Nuevo input opcional
  isFavorite: boolean = false;

  getArtistsString(song: Song): string {
    return song.artists?.map(artist => artist.name).join(', ') || '';
  }

  toggleFavorite(song: Song): void {
    this.isFavorite = !this.isFavorite;
    console.log(this.isFavorite ? 'Agregado a favoritos' : 'Eliminado de favoritos', song.title);
  }

  addToPlaylist(song: Song): void {
    console.log('Agregado a playlist:', song.title);
  }
}
