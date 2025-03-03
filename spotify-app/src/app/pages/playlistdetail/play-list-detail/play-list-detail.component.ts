import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardPlaylistButtonComponent } from "../../../components/card-playlist-button/card-playlist-button.component";
import { ButtonPlaySmallComponent } from "../../../components/button-play-small/button-play-small.component";
import { PlaylistService } from "../../../services/playlist/playlist.service";
import { Artist } from '@/app/models/ArtistModel';
import { Song } from '@/app/models/SongModel';


@Component({
  selector: 'app-play-list-detail',
  imports: [CommonModule, CardPlaylistButtonComponent, ButtonPlaySmallComponent],
  templateUrl: './play-list-detail.component.html',
  styleUrl: './play-list-detail.component.css'
})
export class PlayListDetailComponent implements OnInit {
  playlist: any = null;  // Almacena la playlist seleccionada
  playListSongs: any[] = [];  // Almacena las canciones de la playlist

  constructor(private route: ActivatedRoute, private playlistService: PlaylistService) {}

  ngOnInit(): void {
    const playlistId = this.route.snapshot.paramMap.get('id');
    if (playlistId) {
      const numericPlaylistId = Number(playlistId);
      if (!isNaN(numericPlaylistId)) {
        this.playlistService.getPlaylistById(numericPlaylistId).subscribe({
          next: (playlist) => {
            this.playlist = playlist;
            this.playListSongs = playlist.songs || [];
            console.log('Playlist encontrada:', this.playlist);
          },
          error: (error) => {
            console.error('Error al cargar la playlist:', error);
          }
        });
      }
    }
  }

  isPlaying: boolean = false; // Estado de reproducción

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    // Aquí puedes agregar lógica adicional para controlar la reproducción de música
  }

  get firstSongImage(): string | null {
    return this.playListSongs[0]?.image_path || null;
  }

  getArtistsString(song: Song): string {
    return song.artists?.map(artist => artist.name).join(', ') || '';
  }
}
