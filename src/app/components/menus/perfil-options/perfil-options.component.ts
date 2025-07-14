import { AuthService } from '@/app/services/auth/auth.service';
import { UserService } from '@/app/services/user/user.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ModalMessageComponent } from "../../modals/modalMessage/modal-message/modal-message.component";

@Component({
  selector: 'app-perfil-options',
  imports: [ModalMessageComponent],
  templateUrl: './perfil-options.component.html',
  styleUrl: './perfil-options.component.css'
})
export class PerfilOptionsComponent {
  @Input() position?: { x: number, y: number };
  @Output() close = new EventEmitter<void>();
  @Output() editSelected = new EventEmitter<void>();
  
  // Variables para el modal de confirmación
  showDeleteModal = false;
  modalTitle = 'Eliminar cuenta';
  modalMessage = '¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Todos tus datos y playlists se perderán.';
  showAlert = false;
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  onDeleteAccount() {
    this.showDeleteModal = true;
  }

  handleConfirmDelete() {
    this.userService.deleteAccount().subscribe({
      next: () => {
        this.showAlertMessage('Cuenta eliminada exitosamente', 'success');
        
        setTimeout(() => {
          this.close.emit();
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error al eliminar cuenta:', err);
        this.showAlertMessage(err.message || 'Error al eliminar cuenta', 'error');
      }
    });
  }

  handleCancelDelete() {
    this.showDeleteModal = false;
  }

  private showAlertMessage(message: string, type: 'success' | 'error') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    
    setTimeout(() => {
      this.showAlert = false;
    }, type === 'success' ? 3000 : 5000);
  }
}
