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
  @Input() isMuted: boolean = false;
  @Output() muteToggle = new EventEmitter<void>();

  toggleMute(): void {
    this.muteToggle.emit();
  }
}
