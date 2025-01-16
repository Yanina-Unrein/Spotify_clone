import { allPlaylists, Playlist, playlists, songs } from '@/app/lib/data';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardPlaylistButtonComponent } from "../../../components/card-playlist-button/card-playlist-button.component";
import { ButtonPlaySmallComponent } from "../../../components/button-play-small/button-play-small.component";


@Component({
  selector: 'app-play-list-detail',
  imports: [CommonModule, CardPlaylistButtonComponent, ButtonPlaySmallComponent],
  templateUrl: './play-list-detail.component.html',
  styleUrl: './play-list-detail.component.css'
})
export class PlayListDetailComponent implements OnInit {
  playlist: any = null;  // Almacena la playlist seleccionada
  playListSongs: any[] = [];  // Almacena las canciones de la playlist

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const playlistId = this.route.snapshot.paramMap.get('id');  // Obtiene el ID desde la URL

    console.log('Playlist ID (string):', playlistId);

    if (playlistId) {
      const numericPlaylistId = Number(playlistId);  // Convierte el ID a número
      console.log('Playlist ID (número):', numericPlaylistId);

      if (!isNaN(numericPlaylistId)) {
        // Busca la playlist por su ID
        this.playlist = playlists.find(p => p.id === numericPlaylistId.toString()) || null;
        console.log('Playlist encontrada:', this.playlist);

        if (this.playlist) {
          // Si se encuentra la playlist, filtra las canciones
          this.playListSongs = songs.filter(song => song.albumId === numericPlaylistId);
          console.log('Canciones de la playlist:', this.playListSongs);
        }
      } else {
        console.error('El ID de la playlist no es un número válido');
      }
    }
  }

  isPlaying: boolean = false; // Estado de reproducción

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    // Aquí puedes agregar lógica adicional para controlar la reproducción de música
  }
}
