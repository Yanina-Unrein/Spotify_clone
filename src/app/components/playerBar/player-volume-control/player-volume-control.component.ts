import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { PlayerVolumeIconComponent } from "../player-volume-icon/player-volume-icon.component";
import { PlayerService } from '@/app/services/player/player.service';

@Component({
  selector: 'app-player-volume-control',
  standalone: true, 
  imports: [CommonModule, FormsModule, PlayerVolumeIconComponent],
  templateUrl: './player-volume-control.component.html',
  styleUrl: './player-volume-control.component.css'
})
export class PlayerVolumeControlComponent {
  private playerService = inject(PlayerService);

  // Usamos las señales directamente del servicio
  volume = this.playerService.volume;
  isMuted = this.playerService.isMuted;

  // Computed property para el valor del volumen visual
  displayVolume = computed(() => {
    return this.isMuted() ? 0 : this.volume();
  });

  onVolumeChange(event: Event) {
    const newVolume = parseFloat((event.target as HTMLInputElement).value);
    this.playerService.setVolume(newVolume);
  }

  toggleMute() {
    this.playerService.toggleMute();
  }
}