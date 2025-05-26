import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Song } from '@/app/models/SongModel';
import { environment } from '@/environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private apiUrl = `${environment.apiUrl}/songs`;
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  // Obtener todas las canciones con signal
  getAllSongs() {
    return toSignal(
      this.http.get<Song[]>(this.apiUrl),
      { initialValue: [] }
    );
  }

  // Obtener canción por ID con signal
  getSongById(id: number) {
    return toSignal(
      this.http.get<Song>(`${this.apiUrl}/${id}`)
    );
  }

  // Buscar canciones con signal
  searchSongs(query: string): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.apiUrl}/search`, { 
      params: { title: query } 
    });
  }

  private addBaseUrl(song: Song): Song {
    if (song.path_song) {
      song.path_song = this.baseUrl + song.path_song;
    }
    return song;
  }
}
