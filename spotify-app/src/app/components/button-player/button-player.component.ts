import { PlayerService } from '@/app/services/sound/player.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
  isHovered: boolean = false;
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
    this.playerService.togglePlay();
  }
}