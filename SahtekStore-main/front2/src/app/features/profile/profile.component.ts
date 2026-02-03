import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    passwordForm: FormGroup;
    currentUser: User | null = null;
    activeTab: 'general' | 'security' = 'general';
    loading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private notificationService: NotificationService
    ) {
        this.profileForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]]
        });

        this.passwordForm = this.fb.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            if (user) {
                this.profileForm.patchValue({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                });
            }
        });

        // Refresh user data from server to be sure
        if (this.currentUser?.id) {
            // We could fetch fresh data here if needed
        }
    }

    setTab(tab: 'general' | 'security') {
        this.activeTab = tab;
    }

    updateProfile() {
        if (this.profileForm.invalid || !this.currentUser?.id) return;

        this.loading = true;
        this.authService.updateUser(this.currentUser.id, this.profileForm.value).subscribe({
            next: (user) => {
                this.loading = false;
                this.notificationService.success('Profil mis à jour avec succès');
            },
            error: (err) => {
                this.loading = false;
                this.notificationService.error('Erreur lors de la mise à jour du profil');
                console.error(err);
            }
        });
    }

    changePassword() {
        if (this.passwordForm.invalid || !this.currentUser?.id) return;

        const { oldPassword, newPassword, confirmPassword } = this.passwordForm.value;

        if (newPassword !== confirmPassword) {
            this.notificationService.error('Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        this.loading = true;
        this.authService.changePassword(this.currentUser.id, { oldPassword, newPassword }).subscribe({
            next: () => {
                this.loading = false;
                this.notificationService.success('Mot de passe changé avec succès');
                this.passwordForm.reset();
            },
            error: (err) => {
                this.loading = false;
                if (err.error?.message) {
                    this.notificationService.error(err.error.message);
                } else {
                    this.notificationService.error("Ancien mot de passe incorrect ou erreur serveur");
                }
                console.error(err);
            }
        });
    }
}
