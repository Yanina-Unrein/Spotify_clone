import { User } from '@/app/models/UserModel';
import { AuthService } from '@/app/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent {
  loginForm: FormGroup;
  errorMessage: string = ''; // Para mensajes de error
  showModal: boolean = false;
  validUser: User | null = null;
  

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!control && control.invalid && control.touched;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      console.log('Formulario válido, enviando credenciales:', credentials);

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          this.validUser = response.user;
          this.showModal = true;
          console.log('Modal mostrado:', this.showModal);

          setTimeout(() => {
            console.log('Temporizador activado');
            this.showModal = false;
            this.router.navigate(['/']);
          }, 3000);
        },
        error: (error) => {
          console.error('Error completo del login:', error);
          console.error('Estado del error:', error.status);
          console.error('Mensaje del error:', error.message);
          
          if (error.status === 401) {
            this.errorMessage = 'Credenciales incorrectas';
          } else {
            this.errorMessage = 'Error en el servidor. Por favor, intenta más tarde.';
          }
        }
      });
    } else {
      console.log('Formulario inválido');
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      this.loginForm.markAllAsTouched();
    }
  }
}
