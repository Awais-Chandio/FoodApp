import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

const messagingInstance = getMessaging();

class NotificationService {
  constructor() {
    this.fcmToken = null;
    this.unsubscribeOnMessage = null;
    this.unsubscribeOnNotificationOpened = null;
    this.unsubscribeOnTokenRefresh = null;
    this.onForegroundMessage = null;
    this.onNotificationOpen = null;
  }

  // Request notification permission for Android 13+
  async requestNotificationPermission() {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await requestPermission(messagingInstance);
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        console.log('iOS Permission status:', authStatus);
        return enabled;
      } else {
        // Android 13+ requires POST_NOTIFICATIONS permission
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          console.log('Android POST_NOTIFICATIONS permission:', granted);
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true; // Android < 13 doesn't need runtime permission
      }
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  // Get FCM token with permission handling
  async getFCMToken() {
    try {
      // Request permission first
      const hasPermission = await this.requestNotificationPermission();
      if (!hasPermission) {
        console.log('Notification permission denied');
        return null;
      }

      // Get FCM token
      const token = await getToken(messagingInstance);
      this.fcmToken = token;

      console.log('FCM Token:', token);
      console.log('Token stored in service:', this.fcmToken);

      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Listen for foreground messages
  setupForegroundMessageHandler() {
    this.unsubscribeOnMessage = onMessage(messagingInstance, async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);

      if (this.onForegroundMessage) {
        this.onForegroundMessage(remoteMessage);
        return;
      }

      // Show alert for foreground notifications
      Alert.alert(
        remoteMessage.notification?.title || 'New Notification',
        remoteMessage.notification?.body || 'You have a new message',
        [
          { text: 'OK' }
        ]
      );

      // Log full payload
      console.log('Full notification payload:', {
        messageId: remoteMessage.messageId,
        from: remoteMessage.from,
        notification: remoteMessage.notification,
        data: remoteMessage.data,
        collapseKey: remoteMessage.collapseKey,
      });
    });
  }

  // Handle notification when app is opened from killed state
  async getInitialNotification() {
    try {
      const initialNotification = await getInitialNotification(messagingInstance);

      if (initialNotification) {
        console.log('App opened from quit state via notification:', initialNotification);

        // Log which screen should open based on payload
        const screenToOpen = initialNotification.data?.screen || 'Home';
        console.log('Should open screen:', screenToOpen);

        if (this.onNotificationOpen) {
          this.onNotificationOpen(initialNotification, 'initial');
        }

        return initialNotification;
      }

      return null;
    } catch (error) {
      console.error('Error getting initial notification:', error);
      return null;
    }
  }

  // Handle notification when app is opened from background
  setupNotificationOpenedHandler() {
    this.unsubscribeOnNotificationOpened = onNotificationOpenedApp(
      messagingInstance,
      remoteMessage => {
        console.log('Notification opened from background:', remoteMessage);

        // Log which screen should open based on payload
        const screenToOpen = remoteMessage.data?.screen || 'Home';
        console.log('Should open screen:', screenToOpen);

        if (this.onNotificationOpen) {
          this.onNotificationOpen(remoteMessage, 'background');
        }

        console.log('Full notification data:', {
          messageId: remoteMessage.messageId,
          from: remoteMessage.from,
          notification: remoteMessage.notification,
          data: remoteMessage.data,
        });
      }
    );
  }

  // Initialize all notification services
  async initialize(handlers = {}) {
    try {
      console.log('Initializing Notification Service...');
      this.onForegroundMessage = handlers.onForegroundMessage || null;
      this.onNotificationOpen = handlers.onNotificationOpen || null;

      // Get FCM token
      await this.getFCMToken();

      // Setup foreground message handler
      this.setupForegroundMessageHandler();

      // Setup notification opened handler
      this.setupNotificationOpenedHandler();

      // Check for initial notification (app opened from killed state)
      await this.getInitialNotification();

      // Listen for token refresh
      this.unsubscribeOnTokenRefresh = onTokenRefresh(messagingInstance, token => {
        console.log('FCM Token refreshed:', token);
        this.fcmToken = token;
      });

      console.log('Notification Service initialized successfully');
    } catch (error) {
      console.error('Error initializing Notification Service:', error);
    }
  }

  // Cleanup listeners
  cleanup() {
    if (this.unsubscribeOnMessage) {
      this.unsubscribeOnMessage();
      this.unsubscribeOnMessage = null;
    }

    if (this.unsubscribeOnNotificationOpened) {
      this.unsubscribeOnNotificationOpened();
      this.unsubscribeOnNotificationOpened = null;
    }

    if (this.unsubscribeOnTokenRefresh) {
      this.unsubscribeOnTokenRefresh();
      this.unsubscribeOnTokenRefresh = null;
    }

    console.log('Notification Service cleaned up');
  }

  // Get current FCM token
  getCurrentToken() {
    return this.fcmToken;
  }
}

// Export singleton instance
export default new NotificationService();
