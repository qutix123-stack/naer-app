import "./src/firebaseConfig";

import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  View,
  Text,
  Platform,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "./src/firebaseConfig";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  NavigationContainer,
  DefaultTheme,
} from "@react-navigation/native";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import {
  TaskProvider,
} from "./src/context/TaskContext";

import {
  NotificationProvider,
} from "./src/context/NotificationContext";

import NotificationsScreen from "./src/screens/NotificationsScreen";
import MyTasksScreen from "./src/screens/MyTasksScreen";
import HelperScreen from "./src/screens/HelperScreen";
import HomeScreen from "./src/screens/HomeScreen";
import MapScreen from "./src/screens/MapScreen";
import MessagesScreen from "./src/screens/MessagesScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import TaskDetailScreen from "./src/screens/TaskDetailScreen";
import CreateTaskScreen from "./src/screens/CreateTaskScreen";
import ChatScreen from "./src/screens/ChatScreen";
import LoginScreen from "./src/screens/LoginScreen";

import * as Notifications from "expo-notifications";

import registerForPushNotificationsAsync from "./src/registerForPushNotifications";

const Stack =
  createNativeStackNavigator();

const Tab =
  createBottomTabNavigator();

// 🔥 CUSTOM NAV THEME
const MyTheme = {
  ...DefaultTheme,

  colors: {
    ...DefaultTheme.colors,

    background:
      "#F4F6F8",
  },
};

// 🔥 FOREGROUND NOTIFICATIONS
Notifications.setNotificationHandler(
  {
    handleNotification:
      async () => ({
        shouldShowAlert:
          true,

        shouldPlaySound:
          true,

        shouldSetBadge:
          false,
      }),
  }
);

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }) => ({
        headerShown: false,

        tabBarShowLabel:
          false,

        tabBarHideOnKeyboard:
          true,

        tabBarStyle: {
          position:
            "absolute",

          bottom:
            Platform.OS ===
            "ios"
              ? 30
              : 20,

          left: 20,

          right: 20,

          elevation: 0,

          backgroundColor:
            "white",

          borderRadius: 30,

          height: 82,

          shadowColor:
            "#000",

          shadowOpacity: 0.1,

          shadowRadius: 16,

          shadowOffset: {
            width: 0,

            height: 10,
          },

          borderTopWidth: 0,

          paddingBottom:
            Platform.OS ===
            "ios"
              ? 10
              : 0,
        },

        tabBarIcon: ({
          focused,
        }) => {
          let iconName;

          if (
            route.name ===
            "Hjem"
          ) {
            iconName =
              focused
                ? "home"
                : "home-outline";

          } else if (
            route.name ===
            "Kart"
          ) {
            iconName =
              focused
                ? "map"
                : "map-outline";

          } else if (
            route.name ===
            "Meldinger"
          ) {
            iconName =
              focused
                ? "chatbubble"
                : "chatbubble-outline";

          } else if (
            route.name ===
            "Varsler"
          ) {
            iconName =
              focused
                ? "notifications"
                : "notifications-outline";

          } else if (
            route.name ===
            "Profil"
          ) {
            iconName =
              focused
                ? "person"
                : "person-outline";

          } else if (
            route.name ===
            "Mine"
          ) {
            iconName =
              focused
                ? "briefcase"
                : "briefcase-outline";

          } else if (
            route.name ===
            "Opprett"
          ) {
            iconName =
              focused
                ? "add-circle"
                : "add-circle-outline";
          }

          return (
            <View
              style={{
                backgroundColor:
                  focused
                    ? "#DBEAFE"
                    : "transparent",

                width: focused
                  ? 54
                  : 42,

                height: focused
                  ? 54
                  : 42,

                borderRadius: 27,

                justifyContent:
                  "center",

                alignItems:
                  "center",
              }}
            >
              <Ionicons
                name={
                  iconName
                }
                size={
                  focused
                    ? 30
                    : 26
                }
                color={
                  focused
                    ? "#2563EB"
                    : "#9CA3AF"
                }
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Hjem"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Kart"
        component={MapScreen}
      />

      <Tab.Screen
        name="Opprett"
        component={CreateTaskScreen}
      />

      <Tab.Screen
        name="Meldinger"
        component={MessagesScreen}
      />

      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const notificationListener =
    useRef();

  const responseListener =
    useRef();

  // 🔥 PUSH NOTIFICATIONS
  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(
        async (
          token
        ) => {
          if (
            token &&
            auth
              .currentUser
          ) {
            try {
              await updateDoc(
                doc(
                  db,
                  "users",
                  auth
                    .currentUser
                    .uid
                ),

                {
                  pushToken:
                    token,
                }
              );
            } catch (e) {
              console.log(
                e
              );
            }
          }
        }
      );

    notificationListener.current =
      Notifications.addNotificationReceivedListener(
        (
          notification
        ) => {
          console.log(
            notification
          );
        }
      );

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        (
          response
        ) => {
          console.log(
            response
          );
        }
      );

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );

      Notifications.removeNotificationSubscription(
        responseListener.current
      );
    };
  }, []);

  // 🔥 AUTH
  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (
          currentUser
        ) => {
          setUser(
            currentUser
          );

          setLoading(
            false
          );
        }
      );

    return unsubscribe;
  }, []);

  // 🔥 PREMIUM LOADING SCREEN
  if (loading) {
    return (
      <View
        style={{
          flex: 1,

          justifyContent:
            "center",

          alignItems:
            "center",

          backgroundColor:
            "#F4F6F8",
        }}
      >
        <View
          style={{
            width: 120,

            height: 120,

            borderRadius: 60,

            backgroundColor:
              "#DBEAFE",

            justifyContent:
              "center",

            alignItems:
              "center",

            marginBottom: 30,
          }}
        >
          <Ionicons
            name="flash"
            size={52}
            color="#2563EB"
          />
        </View>

        <Text
          style={{
            fontSize: 34,

            fontWeight:
              "bold",

            color:
              "#111827",

            marginBottom: 10,
          }}
        >
          Nær
        </Text>

        <Text
          style={{
            fontSize: 16,

            color:
              "#6B7280",
          }}
        >
          Laster app...
        </Text>
      </View>
    );
  }

  return (
    <NotificationProvider>
      <TaskProvider>
        <NavigationContainer
          theme={
            MyTheme
          }
        >
          <Stack.Navigator
            screenOptions={{
              animation:
                "slide_from_right",

              headerShadowVisible: false,

              headerStyle: {
                backgroundColor:
                  "white",
              },

              headerTitleStyle:
                {
                  fontWeight:
                    "bold",
                },
            }}
          >
            {user ? (
              <Stack.Screen
                name="Tabs"
                component={
                  Tabs
                }
                options={{
                  headerShown: false,
                }}
              />
            ) : (
              <Stack.Screen
                name="Login"
                component={
                  LoginScreen
                }
                options={{
                  headerShown: false,
                }}
              />
            )}

            <Stack.Screen
              name="TaskDetail"
              component={
                TaskDetailScreen
              }
              options={{
                title:
                  "Oppdrag",
              }}
            />

            <Stack.Screen
              name="Chat"
              component={
                ChatScreen
              }
              options={{
                title:
                  "Chat",
              }}
            />

            <Stack.Screen
              name="Help"
              component={
                CreateTaskScreen
              }
              options={{
                title:
                  "Opprett oppdrag",
              }}
            />

            <Stack.Screen
              name="Helper"
              component={
                HelperScreen
              }
              options={{
                title:
                  "Hjelper",
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </TaskProvider>
    </NotificationProvider>
  );
}