import { Component, computed, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '@/app/services/player/player.service';
import { Song } from '@/app/models/SongModel';

@Component({
  selector: 'app-button-play-small',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-play-small.component.html',
  styleUrl: './button-play-small.component.css'
})
export class ButtonPlaySmallComponent  {
  private playerService = inject(PlayerService);
  
  @Input({ required: true }) song!: Song;
  @Input() playlistId?: string;
  @Input() playlistSongs: Song[] = [];

  isPlaying = computed(() => {
  const currentSong = this.playerService.currentSong();
  const currentPlaylistId = this.playerService.currentPlaylistId();
  
  // Caso 1: Reproduciendo una canción individual
  if (!currentPlaylistId && currentSong?.id === this.song.id) {
    return this.playerService.isPlaying();
  }
  
  // Caso 2: Reproduciendo una playlist/artista
  return this.playerService.isPlaying() && 
         currentSong?.id === this.song.id &&
         currentPlaylistId === this.playlistId;
});

  handleClick() {
    if (this.isPlaying()) {
      this.playerService.pause();
    } else {
      this.playSong();
    }
  }

  private playSong() {
    if (!this.song?.path_song) {
      console.error('La canción no tiene ruta válida');
      return;
    }

    // Determinar las canciones a reproducir
    const songsToPlay = this.playlistSongs.length > 0 ? 
      this.playlistSongs : 
      [this.song];

    // Determinar el índice de la canción actual
    const songIndex = this.playlistSongs.findIndex(s => s.id === this.song.id);

    if (this.playlistId) {
      this.playerService.playPlaylist(
        songsToPlay, 
        this.playlistId, 
        songIndex >= 0 ? songIndex : 0
      );
    } else {
      this.playerService.playSong(this.song);
    }
  }
}
