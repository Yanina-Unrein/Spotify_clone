import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonPlayerComponent } from '../button-player/button-player.component';
import { PlayerVolumeControlComponent } from '../player-volume-control/player-volume-control.component';
import { PlayerCurrentSongComponent } from '../player-current-song/player-current-song.component';
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
export class PlayerComponent  {
  protected playerService = inject(PlayerService);
}