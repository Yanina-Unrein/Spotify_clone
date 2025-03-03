import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  volume: number = 1; // Volumen inicial (máximo)
  isMuted: boolean = false; // Estado inicial de mute

  constructor(private playerService: PlayerService) {
    // Suscribirse al volumen y al estado de mute del servicio
    this.playerService.volume$.subscribe(vol => {
      this.volume = vol;
      this.isMuted = vol === 0; // Si el volumen es 0, está muteado
    });
    this.playerService.isMuted$.subscribe(muted => {
      this.isMuted = muted; // Actualizar el estado de mute
    });
  }

  // Cambiar el volumen cuando se mueve el control deslizante
  onVolumeChange(event: any): void {
    const newVolume = event.target.value;
    this.playerService.setVolume(newVolume);
  }

  // Alternar mute desde el componente de icono
  toggleMute(isMuted: boolean): void {
    this.playerService.toggleMute(); // Llamar al método de toggleMute en el servicio
  }
}