package com.lms.digital.service;

import com.lms.digital.entity.Notification;
import java.util.List;

public interface NotificationService {
    List<Notification> getNotificationsForUser(Long userId);
    void sendNotification(Long userId, String message, String type);
    void markAsRead(Long notificationId);
}
