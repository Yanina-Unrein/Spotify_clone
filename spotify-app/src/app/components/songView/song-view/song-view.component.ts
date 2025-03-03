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
  isFavorite: boolean = false;
  isPlaying: boolean = false; // Estado de reproducción

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    // Aquí puedes agregar lógica adicional para controlar la reproducción de música
  }

  getArtistsString(song: Song): string {
    return song.artists?.map(artist => artist.name).join(', ') || '';
  }

// Método para manejar el clic en "Agregar a favoritos"
 toggleFavorite(song: Song): void {
  this.isFavorite = !this.isFavorite;  // Cambiar el estado
  console.log(this.isFavorite ? 'Agregado a favoritos' : 'Eliminado de favoritos', song.title);
}
  // Método para manejar el clic en "Agregar a playlist"
  addToPlaylist(song: Song): void {
    console.log('Agregado a playlist:', song.title);
  }
}
