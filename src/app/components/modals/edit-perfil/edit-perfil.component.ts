import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '@/app/services/user/user.service';
import { AuthService } from '@/app/services/auth/auth.service';
import { ModalMessageComponent } from "../modalMessage/modal-message/modal-message.component";


@Component({
  selector: 'app-edit-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalMessageComponent],
  templateUrl: './edit-perfil.component.html',
  styleUrl: './edit-perfil.component.css'
})
export class EditPerfilComponent {
  @Input() userData: any;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  editForm: FormGroup;
  showPasswordFields = false;
  currentPasswordVisible = false;
  newPasswordVisible = false;
  confirmPasswordVisible = false;
  isSaving = false;
  hovered = false;
  profileImageFile: File | null = null;
  passwordError: string | null = null;
  generalError: string | null = null;
  passwordSuccess: string | null = null;

  showConfirmModal = false;
  confirmModalTitle = 'Eliminar imagen de perfil';
  confirmModalMessage = '¿Estás seguro de que quieres eliminar tu imagen de perfil?';

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  firstNameUpdated = false;
  lastNameUpdated = false;
  emailUpdated = false;
  private onlyLettersPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/;

  constructor() {
    this.editForm = this.fb.group({
      first_name: [this.userData?.first_name || '', [ 
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(this.onlyLettersPattern)
      ]],
      last_name: [this.userData?.last_name || '', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(this.onlyLettersPattern)
      ]],
      email: [this.userData?.email || '', [
        Validators.required, 
        Validators.email
      ]],
      profile_image: [null],
      current_password: [''],
      new_password: ['', [
        Validators.minLength(10),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d|.*[#?!@$%^&*-]).{10,}$/)
      ]],
      confirm_password: ['']
    }, 
    { 
      validators: [
        this.passwordMatchValidator
      ] 
    });
  }

  ngOnInit() {
    if (this.userData) {
      this.editForm.patchValue({
        first_name: this.userData.first_name,
        last_name: this.userData.last_name,
        email: this.userData.email,
        profile_image: this.userData.profile_image
      });

      this.editForm.get('first_name')?.markAsPristine();
      this.editForm.get('last_name')?.markAsPristine();
      this.editForm.get('email')?.markAsPristine();
    }
    this.editForm.get('email')?.valueChanges.subscribe(() => {
      this.emailUpdated = false;
    });

    this.editForm.get('new_password')?.valueChanges.subscribe(() => {
      this.passwordMatchValidator(this.editForm);
    });
  
    this.editForm.get('confirm_password')?.valueChanges.subscribe(() => {
      this.passwordMatchValidator(this.editForm);
    });
  }
  
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.profileImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.editForm.patchValue({ profile_image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
    if (!this.showPasswordFields) {
      this.editForm.patchValue({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      this.passwordError = null;
    }
  }

  toggleCurrentPasswordVisibility(): void {
    this.currentPasswordVisible = !this.currentPasswordVisible;
  }

  toggleNewPasswordVisibility(): void {
    this.newPasswordVisible = !this.newPasswordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  passwordMatchValidator(form: FormGroup): void {
    const newPassword = form.get('new_password')?.value;
    const confirmPassword = form.get('confirm_password')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      form.get('confirm_password')?.setErrors({ mismatch: true });
    } else {
      // Limpiar el error si coinciden
      if (form.get('confirm_password')?.hasError('mismatch')) {
        form.get('confirm_password')?.setErrors(null);
      }
    }
  }

  async onSubmit(): Promise<void> {
    this.isSaving = true;
    this.passwordError = null;
    this.generalError = null;

    this.markModifiedFieldsAsTouched();

    const hasErrors = this.hasErrorsInModifiedFields();
    
    if (hasErrors) {
      this.generalError = 'Por favor corrige los errores en el formulario';
      this.isSaving = false;
      return;
    }

    try {
      let hasChanges = false;

      if (this.profileImageFile) {
        await this.updateProfileImage();
        hasChanges = true;
      }

      if (this.hasProfileChanges()) {
        const nameChanged = this.editForm.get('first_name')?.dirty || 
                            this.editForm.get('last_name')?.dirty;
        
        const emailChanged = this.editForm.get('email')?.dirty;
        
        if (nameChanged) {
          await this.updateProfileData();
          hasChanges = true;
        }
        
        if (emailChanged) {
          await this.updateUserEmail(this.editForm.value.email);
          hasChanges = true;
        }
      }

      if (this.showPasswordFields && this.isPasswordValid()) {
        await this.updatePassword();
        hasChanges = true;
      }

      if (!hasChanges) {
        this.generalError = 'No se detectaron cambios válidos para guardar';
        return;
      }

      this.save.emit();
      this.close.emit();
      
    } catch (error: any) {
      console.error('Error en actualización:', error);
      this.generalError = error.error?.message || 'Error al actualizar el perfil';
      
    } finally {
      this.isSaving = false;
    }
  }

  private markModifiedFieldsAsTouched() {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      if (control?.dirty) {
        control.markAsTouched();
      }
    });
  }

  private hasErrorsInModifiedFields(): boolean {
    return Object.keys(this.editForm.controls).some(key => {
      const control = this.editForm.get(key);
      return control?.dirty && control.invalid;
    });
  }

  private isProfileDataValid(): boolean {
    const fields = ['first_name', 'last_name', 'email'];
    return fields.every(field => {
      const control = this.editForm.get(field);
      return !control?.dirty || control?.valid;
    });
  }

  private isPasswordValid(): boolean {
    if (!this.showPasswordFields) return true;
    const passwordFields = ['current_password', 'new_password', 'confirm_password'];
    const allFilled = passwordFields.every(field => !!this.editForm.get(field)?.value);
    
    return allFilled && 
           !this.editForm.get('new_password')?.errors &&
           !this.editForm.get('confirm_password')?.errors?.['mismatch'];
  }

  private hasProfileChanges(): boolean {
    if (!this.userData) return false;
    
    const formValues = this.editForm.value;
    return (
      (formValues.first_name !== this.userData.first_name) ||
      (formValues.last_name !== this.userData.last_name) ||
      (formValues.email !== this.userData.email)
    );
  }

  private updateProfileImage(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.profileImageFile) {
        resolve();
        return;
      }

      this.userService.uploadProfileImage(this.profileImageFile)
        .subscribe({
          next: (res) => {
            this.authService.updateUserProfileImage(res.profile_image);
            resolve();
          },
          error: (err) => {
            console.error('Error uploading image:', err);
            reject(new Error('Error al subir la imagen'));
          }
        });
    });
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  removeProfileImage() {
    this.showConfirmModal = true;
  }

  onConfirmRemoveImage() {
    this.showConfirmModal = false;
    this.isSaving = true;
    
    this.userService.removeProfileImage().subscribe({
      next: () => {
        this.editForm.patchValue({ profile_image: null });
        this.profileImageFile = null;
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error al eliminar imagen', err);
        this.generalError = err;
        this.isSaving = false;
      }
    });
  }

  onCancelRemoveImage() {
    this.showConfirmModal = false;
  }

  private updateProfileData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isSaving = true;
      
      const { first_name, last_name } = this.editForm.value;
      
      this.userService.updateName({ first_name, last_name }).subscribe({
        next: (updatedUser) => {
          this.authService.updateUserProfile(updatedUser);
          
          // Actualizar vista inmediatamente
          this.editForm.patchValue({
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name
          });
          
          this.firstNameUpdated = true;
          this.lastNameUpdated = true;
          
          // Cerrar modal después de éxito
          setTimeout(() => {
            this.firstNameUpdated = false;
            this.lastNameUpdated = false;
            this.close.emit();
            resolve();
          }, 2000);
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Error updating name:', err);
          this.generalError = 'Error al actualizar el nombre';
          reject(err);
        }
      });
    });
  }

  private updateUserEmail(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isSaving = true;
      this.generalError = null;

      this.userService.updateEmail({ email }).subscribe({
        next: (response) => {  // Cambia updatedUser por response
          // Actualizar token ya se hizo en el servicio, solo actualiza UI
          const updatedUser = response.user;  // Extrae el usuario de la respuesta
          
          // Actualizar formulario con los nuevos datos
          this.editForm.patchValue({
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            email: updatedUser.email
          });
          
          // Resetear estado
          this.editForm.get('email')?.markAsPristine();
          this.emailUpdated = true;
          
          // Cerrar modal después de éxito
          setTimeout(() => {
            this.emailUpdated = false;
            resolve();
          }, 1500);
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Error actualizando email:', err);
          
          if (err.error?.error === 'Email ya en uso') {
            this.editForm.get('email')?.setErrors({ emailInUse: true });
            this.generalError = 'Este email ya está en uso';
          } else {
            this.generalError = 'Error al actualizar el email. Por favor intenta nuevamente.';
          }
          
          reject(err);
        }
      });
    });
  }

  private updatePassword(): Promise<void> {
    return new Promise((resolve, reject) => {
      const passwordData = {
        currentPassword: this.editForm.value.current_password,
        newPassword: this.editForm.value.new_password
      };

      this.userService.changePassword(passwordData)
      .subscribe({
        next: () => {
          // Éxito: mostrar mensaje y limpiar campos
          this.passwordSuccess = '¡Contraseña actualizada con éxito!';
          this.passwordError = null;
          
          // Limpiar campos y ocultar sección después de éxito
          this.editForm.patchValue({
            current_password: '',
            new_password: '',
            confirm_password: ''
          });
          this.showPasswordFields = false;
          
          // Limpiar mensaje después de 3 segundos
          setTimeout(() => {
            this.passwordSuccess = null;
          }, 3000);
          resolve();
        },
        error: (err) => {
          // Error: mostrar mensaje específico
          this.passwordError = err.error?.message || 'Error al cambiar la contraseña';
          
          // Mantener campos llenos para que el usuario pueda corregir
          this.editForm.get('current_password')?.reset();
          this.editForm.get('new_password')?.reset();
          this.editForm.get('confirm_password')?.reset();
          
          reject(err);
        }
      });
    });
  }
  getFirstNameErrors(): string | null {
    const control = this.editForm.get('first_name');
    
    // Solo mostrar errores si el campo ha sido modificado y tocado
    if (!control || (!control.dirty && !control.touched)) {
      return null;
    }
    
    if (control.hasError('required')) {
      return 'El nombre es obligatorio';
    }
    
    if (control.hasError('minlength')) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (control.hasError('pattern')) {
      return 'Solo se permiten letras y espacios';
    }
    
    return null;
  }

  getLastNameErrors(): string | null {
    const control = this.editForm.get('last_name');
    
    if (!control || (!control.dirty && !control.touched)) {
      return null;
    }
    
    if (control.hasError('required')) {
      return 'El apellido es obligatorio';
    }
    
    if (control.hasError('minlength')) {
      return 'El apellido debe tener al menos 2 caracteres';
    }
    
    if (control.hasError('pattern')) {
      return 'Solo se permiten letras y espacios';
    }
    
    return null;
  }

  getEmailErrors(): string | null {
    const control = this.editForm.get('email');
    
    if (!control || (!control.dirty && !control.touched)) {
      return null;
    }
    
    if (control.hasError('required')) {
      return 'El email es obligatorio';
    }
    
    if (control.hasError('email')) {
      return 'Ingresa un email válido';
    }
    
    if (control.hasError('emailInUse')) {
      return 'Este email ya está en uso';
    }
    
    return null;
  }

  private hasValidChanges(): boolean {
    return this.hasProfileChanges() && 
           this.isProfileDataValid() && 
           this.editForm.valid;
  }

  onKeyPress(event: KeyboardEvent, field: 'first_name' | 'last_name') {
    const inputElement = event.target as HTMLInputElement;
    
    // Permitir teclas de control
    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab') {
      return;
    }
    
    // Prevenir espacio al principio
    if (event.key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
      return;
    }
    
    // Validar caracteres permitidos
    const pattern = /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/;
    const inputChar = String.fromCharCode(event.charCode);
    
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}