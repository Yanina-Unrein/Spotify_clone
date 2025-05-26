import { CommonModule } from '@angular/common';
import { Component, computed, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonPlaySmallComponent } from '../button-play-small/button-play-small.component';
import { Playlist } from '@/app/models/PlaylistModel';
import { Song } from '@/app/models/SongModel';

@Component({
  selector: 'app-card-aside',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonPlaySmallComponent],
  templateUrl: './card-aside.component.html',
  styleUrl: './card-aside.component.css'
})
export class CardAsideComponent {
   @Input({ required: true }) playlist!: Playlist;

  // Computed properties
  firstSong = computed(() => {
  const defaultSong: Song = {
    id: this.playlist.id,
    title: this.playlist.title || 'Sin título',
    path_song: this.playlist.songs?.[0]?.path_song || '',
    duration: this.playlist.songs?.[0]?.duration || '0:00',
    image_path: this.playlist.songs?.[0]?.image_path || '',
    album: this.playlist.songs?.[0]?.album || '',
    artists: this.playlist.songs?.[0]?.artists || []
  };
  return defaultSong;
});

  songCount = computed(() => this.playlist.songs?.length || 0);
  playlistTitle = computed(() => this.playlist.title || 'Sin título');
  
  hasImage = computed(() => 
    !!(this.playlist.songs && this.playlist.songs.length > 0 && 
       this.playlist.songs[0].image_path)
  );

  cover = computed(() => 
    this.hasImage() ? this.playlist.songs?.[0]?.image_path || null : null
  );

  background = computed(() => {
    if ((this.playlist.songs ?? []).length > 0 && this.playlist.songs?.[0]?.image_path) {
      return `url(${this.playlist.songs?.[0]?.image_path ?? ''})`;
    }
    return `linear-gradient(to bottom, ${this.playlist.color || '#1F1F1F'}, #121212)`;
  });

  artistsString = computed(() => {
    const uniqueArtists = new Set<string>();
    this.playlist.songs?.forEach(song => {
      song.artists?.forEach(artist => {
        uniqueArtists.add(artist.name);
      });
    });
    return Array.from(uniqueArtists).join(', ') || 'Sin artistas';
  });
}