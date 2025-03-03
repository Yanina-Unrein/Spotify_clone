import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonPlayerComponent } from '../button-player/button-player.component';
import { PlayerVolumeControlComponent } from '../player-volume-control/player-volume-control.component';
import { PlayerCurrentSongComponent } from '../player-current-song/player-current-song.component';
import { PlayableItem } from '@/app/models/SongModel';
import { Subscription } from 'rxjs';
import { PlayerService } from '@/app/services/player/player.service';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    CommonModule,
    ButtonPlayerComponent,
    PlayerVolumeControlComponent,
    PlayerCurrentSongComponent
  ],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent implements OnInit, OnDestroy {
  currentMusic: PlayableItem | null = null;
  private subscription = new Subscription();

  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.playerService.currentMusic$.subscribe(music => {
        this.currentMusic = music;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}