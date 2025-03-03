import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPlaylistComponent } from '../modalPlaylistAdd/modal-playlist/modal-playlist.component';
import { PlaylistService } from '@/app/services/playlist/playlist.service';
import { AuthService } from '@/app/services/auth/auth.service';

@Component({
  selector: 'app-btn-add',
  standalone: true,
  imports: [CommonModule, ModalPlaylistComponent],
  templateUrl: './btn-add.component.html',
  styleUrl: './btn-add.component.css'
})
export class BtnAddComponent {
  @Output() createPlaylist = new EventEmitter<void>();
  showModal: boolean = false;

  constructor(
    private playlistService: PlaylistService,
    private authService: AuthService
  ) {}

  onSavePlaylist(name: string) {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      console.error('No hay usuario logueado');
      return;
    }

    const data = {
      userId: currentUser.id, // Cambiado de user_id a userId
      title: name.trim()
    };
    
    if (!data.title) return;

    console.log('Datos a enviar:', data);

    this.playlistService.createPlaylist(data).subscribe({
      next: (playlist) => {
        console.log('Playlist creada:', playlist);
        this.showModal = false;
        this.createPlaylist.emit();
      },
      error: (error) => {
        console.error('Error al crear playlist:', error);
        console.log('Error details:', error.error);
      }
    });
  }
}
