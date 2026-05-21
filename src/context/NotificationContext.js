import React, {
  createContext,
  useState,
} from "react";

import * as Notifications from "expo-notifications";

export const NotificationContext =
  createContext();

export function NotificationProvider({
  children,
}) {
  const [notifications,
    setNotifications] =
    useState([]);

  // 🔥 ADD NOTIFICATION
  const addNotification =
    async (
      notification
    ) => {

      // SAVE INSIDE APP
      setNotifications(
        (prev) => [
          {
            id:
              Date.now().toString(),

            createdAt:
              Date.now(),

            ...notification,
          },
          ...prev,
        ]
      );

      // 🔔 LOCAL PUSH
      await Notifications.scheduleNotificationAsync(
        {
          content: {
            title:
              notification.title,

            body:
              notification.message,

            sound: true,
          },

          trigger: null,
        }
      );
    };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}