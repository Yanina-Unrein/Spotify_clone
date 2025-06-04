import { Song } from '@/app/models/SongModel';
import { PlayerService } from '@/app/services/player/player.service';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input } from '@angular/core';

@Component({
  selector: 'app-card-playlist-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-playlist-button.component.html',
  styleUrl: './card-playlist-button.component.css'
})
export class CardPlaylistButtonComponent {
    private playerService = inject(PlayerService);
  
  @Input({ required: true }) songs: Song[] = [];
  @Input({ required: true }) playlistId!: string;
  
  isPlaying = computed(() => {
    return this.playerService.isPlaying() && 
           this.playerService.currentPlaylistId() === this.playlistId;
  });

  handleClick() {
    if (this.isPlaying()) {
      this.playerService.pause();
    } else {
      // Filtramos canciones válidas antes de reproducir
      const validSongs = this.songs.filter(song => song?.path_song);
      if (validSongs.length > 0) {
        this.playerService.playPlaylist(validSongs, this.playlistId);
      } else {
        console.error('No hay canciones válidas para reproducir');
      }
    }
  }
}
