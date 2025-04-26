import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.nonNullable.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });

    this.registerForm.setValidators(this.checkPasswords);
  }

  ngOnInit(): void {
    // Check if user is already authenticated and redirect
    this.authService.checkAuthAndRedirect();
  }

  private readonly checkPasswords = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notSame: true };
  };

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { username, password } = this.registerForm.value;

      this.authService.register({ username, password }).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response?.token) {
            this.snackBar.open('Registration successful!', 'Close', {
              duration: 3000,
            });
            this.router.navigate(['/contacts']);
          } else {
            this.snackBar.open(
              'Registration failed: No token received',
              'Close',
              {
                duration: 3000,
              }
            );
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Registration error:', error);
          let errorMessage = 'Registration failed';

          if (error.error) {
            if (error.error.message) {
              errorMessage = error.error.message;
            } else if (typeof error.error === 'string') {
              errorMessage = error.error;
            }
          }

          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }
}
