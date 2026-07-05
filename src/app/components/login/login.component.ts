import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;

  hidePassword = true;

  hideConfirmPassword = true;

  loading = false;

  isSignUp = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {

    this.loginForm = this.fb.group({

      username: ['', [Validators.required, Validators.minLength(4)]],

      password: ['', [Validators.required, Validators.minLength(4)]],

      confirmPassword: ['']

    }, { validators: this.passwordMatchValidator.bind(this) });

  }

  passwordMatchValidator(g: FormGroup) {
    if (!this.isSignUp) {
      return null;
    }
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    this.loginForm.reset();
    if (this.isSignUp) {
      this.loginForm.get('confirmPassword')?.setValidators([Validators.required]);
    } else {
      this.loginForm.get('confirmPassword')?.clearValidators();
    }
    this.loginForm.get('confirmPassword')?.updateValueAndValidity();
  }

  onSubmit() {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      let errorMsg = 'Please check the form fields';
      if (this.isSignUp && this.loginForm.hasError('mismatch')) {
        errorMsg = 'Passwords do not match!';
      }
      this.snackBar.open(
        errorMsg,
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });

      return;
    }

    this.loading = true;

    if (this.isSignUp) {
      const { username, password } = this.loginForm.value;
      this.authService.register({ username, password }).subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response.success || response.status === 'success' || response.id) {
            this.snackBar.open(
              response.message || '✅ Sign up successful! Please log in.',
              'Close',
              {
                duration: 4000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            this.toggleMode(); // switch back to login
          } else {
            this.snackBar.open(
              response.message || 'Registration failed',
              'Close',
              {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
          }
        },
        error: (err) => {
          this.loading = false;
          // In case the backend doesn't support registration yet or returns 404, we provide a backup fallback warning or mock register
          console.warn('Register API failed. Fallback logic could be active.', err);
          
          // Let's support a graceful signup message if the backend returned error but user needs to proceed, or just display the exact server error.
          const errorText = err?.error?.message || 'Server Error or API Endpoint Not Found';
          this.snackBar.open(
            errorText,
            'Close',
            {
              duration: 3500,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
        }
      });
    } else {
      this.authService.login(this.loginForm.value).subscribe({

        next: (response: any) => {

          this.loading = false;

          if (response.success) {

            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', this.loginForm.value.username);

            this.snackBar.open(
              response.message || 'Login successful',
              'Close',
              {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });

            this.router.navigate(['/dashboard']);

          }
          else {

            this.snackBar.open(
              response.message || 'Invalid Credentials',
              'Close',
              {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });

          }

        },

        error: (err) => {

          this.loading = false;
          const errorText = err?.error?.message || 'Server Error. Make sure backend is running.';
          this.snackBar.open(
            errorText,
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });

        }

      });
    }

  }

}