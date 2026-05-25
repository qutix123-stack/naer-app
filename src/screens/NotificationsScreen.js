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
    useContext(
      NotificationContext
    );

  return (

    <ScrollView
      style={{
        flex: 1,
        backgroundColor:
          "#F4F6F8",
      }}

      contentContainerStyle={{
        padding: 20,
        paddingTop: 60,
        paddingBottom: 120,
      }}

      showsVerticalScrollIndicator={
        false
      }
    >

      {/* HEADER */}

      <Text
        style={{
          fontSize: 34,

          fontWeight:
            "bold",

          marginBottom: 30,

          color:
            "#111827",
        }}
      >
        Varsler
      </Text>

      {/* EMPTY */}

      {notifications.length === 0 ? (

        <View
          style={{
            marginTop: 80,

            alignItems:
              "center",
          }}
        >

          <Text
            style={{
              fontSize: 18,

              color:
                "#6B7280",
            }}
          >
            Ingen varsler enda 😄
          </Text>

        </View>

      ) : (

        notifications.map(
          (notification) => (

            <TouchableOpacity
              key={notification.id}

              activeOpacity={0.8}

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

                borderRadius: 22,

                marginBottom: 16,

                flexDirection:
                  "row",

                alignItems:
                  "flex-start",

                shadowColor:
                  "#000",

                shadowOpacity: 0.05,

                shadowRadius: 10,

                elevation: 3,
              }}
            >

              {/* UNREAD DOT */}

              <View
                style={{
                  width: 12,

                  height: 12,

                  borderRadius: 6,

                  backgroundColor:
                    "#2563EB",

                  marginRight: 14,

                  marginTop: 6,
                }}
              />

              {/* TEXT */}

              <View
                style={{
                  flex: 1,
                }}
              >

                <Text
                  style={{
                    fontSize: 18,

                    fontWeight:
                      "700",

                    color:
                      "#111827",
                  }}
                >
                  {notification.title}
                </Text>

                <Text
                  style={{
                    marginTop: 8,

                    fontSize: 16,

                    color:
                      "#6B7280",

                    lineHeight: 24,
                  }}
                >
                  {notification.message}
                </Text>

              </View>

            </TouchableOpacity>
          )
        )
      )}

    </ScrollView>
  );
}