import { Component, computed, DestroyRef, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CardPlaylistButtonComponent } from "../card-playlist-button/card-playlist-button.component";
import { RouterLink } from '@angular/router';
import { Artist } from '@/app/models/ArtistModel';
import { ArtistService } from '@/app/services/artist/artist.service';
import { catchError, of } from 'rxjs';
import { Song } from '@/app/models/SongModel';

@Component({
  selector: 'app-card-artist',
  standalone: true,
  imports: [CardPlaylistButtonComponent, RouterLink],
  templateUrl: './card-artist.component.html',
  styleUrl: './card-artist.component.css'
})
export class CardArtistComponent {
   private artistService = inject(ArtistService);
  private destroyRef = inject(DestroyRef);

  // Signal para el estado interno del artista
  private _artist = signal<Artist>({
    id: 0,
    name: '',
    photo: '',
    songs: []
  });

  // Input público con alias para mantener compatibilidad
  @Input({ required: true, alias: 'artist' }) 
  set artistInput(value: Artist) {
    this._artist.set(value);
    this.loadArtistSongs();
  }

  // Estado reactivo
  artistSongs = signal<Song[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed properties
  artist = this._artist.asReadonly(); 
  name = computed(() => this._artist().name);
  photo = computed(() => this._artist().photo);
  hasSongs = computed(() => this.artistSongs().length > 0);

  @Output() cardClick = new EventEmitter<Artist>();

  private loadArtistSongs() {
  const currentArtist = this._artist();

  // Caso 1: Las canciones ya vienen como array de objetos Song
  if (Array.isArray(currentArtist.songs)) {
    const validSongs = currentArtist.songs.filter(song => 
      song?.id && 
      song?.title && 
      song?.path_song && 
      song?.duration // Aseguramos que tenga duración
    );
    this.artistSongs.set(validSongs);
    return;
  }

  // Caso 2: No hay canciones (undefined/null) - cargar desde API
  this.fetchSongsFromApi(currentArtist.id);
}

private fetchSongsFromApi(artistId: number) {
  this.isLoading.set(true);
  this.error.set(null);

  this.artistService.getSongsByArtist(artistId)
    .pipe(
      catchError(error => {
        this.error.set('Error al cargar canciones');
        console.error(error);
        return of([] as Song[]);
      })
    )
    .subscribe(songs => {
      // Aseguramos que cada canción tenga artistas y duración
      const completeSongs = songs.map(song => ({
        ...song,
        artists: song.artists || [this.getMinimalArtistData()],
        duration: song.duration // Respetamos la duración de la BD
      }));
      
      this.artistSongs.set(completeSongs);
      this.isLoading.set(false);
    });
}

private getMinimalArtistData(): Artist {
  const artist = this._artist();
  return {
    id: artist.id,
    name: artist.name,
    photo: artist.photo || undefined
  };
}

  onCardClick() {
    const currentArtist = this._artist();
    if (currentArtist.id) {
      this.cardClick.emit(currentArtist);
    }
  }
}