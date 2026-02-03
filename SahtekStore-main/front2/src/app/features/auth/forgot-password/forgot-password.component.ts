import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
    email: string = '';
    pin: string = '';
    newPassword: string = '';

    loading: boolean = false;
    submitted: boolean = false;
    errorMessage: string = '';

    constructor(private http: HttpClient) { }

    onSubmit() {
        if (!this.email || !this.pin || !this.newPassword) return;

        this.loading = true;
        this.errorMessage = '';

        const payload = {
            email: this.email,
            secretPin: this.pin,
            newPassword: this.newPassword
        };

        this.http.post('http://localhost:9002/sahtek_db/sahtek_db/api/users/reset-password-pin', payload)
            .subscribe({
                next: () => {
                    this.loading = false;
                    this.submitted = true;
                },
                error: (err) => {
                    this.loading = false;
                    if (err.status === 500 && err.error && err.error.message) {
                        this.errorMessage = err.error.message; // Affiche "Code PIN incorrect" venant du backend
                    } else {
                        this.errorMessage = "Échec de la réinitialisation. Vérifiez votre email et votre code PIN.";
                    }
                    console.error('Reset PIN error', err);
                }
            });
    }
}
