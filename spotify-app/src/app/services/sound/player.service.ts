import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private currentMusicSubject = new BehaviorSubject<any>(null);
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private volumeSubject = new BehaviorSubject<number>(1);
  private isMutedSubject = new BehaviorSubject<boolean>(false);

  currentMusic$ = this.currentMusicSubject.asObservable();
  isPlaying$ = this.isPlayingSubject.asObservable();
  volume$ = this.volumeSubject.asObservable();
  isMuted$ = this.isMutedSubject.asObservable();

  get currentMusic(): any {
    return this.currentMusicSubject.value;
  }

  get isPlaying(): boolean {
    return this.isPlayingSubject.value;
  }

  setCurrentMusic(music: any) {
    if (this.currentMusic?.id !== music?.id) {
      this.currentMusicSubject.next(music);
      this.isPlayingSubject.next(true);
    }
  }

  play(music: any) {
    this.setCurrentMusic(music);
    this.isPlayingSubject.next(true);
  }

  pause() {
    this.isPlayingSubject.next(false);
  }

  togglePlay() {
    this.isPlayingSubject.next(!this.isPlaying);
  }

  setVolume(volume: number) {
    this.volumeSubject.next(volume);
    this.isMutedSubject.next(volume === 0);
  }

  toggleMute() {
    const currentMuteStatus = this.isMutedSubject.value;
    this.isMutedSubject.next(!currentMuteStatus);
    if (currentMuteStatus) {
      this.setVolume(this.volumeSubject.value);
    } else {
      this.setVolume(0);
    }
  }
}