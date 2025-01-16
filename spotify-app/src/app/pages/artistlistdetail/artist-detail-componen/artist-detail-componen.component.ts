import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardPlaylistButtonComponent } from "../../../components/card-playlist-button/card-playlist-button.component";
import { Artist, artists, Playlist, songs } from '@/app/lib/data';
import { ButtonPlaySmallComponent } from "../../../components/button-play-small/button-play-small.component";

@Component({
  selector: 'app-artist-detail-componen',
  imports: [CommonModule, CardPlaylistButtonComponent, ButtonPlaySmallComponent],
  templateUrl: './artist-detail-componen.component.html',
  styleUrl: './artist-detail-componen.component.css'
})
export class ArtistDetailComponenComponent implements OnInit {
  artist: Artist | null = null; // Almacena el artista seleccionado
  artistSongs: any[] = []; // Almacena las canciones del artista
  @Input() playlist!: Playlist;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const artistId = this.route.snapshot.paramMap.get('id'); // Obtiene el ID del artista desde la URL

    if (artistId) {
      const numericartistId = Number(artistId);
      // Busca el artista por su nombre, ya que la URL tiene el nombre

      if (!isNaN(numericartistId)) {
        this.artist = artists.find(a => a.id === numericartistId) || null;

      }
      if (this.artist) {
        // Si se encuentra el artista, asigna las canciones asociadas
        this.artistSongs = this.artist.songs || [];
        console.log('Canciones del artista:', this.artistSongs);
      } else {
        console.error('Artista no encontrado');
      }
    }
  }

  isPlaying: boolean = false; // Estado de reproducción

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    // Aquí puedes agregar lógica adicional para controlar la reproducción de música
  }
}
