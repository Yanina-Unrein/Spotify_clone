import { Playlist, Song } from '@/app/lib/data';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PlayerService {
  private currentMusicSubject = new BehaviorSubject<{ song: Song | null; playlist: Playlist | null; songs: Song[] }>({ song: null, playlist: null, songs: [] });
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private volumeSubject = new BehaviorSubject<number>(0.1);

  currentMusic$ = this.currentMusicSubject.asObservable();
  isPlaying$ = this.isPlayingSubject.asObservable();
  volume$ = this.volumeSubject.asObservable();

  constructor() {}

  setCurrentMusic(currentMusic: { song: Song | null; playlist: Playlist | null; songs: Song[] }) {
    this.currentMusicSubject.next(currentMusic);
  }

  setIsPlaying(isPlaying: boolean) {
    this.isPlayingSubject.next(isPlaying);
  }

  setVolume(volume: number) {
    this.volumeSubject.next(volume);
  }

  playSong() {
    this.setIsPlaying(true);
  }

  pauseSong() {
    this.setIsPlaying(false);
  }

  nextSong() {
    const currentMusic = this.currentMusicSubject.value;
  
    if (currentMusic.songs.length === 0) {
      console.error('No songs available in the playlist.');
      return;
    }

    const songId = currentMusic.song?.id;
    if (songId !== undefined && songId !== null) {
      const nextSong = currentMusic.songs.find(song => song.id === songId + 1);
      if (nextSong) {
        this.setCurrentMusic({ ...currentMusic, song: nextSong });
      } else {
        console.log('No next song found in the playlist.');
      }
    } else {
      console.error('No song is currently playing or song id is null/undefined');
    }
  }

  prevSong() {
    const currentMusic = this.currentMusicSubject.value;

    if (currentMusic.songs.length === 0) {
      console.error('No songs available in the playlist.');
      return;
    }

    const songId = currentMusic.song?.id;
    if (songId !== undefined && songId !== null) {
      const prevSong = currentMusic.songs.find(song => song.id === songId - 1);
      if (prevSong) {
        this.setCurrentMusic({ ...currentMusic, song: prevSong });
      } else {
        console.log('No previous song found in the playlist.');
      }
    } else {
      console.error('No song is currently playing or song id is null/undefined');
    }
  }
}