/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

const messagingInstance = getMessaging();

// Background message handler
setBackgroundMessageHandler(messagingInstance, async remoteMessage => {
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
