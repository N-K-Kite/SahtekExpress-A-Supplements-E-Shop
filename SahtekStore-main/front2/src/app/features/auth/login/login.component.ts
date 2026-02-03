import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Utilizing email as username if needed, or ask user. Assuming email.
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          const user = response.user ? response.user : response;
          const role = user.role;

          this.notificationService.success(`Bienvenue, ${user.firstName || 'utilisateur'} !`);

          if (role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          if (err.status === 0) {
            this.errorMessage = 'Cannot connect to backend. Is Spring Boot running on port 9002?';
          } else if (err.status === 401) {
            this.errorMessage = 'Identifiants invalides.';
          } else {
            this.errorMessage = 'Échec de la connexion.';
          }
          this.notificationService.error(this.errorMessage);
        }
      });
    }
  }
}
