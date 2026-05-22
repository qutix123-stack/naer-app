export default async function sendPushNotification(
  expoPushToken,
  title,
  body
) {
  try {
    const message = {
      to: expoPushToken,

      sound: "default",

      title,

      body,

      data: {
        someData:
          "goes here",
      },
    };

    await fetch(
      "https://exp.host/--/api/v2/push/send",

      {
        method: "POST",

        headers: {
          Accept:
            "application/json",

          "Accept-encoding":
            "gzip, deflate",

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            message
          ),
      }
    );
  } catch (e) {
    console.log(e);
  }
}