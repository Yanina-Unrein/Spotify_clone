import { PlayerService } from '@/app/services/sound/player.service';
import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-button-play-small',
  imports: [CommonModule],
  templateUrl: './button-play-small.component.html',
  styleUrl: './button-play-small.component.css'
})
export class ButtonPlaySmallComponent implements OnInit, OnDestroy {
  @Input() music: any;
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
