import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      secretPin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6), Validators.pattern('^[0-9]*$')]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.notificationService.success('Compte créé avec succès ! Veuillez vous connecter.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          if (err.status === 0) {
            this.errorMessage = 'Cannot connect to backend. Check if port 9002 is running.';
          } else {
            this.errorMessage = `Échec de l'inscription.`;
          }
          this.notificationService.error(this.errorMessage);
        }
      });
    }
  }
}
