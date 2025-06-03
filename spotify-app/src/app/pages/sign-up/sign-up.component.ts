import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiError, RegisterData } from '@/app/models/Register';
import { AuthService } from '@/app/services/auth/auth.service';
import { User } from '@/app/models/UserModel';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, switchMap, tap } from 'rxjs';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  registrationForm: FormGroup;
  emailExists: boolean = false;
  passwordVisible: boolean = false;
  
  // Estados para el modal
  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  isSuccess: boolean = false;

  constructor(
    private fb: FormBuilder,
    @Inject(AuthService) private authService: AuthService, 
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2), this.lettersOnlyValidator()]],
      last_name: ['', [Validators.required, Validators.minLength(2), this.lettersOnlyValidator()]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', 
        [Validators.required, Validators.email], 
        [this.emailAsyncValidator()]
      ],
      password: ['', [Validators.required, this.passwordValidator()]],
    });
  }

  // Método para alternar la visibilidad de la contraseña
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  lettersOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null; 
      
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      
      return regex.test(value) ? null : { lettersOnly: true };
    };
  }

  // Validador para la fuerza de la contraseña
  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const regex = /^(?=.*[a-zA-Z])(?=.*[0-9#?!&]).{10,}$/;

      return regex.test(value) ? null : { passwordStrength: true };
    };
  }

  // Validador asincrónico para verificar si el correo ya existe
   emailAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(), 
        tap(() => console.log('Debounce completado, enviando petición...')),
        switchMap((email: string) => 
          this.authService.checkEmailExists(email).pipe(
            map((response: { exists: boolean }) => {
              return response.exists ? { emailExists: true } as ValidationErrors : null;
            }),
            catchError((error) => {
              console.error('Error en validador:', error);
              return of(null as ValidationErrors | null);
            })
          )
        )
      );
    };
  }

  // Método para enviar el formulario
 onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.showErrorModal('Por favor completa todos los campos correctamente');
      return;
    }

    const formData: RegisterData = this.registrationForm.value;
    console.log('Datos enviados al servidor:', JSON.stringify(formData, null, 2));

    this.authService.register(formData).subscribe({
      next: (response) => {
        this.showSuccessModal(response.user);
        setTimeout(() => this.router.navigate(['/']), 3000);
      },
      error: (error: ApiError) => {
        console.error('Respuesta completa del error:', error);
        this.processRegistrationError(error);
      }
    });
  }

  private processRegistrationError(error: ApiError): void {
    console.log('Error del servidor:', error.rawError?.error || error);
  
    // Limpiar errores previos
    Object.keys(this.registrationForm.controls).forEach(key => {
      this.registrationForm.get(key)?.setErrors(null);
    });

    // Manejar error de email existente
    const errorMessage = error.rawError?.error || error.message || '';
    if (errorMessage.includes('ya está en uso')) {
      this.registrationForm.get('email')?.setErrors({ emailExists: true });
      return;
    }

    // Manejar otros errores
    if (error.fieldErrors) {
      error.fieldErrors.forEach(fieldError => {
        const control = this.registrationForm.get(fieldError.field);
        if (control) {
          control.setErrors({ serverError: fieldError.message });
        }
      });
    }
    
    this.showErrorModal(error.message || 'Error en el registro');
  }

  private showSuccessModal(user: User): void {
    this.showModal = true;
    this.isSuccess = true;
    this.modalTitle = '¡Registro exitoso!';
    this.modalMessage = `Bienvenido ${user.first_name} ${user.last_name}`;
  }

  private showErrorModal(message: string): void {
    this.showModal = true;
    this.isSuccess = false;
    this.modalTitle = 'Error en el registro';
    this.modalMessage = message;
  }

  closeModal(): void {
    this.showModal = false;
    if (this.isSuccess) {
      this.router.navigate(['/home']);
    }
  }
}