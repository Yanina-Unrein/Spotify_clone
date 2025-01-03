import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-player-volume-icon',
  imports: [CommonModule],
  standalone: true, 
  templateUrl: './player-volume-icon.component.html',
  styleUrl: './player-volume-icon.component.css'
})
export class PlayerVolumeIconComponent {
  @Input() isMuted: boolean = false; // Estado de mute recibido del padre
  @Output() muteToggle = new EventEmitter<boolean>(); // Notifica el cambio de mute

  toggleMute(): void {
    this.isMuted = !this.isMuted; // Cambiar el estado de mute
    this.muteToggle.emit(this.isMuted); // Emitir el nuevo estado al padre
  }
}
