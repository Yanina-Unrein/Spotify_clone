import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardPlaylistButtonComponent } from "../card-playlist-button/card-playlist-button.component";
import { CommonModule } from '@angular/common';
import { Playlist } from '@/app/models/PlaylistModel';

@Component({
  selector: 'app-card-play-list',
  standalone: true,
  imports: [RouterLink, CardPlaylistButtonComponent, CommonModule],
  templateUrl: './card-play-list.component.html',
  styleUrl: './card-play-list.component.css'
})
export class CardPlayListComponent {
private _playlist = signal<Playlist>(this.createEmptyPlaylist());

  @Input({ required: true }) 
  set playlist(value: Playlist) {
    this._playlist.set(value);
  }
  get playlist(): Playlist {
    return this._playlist();
  }

  // Computed properties
  title = computed(() => this.playlist.title);
  color = computed(() => this.playlist.color); // Usa directamente el color de la BD
  
  hasImage = computed(() => {
    const firstSong = this.playlist.songs?.[0];
    return !!firstSong?.image_path;
  });

  cover = computed(() => {
    return this.playlist.songs?.[0]?.image_path || null;
  });

  artistsString = computed(() => {
    const songs = this.playlist.songs;
    if (!songs || songs.length === 0) return 'Playlist vacía';

    const artists = new Set<string>();
    songs.forEach(song => {
      song.artists?.forEach(artist => artists.add(artist.name));
    });
    
    return artists.size > 0 ? 
           Array.from(artists).join(', ') : 
           'Varios artistas';
  });

  validSongs = computed(() => {
    return this.playlist.songs?.filter(song => 
      song?.id && song?.path_song
    ) || [];
  });

  @Output() cardClick = new EventEmitter<Playlist>();

  private createEmptyPlaylist(): Playlist {
    return {
      id: 0,
      user_id: 0,
      title: '',
      color: '#333333', // Color de respaldo por si acaso
      songs: []
    };
  }

  onCardClick() {
    if (this.playlist.id) {
      this.cardClick.emit(this.playlist);
    }
  }
}