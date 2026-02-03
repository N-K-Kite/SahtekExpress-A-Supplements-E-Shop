import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppNotification {
    message: string;
    type: 'success' | 'error' | 'info';
    id: number;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
    public notifications$ = this.notificationsSubject.asObservable();
    private counter = 0;

    show(message: string, type: 'success' | 'error' | 'info' = 'info') {
        const id = this.counter++;
        const notification: AppNotification = { message, type, id };
        const current = this.notificationsSubject.value;
        this.notificationsSubject.next([...current, notification]);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            this.remove(id);
        }, 3000);
    }

    success(message: string) {
        this.show(message, 'success');
    }

    error(message: string) {
        this.show(message, 'error');
    }

    info(message: string) {
        this.show(message, 'info');
    }

    private remove(id: number) {
        const current = this.notificationsSubject.value;
        this.notificationsSubject.next(current.filter(n => n.id !== id));
    }
}
