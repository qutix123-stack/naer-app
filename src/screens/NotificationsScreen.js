import React, {
  useContext,
} from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import {
  NotificationContext,
} from "../context/NotificationContext";

export default function NotificationsScreen({
  navigation,
}) {
  const { notifications } =
    useContext(NotificationContext);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#F4F6F8",
      }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: 60,
      }}
    >
      <Text
        style={{
          fontSize: 34,
          fontWeight: "bold",
          marginBottom: 30,
        }}
      >
        Varsler
      </Text>

      {notifications.length === 0 ? (
        <Text
          style={{
            fontSize: 18,
            color: "#6B7280",
          }}
        >
          Ingen varsler enda
        </Text>
      ) : (
        notifications.map(
          (notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => {
                if (
                  notification.task
                ) {
                  navigation.navigate(
                    "TaskDetail",
                    {
                      task:
                        notification.task,
                    }
                  );
                }
              }}
              style={{
                backgroundColor:
                  "white",

                padding: 20,

                borderRadius: 20,

                marginBottom: 15,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                {notification.title}
              </Text>

              <Text
                style={{
                  marginTop: 8,
                  fontSize: 16,
                  color: "#6B7280",
                }}
              >
                {notification.message}
              </Text>
            </TouchableOpacity>
          )
        )
      )}
    </ScrollView>
  );
}
