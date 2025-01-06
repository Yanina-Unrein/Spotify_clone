import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ButtonPlayerComponent } from '../button-player/button-player.component';
import { PlayerVolumeControlComponent } from "../player-volume-control/player-volume-control.component";
import { PlayerService } from '@/app/services/sound/player.service';
import { PlayerCurrentSongComponent } from "../player-current-song/player-current-song.component";


@Component({
  selector: 'app-player',
  imports: [CommonModule, ButtonPlayerComponent, PlayerVolumeControlComponent, PlayerCurrentSongComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent implements OnInit {
  currentMusic: any = {}; // Detalles de la canción actual

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    // Escuchar cambios en la canción actual
    this.playerService.currentMusic$.subscribe((currentMusic) => {
      this.currentMusic = currentMusic;
    });
  }
}