import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

  constructor(private fb: FormBuilder) {
    // Inicializa el formulario con validaciones
    this.registrationForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email], [this.emailAsyncValidator.bind(this)]],  // Validación asincrónica de email
      password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator()]],
    });
  }

  // Método para alternar la visibilidad de la contraseña
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  // Validador para la fuerza de la contraseña
  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null; // No hay error si el campo está vacío (esto lo controla `Validators.required`)
      }

      // Expresión regular para validar la contraseña
      const regex = /^(?=.*[a-zA-Z])(?=.*[0-9#?!&]).{10,}$/;

      return regex.test(value) ? null : { passwordStrength: true };
    };
  }

  // Validador asincrónico para verificar si el correo ya existe
  emailAsyncValidator(control: AbstractControl) {
    return new Promise<ValidationErrors | null>((resolve) => {
      const email = control.value;

      if (email) {
        // Simula la llamada al servidor
        const existingEmails = ['test@example.com', 'user@domain.com']; // Correos simulados
        const emailExists = existingEmails.includes(email);

        if (emailExists) {
          resolve({ emailExists: true });
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  }

  // Método para enviar el formulario
  onSubmit() {
    if (this.registrationForm.valid) {
      console.log('Form Data:', this.registrationForm.value);
    } else {
      console.log('Form is invalid');
    }
  }
}