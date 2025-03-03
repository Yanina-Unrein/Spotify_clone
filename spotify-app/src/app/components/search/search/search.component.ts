import { Artist } from '@/app/models/ArtistModel';
import { Playlist } from '@/app/models/PlaylistModel';
import { Song } from '@/app/models/SongModel';
import { ArtistService } from '@/app/services/artist/artist.service';
import { PlaylistService } from '@/app/services/playlist/playlist.service';
import { SongService } from '@/app/services/song/song.service';
import { Component, OnInit } from '@angular/core';
import { CardArtistComponent } from '../../card-artist/card-artist.component';
import { CardPlayListComponent } from '../../card-play-list/card-play-list.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SongViewComponent } from '../../songView/song-view/song-view.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, CardArtistComponent, CardPlayListComponent, SongViewComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  searchQuery: string = '';
  songs: Song[] = [];
  artists: Artist[] = [];
  playlists: Playlist[] = [];
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private songService: SongService,
    private artistService: ArtistService,
    private playlistService: PlaylistService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
        if (params['q']) {
            this.searchQuery = params['q'];
            this.search(this.searchQuery);
        }
    });
}

  search(query: string): void {
    if (!query.trim()) {
      this.songs = [];
      this.artists = [];
      this.playlists = [];
      return;
    }

    this.isLoading = true;
    this.songs = [];
    this.artists = [];
    this.playlists = [];

    this.songService.searchSongs(query).subscribe((data) => {
      this.songs = data;
    });

    this.artistService.searchArtistsByName(query).subscribe((data) => {
      this.artists = data;
    });

    this.playlistService.getPlaylistsByUser(1).subscribe((data) => {
      // Filtramos las playlists que coincidan con el título
      this.playlists = data.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
    });

    this.isLoading = false;
  }
}
