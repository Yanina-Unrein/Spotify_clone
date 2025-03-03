import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlayableItem } from '@/app/models/SongModel';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private audio: HTMLAudioElement;
  private currentMusicSubject = new BehaviorSubject<PlayableItem | null>(null);
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private volumeSubject = new BehaviorSubject<number>(1);
  private isMutedSubject = new BehaviorSubject<boolean>(false);
  private lastVolume: number = 1;
  private playlist: PlayableItem[] = [];
  private currentIndex: number = -1;
  private currentPlayingIdSubject = new BehaviorSubject<number | null>(null);

  currentMusic$ = this.currentMusicSubject.asObservable();
  isPlaying$ = this.isPlayingSubject.asObservable();
  volume$ = this.volumeSubject.asObservable();
  isMuted$ = this.isMutedSubject.asObservable();

  get currentMusic(): PlayableItem | null {
    return this.currentMusicSubject.value;
  }

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.audio = isPlatformBrowser(this.platformId) ? new Audio() : {} as HTMLAudioElement;
    
    if (isPlatformBrowser(this.platformId)) {
      this.audio.addEventListener('ended', () => {
        this.nextTrack();
      });
    }
  }

  play(music: PlayableItem, playlist?: PlayableItem[]): void {
    if (!music || (this.currentMusic && this.currentMusic.id === music.id)) {
      this.togglePlay();
      return;
    }
  
    if (playlist) {
      this.playlist = playlist;
      this.currentIndex = this.playlist.findIndex(item => item.id === music.id);
    } else {
      this.playlist = [music];
      this.currentIndex = 0;
    }
  
    this.currentMusicSubject.next(music);
    this.currentPlayingIdSubject.next(music.id);
  
    // Construcción de la URL del audio
    const audioUrl = `http://localhost:3008${music.path_song}`;
    console.log("URL del audio:", audioUrl);
  
    if (!this.audio.canPlayType('audio/mpeg') && !this.audio.canPlayType('audio/ogg') && !this.audio.canPlayType('audio/wav')) {
      console.error("El navegador no soporta este formato de audio.");
      return;
    }
  
    this.audio.src = audioUrl;
    this.audio.load();  
  
    this.audio.play()
      .then(() => {
        this.isPlayingSubject.next(true);  // Asegúrate de actualizar isPlayingSubject
      })
      .catch(error => {
        console.error("Error al reproducir el audio:", error);
      });
  }

  previousTrack(): void {
    if (this.playlist.length === 0 || this.currentIndex === -1) return;
    
    if (this.audio.currentTime > 3) {
      // Si han pasado más de 3 segundos, reinicia la canción actual
      this.audio.currentTime = 0;
      this.audio.play();
    } else {
      // Si no, reproduce la canción anterior
      this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
      const previousSong = this.playlist[this.currentIndex];
      this.play(previousSong);
    }
  }

  nextTrack(): void {
    if (this.playlist.length === 0 || this.currentIndex === -1) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    const nextSong = this.playlist[this.currentIndex];
    this.play(nextSong);
  }

  togglePlay(): void {
    if (this.audio.paused) {
      this.audio.play();
      this.isPlayingSubject.next(true);
    } else {
      this.audio.pause();
      this.isPlayingSubject.next(false);
    }
  }

  setVolume(volume: number): void {
    if (volume === 0) {
      this.isMutedSubject.next(true);
    } else {
      this.isMutedSubject.next(false);
      this.lastVolume = volume;
    }
    this.audio.volume = volume;
    this.volumeSubject.next(volume);
  }

  toggleMute(): void {
    const isMuted = this.isMutedSubject.value;
    if (isMuted) {
      this.setVolume(this.lastVolume);
    } else {
      this.lastVolume = this.volumeSubject.value;
      this.setVolume(0);
    }
    this.isMutedSubject.next(!isMuted);
  }
}