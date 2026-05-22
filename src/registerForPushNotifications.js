import * as Device from "expo-device";

import * as Notifications from "expo-notifications";

import Constants from "expo-constants";

export default async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const {
      status: existingStatus,
    } =
      await Notifications.getPermissionsAsync();

    let finalStatus =
      existingStatus;

    if (
      existingStatus !==
      "granted"
    ) {
      const {
        status,
      } =
        await Notifications.requestPermissionsAsync();

      finalStatus =
        status;
    }

    if (
      finalStatus !==
      "granted"
    ) {
      alert(
        "No push token!"
      );

      return;
    }

    token =
      (
        await Notifications.getExpoPushTokenAsync(
          {
            projectId:
              Constants
                .expoConfig
                ?.extra
                ?.eas
                ?.projectId,
          }
        )
      ).data;

    console.log(
      "PUSH TOKEN:",
      token
    );
  }

  if (
    Platform.OS ===
    "android"
  ) {
    Notifications.setNotificationChannelAsync(
      "default",

      {
        name:
          "default",

        importance:
          Notifications.AndroidImportance.MAX,
      }
    );
  }

  return token;
}