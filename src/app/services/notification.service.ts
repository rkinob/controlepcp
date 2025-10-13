import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification } from '../model/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private notificationId = 0;

  constructor() {}

  /**
   * Adicionar uma nova notificação
   */
  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${++this.notificationId}`,
      timestamp: new Date()
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);

    // Auto-remover após duração especificada
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, newNotification.duration);
    }
  }

  /**
   * Remover uma notificação
   */
  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(currentNotifications.filter(n => n.id !== id));
  }

  /**
   * Limpar todas as notificações
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Métodos de conveniência para diferentes tipos de notificação
   */
  success(title: string, message: string, duration?: number): void {
    this.addNotification({
      type: 'success',
      title,
      message,
      duration: duration || 5000
    });
  }

  error(title: string, message: string, duration?: number): void {
    this.addNotification({
      type: 'error',
      title,
      message,
      duration: duration || 8000
    });
  }

  warning(title: string, message: string, duration?: number): void {
    this.addNotification({
      type: 'warning',
      title,
      message,
      duration: duration || 6000
    });
  }

  info(title: string, message: string, duration?: number): void {
    this.addNotification({
      type: 'info',
      title,
      message,
      duration: duration || 5000
    });
  }
}
