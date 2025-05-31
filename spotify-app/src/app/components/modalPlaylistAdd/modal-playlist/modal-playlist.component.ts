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
  errorMessage = '';

  onSave() {
    if (!this.playlistName.trim()) {
      this.errorMessage = 'El nombre no puede estar vacío';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.save.emit(this.playlistName.trim());
  }

  onCancel() {
    this.cancel.emit();
    this.playlistName = '';
    this.errorMessage = '';
  }
}