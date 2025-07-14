import { PlayerService } from '@/app/services/player/player.service';
import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';


@Component({
  selector: 'app-player-current-song',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-current-song.component.html',
  styleUrl: './player-current-song.component.css'
})
export class PlayerCurrentSongComponent {
  private playerService = inject(PlayerService);

  // Usamos las señales directamente del servicio
  currentSong = this.playerService.currentSong;

  // Computed property para los nombres de artistas
  artistNames = computed(() => {
    const song = this.currentSong();
    if (!song) return 'Unknown Artist';
    
    // Asumiendo que Song tiene una propiedad artists con array de {name: string}
    return song.artists?.map(a => a.name).join(', ');
  });

  // Computed property para la foto del artista (si es necesario)
  artistPhoto = computed(() => {
    const song = this.currentSong();
    if (!song) return '/assets/default-artist.png';
    
    // Si tienes una propiedad para la foto del artista principal
    return song.artists?.[0]?.photo;
  });
}