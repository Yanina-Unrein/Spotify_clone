import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-player-current-song',
  imports: [CommonModule],
  templateUrl: './player-current-song.component.html',
  styleUrl: './player-current-song.component.css'
})
export class PlayerCurrentSongComponent {
  @Input() image!: string | null; 
  @Input() title!: string;        
  @Input() artists?: string[];    
}
