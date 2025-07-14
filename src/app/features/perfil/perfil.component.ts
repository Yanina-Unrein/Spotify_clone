import { Playlist } from '@/app/models/PlaylistModel';
import { AuthService } from '@/app/services/auth/auth.service';
import { PlaylistService } from '@/app/services/playlist/playlist.service';
import { UserService } from '@/app/services/user/user.service';
import { ChangeDetectorRef, Component, effect, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CardPlayListComponent } from "../../components/cards/card-play-list/card-play-list.component";
import { PerfilOptionsComponent } from "../../components/menus/perfil-options/perfil-options.component";
import { EditPerfilComponent } from "../../components/modals/edit-perfil/edit-perfil.component";

@Component({
  selector: 'app-perfil',
  imports: [CardPlayListComponent, PerfilOptionsComponent, EditPerfilComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private playlistService = inject(PlaylistService);
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);
  
  profileForm: FormGroup;
  passwordForm: FormGroup;
  userPlaylists = signal<Playlist[]>([]);
  isHovering = false;
  uploadingImage = false;
  currentUser = this.authService.currentUser;

  showEditModal = false;
  showOptionsMenu = false;
  showImageConfirmModal = false;
  optionsMenuPosition = { x: 0, y: 0 };

  apiError = signal<string | null>(null);

  @Output() cardClick = new EventEmitter<Playlist>();

  constructor(
    private fb: FormBuilder,
  ) {
    this.profileForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    effect(() => {
      this.authService.currentUser(); 
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.loadUserPlaylists();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserPlaylists(): void {
    const userId = this.currentUser()?.id;
    
    // Verificación explícita de userId
    if (userId === undefined || userId === null) {
        this.apiError.set('Usuario no identificado');
        return;
    }

    this.apiError.set(null);
    
    this.playlistService.getPlaylistsByUser(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (playlists) => {
                this.userPlaylists.set(playlists);
            },
            error: (error) => {
                this.apiError.set(this.getErrorMessage(error));
            }
        });
  }

  private getErrorMessage(error: any): string {
      if (error.status === 401) {
          return 'Sesión expirada. Por favor inicia sesión nuevamente.';
      } else if (error.status === 403) {
          return 'No tienes permiso para ver estas playlists';
      } else if (error.status === 404) {
          return 'Usuario no encontrado';
      } else {
          return 'Error al cargar las playlists';
      }
  }

  
  onFirstImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
        this.uploadingImage = true;
        this.userService.uploadProfileImage(file).subscribe({
            next: (res) => {
                // Usar el método correcto: updateUserProfileImage
                this.authService.updateUserProfileImage(res.profile_image);
                this.uploadingImage = false;
            },
            error: (err) => {
                console.error('Error al subir imagen:', err);
                this.uploadingImage = false;
            }
        });
    }
  }

  openEditModalFromImage(): void {
    const fileInput = document.querySelector('.image-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  updateProfile(): void {
    if (!this.profileForm.valid) return;

    const formValues = this.profileForm.value;
    const currentUser = this.currentUser();
    const updateCalls = [];

    if (formValues.first_name !== currentUser?.first_name || formValues.last_name !== currentUser?.last_name) {
      updateCalls.push(this.userService.updateName({
        first_name: formValues.first_name,
        last_name: formValues.last_name
      }));
    }

    if (formValues.email !== currentUser?.email) {
      updateCalls.push(this.userService.updateEmail({ email: formValues.email }));
    }

    if (updateCalls.length === 0) {
      alert('No se detectaron cambios en el perfil');
      return;
    }

    // Ejecutar las peticiones en paralelo
    Promise.all(updateCalls.map(obs => obs.toPromise()))
      .then(() => {
        this.authService.updateUserProfile({
          ...currentUser,
          ...formValues
        });
        alert('Perfil actualizado con éxito');
      })
      .catch((error) => {
        if (error === 'Email o username ya en uso') {
          this.profileForm.get('email')?.setErrors({ emailInUse: true });
        } else {
          console.error('Error al actualizar perfil:', error);
        }
      });
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword } = this.passwordForm.value;
      this.userService.changePassword({ currentPassword, newPassword }).subscribe({
        next: () => {
          alert('Contraseña actualizada exitosamente');
          this.passwordForm.reset();
        },
        error: (err) => console.error('Error al cambiar contraseña:', err)
      });
    }
  }

  private passwordMatchValidator(form: FormGroup): { mismatch: boolean } | null {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value 
      ? null 
      : { mismatch: true };
  }

  onCardClick(playlist: Playlist): void {
    this.cardClick.emit(playlist);
  }

  // Métodos para manejar los modales
  openOptionsMenu(event: MouseEvent) {
    event.stopPropagation();
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    
    this.optionsMenuPosition = {
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY
    };
    this.showOptionsMenu = true;
  }

  closeModals() {
    this.showOptionsMenu = false;
    this.showEditModal = false;
    this.showImageConfirmModal = false;
    this.authService.refreshUserData();
  }

  handleEditProfile() {
    this.showOptionsMenu = false;
    this.showEditModal = true;
  }

  openEditModal(): void {
    this.showEditModal = true;
  }
}
