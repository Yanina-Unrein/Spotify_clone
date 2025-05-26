import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-playlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-playlist.component.html',
  styleUrl: './modal-playlist.component.css'
})
export class ModalPlaylistComponent {
 @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  
  playlistName: string = '';
  isLoading = false; 

  onSave() {
    if (!this.playlistName.trim()) return;
    
    this.isLoading = true; 
    
    try {
      this.save.emit(this.playlistName.trim());
      this.playlistName = '';
    } catch (error) {
      console.error('Error en modal:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onCancel() {
    this.cancel.emit();
    this.playlistName = '';
  }
}