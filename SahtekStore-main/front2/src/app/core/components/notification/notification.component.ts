import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, AppNotification } from '../../services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {
  constructor(private notificationService: NotificationService) { }

  get notifications$(): Observable<AppNotification[]> {
    return this.notificationService.notifications$;
  }

  // No close method needed if auto-remove is handled by service, 
  // but we could add manual close if we want.
}
