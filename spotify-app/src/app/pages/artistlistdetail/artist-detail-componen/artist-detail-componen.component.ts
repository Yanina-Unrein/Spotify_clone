import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardPlaylistButtonComponent } from "../../../components/card-playlist-button/card-playlist-button.component";
import { ButtonPlaySmallComponent } from "../../../components/button-play-small/button-play-small.component";
import { ArtistService } from '@/app/services/artist/artist.service';
import { Song } from '@/app/models/SongModel';
import { Artist } from '@/app/models/ArtistModel';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-artist-detail-componen',
  imports: [CommonModule, CardPlaylistButtonComponent, ButtonPlaySmallComponent],
  templateUrl: './artist-detail-componen.component.html',
  styleUrl: './artist-detail-componen.component.css'
})
export class ArtistDetailComponenComponent implements OnInit, OnDestroy {
  artist: Artist | null = null;
  songs: Song[] = [];
  artistId: number = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private artistService: ArtistService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.params.subscribe(params => {
        this.artistId = +params['id'];
        console.log('Artist ID:', this.artistId);
        
        if (this.artistId) {
          this.loadArtistDetail();
          this.loadArtistSongs();
        } else {
          console.error('ID de artista no válido');
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadArtistDetail(): void {
    this.subscriptions.add(
      this.artistService.getArtistById(this.artistId).subscribe({
        next: (data) => {
          console.log('Datos del artista recibidos:', data);
          this.artist = data;
        },
        error: (error) => {
          console.error('Error al cargar los detalles del artista:', error);
        }
      })
    );
  }

  loadArtistSongs(): void {
    this.subscriptions.add(
      this.artistService.getSongsByArtist(this.artistId).subscribe({
        next: (data) => {
          console.log('Canciones del artista recibidas:', data);
          this.songs = data;
        },
        error: (error) => {
          console.error('Error al cargar las canciones del artista:', error);
        }
      })
    );
  }
}
