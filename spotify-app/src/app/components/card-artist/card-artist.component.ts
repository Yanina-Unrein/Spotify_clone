import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardPlaylistButtonComponent } from "../card-playlist-button/card-playlist-button.component";
import { RouterLink } from '@angular/router';
import { Artist } from '@/app/models/ArtistModel';
import { Song } from '@/app/models/SongModel';
import { ArtistService } from '@/app/services/artist/artist.service';

@Component({
  selector: 'app-card-artist',
  standalone: true,
  imports: [CardPlaylistButtonComponent, RouterLink],
  templateUrl: './card-artist.component.html',
  styleUrl: './card-artist.component.css'
})
export class CardArtistComponent {
  @Input() artist!: Artist;
  @Output() cardClick = new EventEmitter<Artist>();
  artistSongs: Song[] = [];

  constructor(private artistService: ArtistService) {}

  ngOnInit(): void {
    // Load artist songs if they're not already loaded
    if (this.artist && this.artist.id && (!this.artist.songs || this.artist.songs.length === 0)) {
      this.loadArtistSongs();
    } else if (this.artist && this.artist.songs) {
      this.artistSongs = this.artist.songs;
    }
  }

  // Load songs for this artist
  loadArtistSongs(): void {
    if (!this.artist || !this.artist.id) return;
    
    this.artistService.getSongsByArtist(this.artist.id).subscribe({
      next: (songs) => {
        this.artistSongs = songs;
        console.log(`Loaded ${songs.length} songs for artist ${this.artist.name}`);
      },
      error: (error) => {
        console.error(`Error loading songs for artist ${this.artist.id}:`, error);
      }
    });
  }

  // Emitir evento para navegar al detalle del artista
  onCardClick() {
    this.cardClick.emit(this.artist);
  }

  // Métodos getter para mostrar el nombre y la foto del artista
  get name(): string {
    return this.artist?.name || 'Nombre no disponible';
  }

  get photo(): string {
    return this.artist?.photo || 'ruta/a/imagen/default.jpg';
  }
}
