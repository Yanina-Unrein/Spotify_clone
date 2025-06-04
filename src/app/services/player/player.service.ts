import { Song } from '@/app/models/SongModel';
import { environment } from '@/environments/environment';
import { computed, effect, Injectable, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private audio: HTMLAudioElement | null = null;
  private platformId = inject(PLATFORM_ID);
  
  // Signals para el estado
  private _currentSong = signal<Song | null>(null);
  private _currentPlaylist = signal<Song[]>([]);
  private _currentPlaylistId = signal<string | null>(null);
  private _currentIndex = signal<number>(0);
  private _isPlaying = signal(false);
  private _currentTime = signal(0);
  private _duration = signal(0);
  private _volume = signal<number>(0.7);
  private _isMuted = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _isShuffled = signal(false);
  private _originalPlaylistOrder = signal<Song[]>([]);

  // Exponer señales como de solo lectura
  currentSong = this._currentSong.asReadonly();
  currentPlaylist = this._currentPlaylist.asReadonly();
  currentPlaylistId = this._currentPlaylistId.asReadonly();
  currentIndex = this._currentIndex.asReadonly();
  isPlaying = this._isPlaying.asReadonly();
  currentTime = this._currentTime.asReadonly();
  duration = this._duration.asReadonly();
  volume = this._volume.asReadonly();
  isMuted = this._isMuted.asReadonly();
  error = this._error.asReadonly();
  isShuffled = this._isShuffled.asReadonly();

  constructor(private http: HttpClient) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAudio();
    }
    
    effect(() => {
      const song = this._currentSong();
      const isPlaying = this._isPlaying();
      
      if (song && isPlaying && isPlatformBrowser(this.platformId)) {
        this.loadAndPlay(song).catch(error => {
          console.error('Error en effect:', error);
          this._isPlaying.set(false);
        });
       }
    });
  }

  private initializeAudio() {
    try {
      this.audio = new Audio();
      this.setupAudioListeners();
      this.audio.volume = this._volume();
      this.audio.preload = 'metadata';
    } catch (error) {
      console.error('Error al inicializar el reproductor:', error);
      this._error.set('Error al inicializar el reproductor');
    }
  }

  private setupAudioListeners() {
    if (!this.audio) return;

    this.audio.addEventListener('error', (e) => {
      console.error('Error de audio:', e);
      this._error.set(this.getAudioErrorMessage(this.audio?.error || null));
      this._isPlaying.set(false);
    });

    this.audio.addEventListener('timeupdate', () => {
      this._currentTime.set(this.audio?.currentTime || 0);
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this._duration.set(this.audio?.duration || 0);
    });

    this.audio.addEventListener('ended', () => {
      this.handleSongEnded();
    });

    this.audio.addEventListener('canplay', () => {
      console.log('Audio listo para reproducir');
    });

    this.audio.addEventListener('waiting', () => {
      console.log('Audio cargando...');
    });
  }

  private async loadAndPlay(song: Song): Promise<void> {
  if (!this.audio) {
    console.error('Audio element no inicializado');
    return;
  }

  if (!song?.path_song) {
    console.error('Canción no tiene path_song válido', song);
    this._error.set('Canción no válida');
    return;
  }

  try {
    const audioUrl = this.getValidAudioUrl(song.path_song);

    if (this.audio.src !== audioUrl) {
      this.audio.src = audioUrl;
      await new Promise((resolve, reject) => {
        this.audio!.oncanplaythrough = () => resolve(true);
        this.audio!.onerror = reject;
        this.audio!.load();
      });
    }
    
    await this.audio.play();
    this._isPlaying.set(true);
    this._error.set(null);
    
  } catch (err) {
    console.error('Error al reproducir:', err);
    this._error.set(this.getPlayErrorMessage(err));
    this._isPlaying.set(false);
    
    // Depuración adicional
    console.log('Datos de la canción:', {
      title: song.title,
      originalPath: song.path_song,
      constructedUrl: this.getValidAudioUrl(song.path_song)
    });
  }
}

  private getValidAudioUrl(path: string): string {
    if (!path) {
      console.error('Path no proporcionado');
      return '';
    }

    // Si ya es una URL completa
    if (path.startsWith('http')) {
      return path;
    }

    // Construir URL base correctamente
    const baseUrl = environment.apiUrl
      .replace(/\/api$/, '') // Eliminar /api final si existe
      .replace(/\/+$/, ''); // Eliminar barras finales

    // Limpiar el path de la canción
    const cleanPath = path
      .replace(/^\/+/, '') // Eliminar barras iniciales
      .replace(/^public\/|^songs\//, ''); // Eliminar prefijos comunes

    // URL final corregida
    return `${baseUrl}/public/songs/${cleanPath}`;
  }


  private handleSongEnded() {
    if (this.hasNext()) {
      this.next();
    } else {
      this._isPlaying.set(false);
      this._currentTime.set(0);
      // Opcional: Repetir playlist al finalizar
      // this._currentIndex.set(0);
      // this._currentSong.set(this.currentPlaylist()[0]);
    }
  }

  private getAudioErrorMessage(error: MediaError | null): string {
    if (!error) return 'Error desconocido al reproducir audio';
    
    switch(error.code) {
      case MediaError.MEDIA_ERR_ABORTED: return 'Reproducción cancelada';
      case MediaError.MEDIA_ERR_NETWORK: return 'Error de red al cargar el audio';
      case MediaError.MEDIA_ERR_DECODE: return 'Error al decodificar el audio';
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: 
        return 'Formato no soportado o archivo no encontrado';
      default: return 'Error al reproducir el audio';
    }
  }

  private getPlayErrorMessage(error: any): string {
    // Manejar eventos de error de audio
    if (error instanceof ErrorEvent || error?.type === 'error') {
      return this.getAudioErrorMessage(this.audio?.error || null);
    }

    // Manejar errores de reproducción
    if (error?.name) {
      switch(error.name) {
        case 'NotSupportedError': return 'Formato de audio no soportado';
        case 'NotAllowedError': return 'Reproducción bloqueada por política del navegador';
        case 'AbortError': return 'Reproducción abortada';
      }
    }

    // Manejar mensajes de error estándar
    if (error?.message) {
      if (typeof error.message === 'string' && error.message.includes('404')) {
        return 'Archivo de audio no encontrado';
      }
      return error.message;
    }

    return 'Error al reproducir la canción';
  }

  // Métodos públicos
  playPlaylist(playlist: Song[], playlistId: string, startIndex: number = 0) {
    if (!playlist?.length) {
      console.error('Playlist vacía');
      this._error.set('Playlist vacía');
      return;
    }

    const validSongs = playlist.filter(song => song?.path_song);
    
    if (!validSongs.length) {
      this._error.set('No hay canciones válidas en la playlist');
      return;
    }

    // Asegurarse que el playlistId tenga el formato correcto
    const normalizedPlaylistId = playlistId.startsWith('playlist-') || 
                              playlistId.startsWith('artist-') || 
                              playlistId.startsWith('single-')
      ? playlistId
      : `playlist-${playlistId}`;

    this._originalPlaylistOrder.set([...validSongs]);
    this._currentPlaylist.set([...validSongs]);
    this._currentPlaylistId.set(normalizedPlaylistId);
    this._currentIndex.set(Math.min(startIndex, validSongs.length - 1));
    this._currentSong.set(validSongs[Math.min(startIndex, validSongs.length - 1)]);
    this._isShuffled.set(false);
    this._isPlaying.set(true);
  }

  playSong(song: Song) {
    if (!song?.path_song) {
      this._error.set('Canción no válida');
      return;
    }
    
    this._currentSong.set(song);
    this._currentPlaylist.set([song]);
    this._currentPlaylistId.set(`single-${song.id}`);
    this._currentIndex.set(0);
    this._isShuffled.set(false);
    this._isPlaying.set(true);
  }

  togglePlay() {
    if (!this.audio || !this.currentSong()) return;

    if (this.isPlaying()) {
      this.pause();
    } else {
      this.audio.play()
        .then(() => this._isPlaying.set(true))
        .catch(error => {
          console.error('Error al reanudar:', error);
          this._error.set(this.getPlayErrorMessage(error));
        });
    }
  }

  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this._isPlaying.set(false);
  }

  next() {
    if (this.hasNext()) {
      const newIndex = this.currentIndex() + 1;
      this._currentIndex.set(newIndex);
      this._currentSong.set(this.currentPlaylist()[newIndex]);
    }
  }

  previous() {
    if (this.hasPrevious()) {
      const newIndex = this.currentIndex() - 1;
      this._currentIndex.set(newIndex);
      this._currentSong.set(this.currentPlaylist()[newIndex]);
    }
  }

  seekTo(time: number) {
    if (!this.audio || isNaN(time)) return;
    this.audio.currentTime = time;
    this._currentTime.set(time);
  }

  setVolume(volume: number) {
    const newVolume = Math.min(1, Math.max(0, volume));
    this._volume.set(newVolume);
    
    if (this.audio) {
      this.audio.volume = newVolume;
      this._isMuted.set(false);
      this.audio.muted = false;
    }
  }

  toggleMute() {
    if (!this.audio) return;
    
    const willMute = !this.isMuted();
    this._isMuted.set(willMute);
    this.audio.muted = willMute;
  }

  toggleShuffle() {
    if (this.isShuffled()) {
      // Restaurar orden original
      this._currentPlaylist.set([...this._originalPlaylistOrder()]);
      this._isShuffled.set(false);
    } else {
      // Mezclar playlist
      const shuffled = [...this.currentPlaylist()];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      this._currentPlaylist.set(shuffled);
      this._isShuffled.set(true);
    }
    
    // Ajustar el índice actual para mantener la canción que se está reproduciendo
    const currentSongId = this.currentSong()?.id;
    if (currentSongId) {
      const newIndex = this.currentPlaylist().findIndex(s => s.id === currentSongId);
      if (newIndex !== -1) {
        this._currentIndex.set(newIndex);
      }
    }
  }

  clearError() {
    this._error.set(null);
  }

  // Computed properties
  hasNext = computed(() => {
    const playlist = this.currentPlaylist();
    const index = this.currentIndex();
    return playlist.length > 0 && index < playlist.length - 1;
  });

  hasPrevious = computed(() => this.currentIndex() > 0);

  getProgress = computed(() => {
    if (this.duration() <= 0) return 0;
    return (this.currentTime() / this.duration()) * 100;
  });

  getTimeRemaining = computed(() => {
    return this.duration() - this.currentTime();
  });
}