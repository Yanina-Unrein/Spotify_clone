import { PlayerService } from '@/app/services/player/player.service';
import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-card-playlist-button',
  imports: [CommonModule],
  templateUrl: './card-playlist-button.component.html',
  styleUrl: './card-playlist-button.component.css'
})
export class CardPlaylistButtonComponent implements OnInit, OnDestroy {
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
        this.isPlaying = !!currentMusic && this.music?.id === currentMusic?.id && isPlaying;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleClick() {
  console.log('Reproduciendo música:', this.music);
  if (!this.music?.url) {
    console.error('La URL de la música no está definida');
    return;
  }

  if (this.music?.id !== this.playerService.currentMusic?.id) {
    // Reproducir la canción seleccionada
    this.playerService.play(this.music);
  } else {
    // Alternar entre Play/Pause
    this.playerService.togglePlay();
  }
}
}

