import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
    token: string = '';
    password = '';
    confirmPassword = '';
    loading = false;
    success = false;
    errorMessage = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient
    ) { }

    ngOnInit() {
        this.token = this.route.snapshot.queryParams['token'] || '';
        if (!this.token) {
            this.errorMessage = "Jeton de réinitialisation invalide ou manquant.";
        }
    }

    onSubmit() {
        if (this.password !== this.confirmPassword) {
            this.errorMessage = "Les mots de passe ne correspondent pas.";
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        this.http.post('http://localhost:9002/sahtek_db/sahtek_db/api/users/reset-password', {
            token: this.token,
            newPassword: this.password
        }).subscribe({
            next: () => {
                this.loading = false;
                this.success = true;
                setTimeout(() => this.router.navigate(['/login']), 3000);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = "Une erreur est survenue. Le lien a peut-être expiré.";
            }
        });
    }
}
