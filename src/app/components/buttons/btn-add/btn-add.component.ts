import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistService } from '@/app/services/playlist/playlist.service';
import { AuthService } from '@/app/services/auth/auth.service';
import { ModalPlaylistComponent } from '../../modals/modalPlaylistAdd/modal-playlist/modal-playlist.component';

@Component({
  selector: 'app-btn-add',
  standalone: true,
  imports: [CommonModule, ModalPlaylistComponent],
  templateUrl: './btn-add.component.html',
  styleUrl: './btn-add.component.css'
})
export class BtnAddComponent {
  private playlistService = inject(PlaylistService);
  private authService = inject(AuthService);

  showModal = signal(false);
  currentUser = this.authService.currentUser;

  onSavePlaylist(name: string) {
    const user = this.currentUser();
    if (!user) return;

    const data = {
      userId: user.id,
      title: name.trim()
    };

    if (!data.title) return;

    this.playlistService.createPlaylist(data).subscribe({
      next: (newPlaylist) => {
        console.log('Playlist creada:', newPlaylist);
        this.showModal.set(false);
        // No necesitamos emitir evento, el servicio ya notifica
        alert('Playlist creada con éxito!');
      },
      error: (error) => {
        console.error('Error al crear playlist:', error);
        alert('Error al crear la playlist: ' + error.message);
      }
    });
  }
}

