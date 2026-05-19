import React, { useCallback, useEffect, useRef, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useCreateTables } from "./src/database/dbs";
import { AuthProvider } from "./src/screens/Auth/AuthContext";
import Toast from "react-native-toast-message";
import { ThemeProvider } from "./src/Context/ThemeProvider";
import notificationService from "./src/services/notificationService";
import NotificationModal from "./src/components/NotificationModal";
import { navigationRef } from "./src/navigation/rootNavigation";

const normalizeNotification = (remoteMessage) => {
  const data = remoteMessage?.data || {};
  const type = String(data.type || data.category || data.screen || "notification")
    .trim()
    .toLowerCase();

  return {
    raw: remoteMessage,
    data,
    type,
    title:
      remoteMessage?.notification?.title ||
      data.title ||
      data.name ||
      "FoodApp update",
    body:
      remoteMessage?.notification?.body ||
      data.body ||
      data.message ||
      "Open FoodApp to view this update.",
    eyebrow: data.eyebrow,
    actionLabel: data.actionLabel,
    meta: data.restaurantName || data.orderId || data.couponCode || data.meta,
  };
};

const resolveNotificationRoute = (notification) => {
  const data = notification?.data || {};
  const screen = String(data.screen || notification?.type || "")
    .trim()
    .toLowerCase();
  const type = String(data.type || notification?.type || "")
    .trim()
    .toLowerCase();

  if (
    screen === "trackorder" ||
    screen === "trackorderscreen" ||
    type === "order" ||
    type === "reminder" ||
    type === "order_reminder"
  ) {
    return {
      name: "TrackOrder",
      params: { notification: data },
    };
  }

  if (screen === "cart" || screen === "addtocartscreen") {
    return {
      name: "Tab",
      params: { screen: "AddToCartScreen", params: { notification: data } },
    };
  }

  if (screen === "search") {
    return {
      name: "Tab",
      params: { screen: "Search", params: { notification: data } },
    };
  }

  if (screen === "profile") {
    return {
      name: "Tab",
      params: { screen: "Profile", params: { notification: data } },
    };
  }

  if (screen === "menu" || screen === "menuscreen") {
    return {
      name: "Tab",
      params: {
        screen: "HomeStack",
        params: { screen: "MenuScreen", params: { notification: data } },
      },
    };
  }

  return {
    name: "Tab",
    params: {
      screen: "HomeStack",
      params: { screen: "HomeScreen", params: { notification: data } },
    },
  };
};

const AppContent = () => {
  useCreateTables();
  const pendingNotificationRef = useRef(null);
  const initialNotificationTimerRef = useRef(null);
  const [activeNotification, setActiveNotification] = useState(null);

  const navigateForNotification = useCallback((notification) => {
    if (!navigationRef.isReady()) {
      pendingNotificationRef.current = notification;
      return;
    }

    const route = resolveNotificationRoute(notification);
    navigationRef.navigate(route.name, route.params);
  }, []);

  const handleNotification = useCallback(
    (remoteMessage, source) => {
      const notification = normalizeNotification(remoteMessage);
      setActiveNotification(notification);

      if (source === "initial") {
        initialNotificationTimerRef.current = setTimeout(() => {
          navigateForNotification(notification);
        }, 2100);
        return;
      }

      if (source !== "foreground") {
        navigateForNotification(notification);
      }
    },
    [navigateForNotification]
  );

  const handlePrimaryNotificationPress = useCallback(() => {
    if (!activeNotification) {
      return;
    }

    navigateForNotification(activeNotification);
    setActiveNotification(null);
  }, [activeNotification, navigateForNotification]);

  useEffect(() => {
    notificationService.initialize({
      onForegroundMessage: (remoteMessage) =>
        handleNotification(remoteMessage, "foreground"),
      onNotificationOpen: (remoteMessage, source) =>
        handleNotification(remoteMessage, source || "opened"),
    });

    return () => {
      if (initialNotificationTimerRef.current) {
        clearTimeout(initialNotificationTimerRef.current);
      }
      notificationService.cleanup();
    };
  }, [handleNotification]);

  return (
    <AuthProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          if (pendingNotificationRef.current) {
            navigateForNotification(pendingNotificationRef.current);
            pendingNotificationRef.current = null;
          }
        }}
      >
        <AppNavigator />
        <Toast />
        <NotificationModal
          visible={!!activeNotification}
          notification={activeNotification}
          onClose={() => setActiveNotification(null)}
          onPrimaryPress={handlePrimaryNotificationPress}
        />
      </NavigationContainer>
    </AuthProvider>
  );
};

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
