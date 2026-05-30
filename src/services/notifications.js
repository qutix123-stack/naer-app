import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({

  handleNotification:
    async () => ({

      shouldShowBanner: true,

      shouldShowList: true,

      shouldPlaySound: true,

      shouldSetBadge: true,
    }),
});

export async function registerForPushNotifications() {

  const settings =
    await Notifications.getPermissionsAsync();

  let status =
    settings.status;

  if (
    status !== "granted"
  ) {

    const request =
      await Notifications.requestPermissionsAsync();

    status =
      request.status;
  }

  if (
    status !== "granted"
  ) {

    return null;
  }

  const token =
    await Notifications.getExpoPushTokenAsync();

  return token.data;
}