import { PlayerService } from '@/app/services/player/player.service';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-button-player',
  imports: [CommonModule],
  standalone: true, 
  templateUrl: './button-player.component.html',
  styleUrl: './button-player.component.css'
})
export class ButtonPlayerComponent  {
 playerService = inject(PlayerService);
  
  // Estados de hover (opcional)
  isHoveredPrev = false;
  isHoveredPlay = false;
  isHoveredNext = false;
  isHoveredShuffle = false;

  // Señales del servicio
  currentSong = this.playerService.currentSong;
  isPlaying = this.playerService.isPlaying;
  currentTime = this.playerService.currentTime;
  duration = this.playerService.duration;
  hasNext = this.playerService.hasNext;
  hasPrevious = this.playerService.hasPrevious;
  isShuffled = this.playerService.isShuffled;

  togglePlay() {
    this.playerService.togglePlay();
  }

  prevSong() {
    this.playerService.previous();
  }

  nextSong() {
    this.playerService.next();
  }

  toggleShuffle() {
    this.playerService.toggleShuffle();
  }

  seekTo(event: Event) {
    const target = event.target as HTMLInputElement;
    const newTime = parseFloat(target.value);
    this.playerService.seekTo(newTime);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}