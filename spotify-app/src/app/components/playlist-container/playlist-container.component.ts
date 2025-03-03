import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { CardPlayListComponent } from '../card-play-list/card-play-list.component';
import { GreetingComponent } from "../greeting/greeting.component";
import { CardArtistComponent } from "../card-artist/card-artist.component";
import { Artist } from '@/app/models/ArtistModel';
import { ArtistService } from '@/app/services/artist/artist.service';
import { PlaylistService } from '@/app/services/playlist/playlist.service';
import { AuthService } from '@/app/services/auth/auth.service';
import { Playlist } from '@/app/models/PlaylistModel';

@Component({
  selector: 'app-playlist-container',
  standalone: true,
  imports: [CommonModule, CardPlayListComponent, GreetingComponent, CardArtistComponent],
  templateUrl: './playlist-container.component.html',
  styleUrl: './playlist-container.component.css',
})
export class PlaylistContainerComponent {
  playlists: Playlist[] = [];
  artists: Artist[] = [];

  @Output() cardClick = new EventEmitter<Playlist>();
  @Output() cardArtistClick = new EventEmitter<Artist>();

  constructor(
    private artistService: ArtistService,
    private playlistService: PlaylistService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Cargar playlists del usuario
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.loadUserPlaylists(currentUser.id);
    }

    // Cargar artistas
    this.artistService.getArtists().subscribe({
      next: (data) => {
        this.artists = data;
      },
      error: (err) => {
        console.error('Error al cargar los artistas:', err);
      }
    });
  }

  loadUserPlaylists(userId: number) {
    this.playlistService.getPlaylistsByUser(userId).subscribe({
      next: (playlists) => {
        this.playlists = playlists;
        console.log('Playlists cargadas:', playlists);
      },
      error: (error) => {
        console.error('Error al cargar las playlists:', error);
      }
    });
  }

  onCardClick(playlist: Playlist) {
    this.cardClick.emit(playlist);
  }

  onArtistSelected(artist: Artist) {
    this.cardArtistClick.emit(artist);
  }
}
