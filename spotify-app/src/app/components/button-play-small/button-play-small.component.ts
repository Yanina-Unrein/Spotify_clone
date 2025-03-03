import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, combineLatest } from 'rxjs';
import { PlayableItem } from '@/app/models/SongModel';
import { PlayerService } from '@/app/services/player/player.service';

@Component({
  selector: 'app-button-play-small',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-play-small.component.html',
  styleUrl: './button-play-small.component.css'
})
export class ButtonPlaySmallComponent implements OnInit, OnDestroy {
  @Input() music!: PlayableItem;
  isPlaying: boolean = false;
  private subscription = new Subscription();

  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    this.subscription.add(
      combineLatest([
        this.playerService.currentMusic$,
        this.playerService.isPlaying$
      ]).subscribe(([currentMusic, isPlaying]) => {
        this.isPlaying = currentMusic?.id === this.music?.id && isPlaying;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleClick() {
    if (this.music?.id !== this.playerService.currentMusic?.id) {
      this.playerService.play(this.music);
    } else {
      this.playerService.togglePlay();
    }
  }
}
