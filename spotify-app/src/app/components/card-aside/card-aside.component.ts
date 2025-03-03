import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonPlaySmallComponent } from '../button-play-small/button-play-small.component';
import { Playlist } from '@/app/models/PlaylistModel';
import { PlayableItem } from '@/app/models/SongModel';

@Component({
  selector: 'app-card-aside',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonPlaySmallComponent],
  templateUrl: './card-aside.component.html',
  styleUrl: './card-aside.component.css'
})
export class CardAsideComponent {
  @Input() playlist!: Playlist;

  get playablePlaylist(): PlayableItem {
    return {
      id: this.playlist.id,
      title: this.playlist.title || 'Sin título',
      path_song: this.playlist.songs?.[0]?.path_song || '',
      duration: this.playlist.songs?.[0]?.duration || '',
      image_path: this.playlist.songs?.[0]?.image_path,
      artists: this.playlist.songs?.[0]?.artists
    };
  }

  get playlistTitle(): string {
    return this.playlist.title || 'Sin título';
  }

  get hasImage(): boolean {
    return !!(this.playlist.songs && this.playlist.songs.length > 0 && this.playlist.songs[0].image_path);
  }

  get cover(): string | null {
    return this.hasImage ? this.playlist.songs?.[0]?.image_path || null : null;
  }

  get background(): string {
    if ((this.playlist.songs ?? []).length > 0 && this.playlist.songs?.[0]?.image_path) {
      return `url(${this.playlist.songs?.[0]?.image_path ?? ''})`;
    }
    return `linear-gradient(to bottom, ${this.playlist.color || '#1F1F1F'}, #121212)`;
  }

  get artistsString(): string {
    const uniqueArtists = new Set<string>();
    this.playlist.songs?.forEach(song => {
      song.artists?.forEach(artist => {
        uniqueArtists.add(artist.name);
      });
    });
    return Array.from(uniqueArtists).join(', ') || 'Sin artistas';
  }

  isPlaying: boolean = false; // Estado de reproducción

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    // Aquí puedes agregar lógica adicional para controlar la reproducción de música
  }
}
