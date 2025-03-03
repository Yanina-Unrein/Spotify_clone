import { PlayerService } from '@/app/services/player/player.service';
import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit} from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-button-player',
  imports: [CommonModule],
  standalone: true, 
  templateUrl: './button-player.component.html',
  styleUrl: './button-player.component.css'
})
export class ButtonPlayerComponent implements OnInit, OnDestroy {
 
  @Input() music: any;
  
  isPlaying: boolean = false;
  isHoveredPrev: boolean = false;
  isHoveredNext: boolean = false;
  isHoveredPlay: boolean = false;

  private subscription = new Subscription();

  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.playerService.isPlaying$.subscribe(isPlaying => {
        this.isPlaying = isPlaying;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onClick(): void {
    if (!this.music || (this.playerService.currentMusic && this.music.id !== this.playerService.currentMusic.id)) {
      this.playerService.play(this.music);
    } else {
      this.playerService.togglePlay();
    }
  }

  onPrevSong(): void {
    this.playerService.previousTrack();
  }

  onNextSong(): void {
    this.playerService.nextTrack();
  }
}