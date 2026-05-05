/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// Background message handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message received:', remoteMessage);
  
  // Log full background message payload
  console.log('Background message details:', {
    messageId: remoteMessage.messageId,
    from: remoteMessage.from,
    notification: remoteMessage.notification,
    data: remoteMessage.data,
    collapseKey: remoteMessage.collapseKey,
  });
});

AppRegistry.registerComponent(appName, () => App);
