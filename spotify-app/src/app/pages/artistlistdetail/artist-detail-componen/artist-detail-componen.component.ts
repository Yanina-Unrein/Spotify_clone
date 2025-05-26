import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardPlaylistButtonComponent } from "../../../components/card-playlist-button/card-playlist-button.component";
import { ButtonPlaySmallComponent } from "../../../components/button-play-small/button-play-small.component";
import { ArtistService } from '@/app/services/artist/artist.service';
import { Song } from '@/app/models/SongModel';
import { Artist } from '@/app/models/ArtistModel';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-artist-detail-componen',
  imports: [CommonModule, CardPlaylistButtonComponent, ButtonPlaySmallComponent],
  templateUrl: './artist-detail-componen.component.html',
  styleUrl: './artist-detail-componen.component.css'
})
export class ArtistDetailComponenComponent {
  private artistService = inject(ArtistService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  // Estado reactivo
  artist = signal<Artist | null>(null);
  songs = signal<Song[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Computed properties
  backgroundImage = computed(() => {
    const photo = this.artist()?.photo;
    return photo ? `url(${photo})` : 'none';
  });

  constructor() {
    this.loadArtistData();
  }

  private loadArtistData(): void {
    const artistId = this.getArtistIdFromRoute();
    if (!artistId) return;

    this.isLoading.set(true);
    this.error.set(null);

    // Cargar artista y canciones en paralelo
    this.artistService.getArtistById(artistId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(err => {
          this.handleError('Error al cargar el artista', err);
          return of(null);
        })
      )
      .subscribe(artist => {
        this.artist.set(artist);
      });

    this.artistService.getSongsByArtist(artistId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(err => {
          this.handleError('Error al cargar canciones', err);
          return of([] as Song[]);
        })
      )
      .subscribe(songs => {
        this.songs.set(songs);
        this.isLoading.set(false);
      });
  }

  private getArtistIdFromRoute(): number | null {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.error.set('ID de artista inválido');
      return null;
    }
    return id;
  }

  private handleError(message: string, error: Error): void {
    this.error.set(message);
    console.error(`${message}:`, error);
    this.isLoading.set(false);
  }
}