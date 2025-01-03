import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Playlist, playlists } from '@/app/lib/data';
import { CardPlayListComponent } from '../card-play-list/card-play-list.component';
import { GreetingComponent } from "../greeting/greeting.component";

@Component({
  selector: 'app-playlist-container',
  imports: [CommonModule, CardPlayListComponent, GreetingComponent],
  templateUrl: './playlist-container.component.html',
  styleUrl: './playlist-container.component.css',
})

export class PlaylistContainerComponent {
  playlists: Playlist[] = []; // Inicializa la propiedad
  @Output() cardClick = new EventEmitter<Playlist>(); 

  ngOnInit(): void {
    // Asigna las playlists desde el archivo de datos
    this.playlists = playlists;
  }

  onCardClick(playlist: Playlist) {
    this.cardClick.emit(playlist);  // Emite el evento con la tarjeta seleccionada
  }
}
