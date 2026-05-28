import {
  useEffect,
  useState,
} from "react";

import {
  View,
  Platform,
} from "react-native";

import * as Notifications from "expo-notifications";

import * as Device from "expo-device";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
} from "./src/firebaseConfig";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

// CONTEXT

import {
  TaskProvider,
} from "./src/context/TaskContext";

import {
  NotificationProvider,
} from "./src/context/NotificationContext";

// SCREENS

import LoginScreen from "./src/screens/LoginScreen";

import HomeScreen from "./src/screens/HomeScreen";

import TasksScreen from "./src/screens/TasksScreen";

import TaskDetailScreen from "./src/screens/TaskDetailScreen";

import CreateTaskScreen from "./src/screens/CreateTaskScreen";

import MessagesScreen from "./src/screens/MessagesScreen";

import ChatScreen from "./src/screens/ChatScreen";

import ProfileScreen from "./src/screens/ProfileScreen";

import MapScreen from "./src/screens/MapScreen";

import ReviewScreen from "./src/screens/ReviewScreen";

// PUSH NOTIFICATION HANDLER

Notifications.setNotificationHandler({

  handleNotification:
    async () => ({

      shouldShowAlert:
        true,

      shouldPlaySound:
        true,

      shouldSetBadge:
        true,
    }),
});

const Stack =
  createNativeStackNavigator();

const Tab =
  createBottomTabNavigator();

// TABS

function Tabs() {

  return (

    <Tab.Navigator
      screenOptions={({
        route,
      }) => ({

        headerShown:
          false,

        tabBarShowLabel:
          false,

        tabBarHideOnKeyboard:
          true,

        tabBarStyle: {

          position:
            "absolute",

          left: 20,

          right: 20,

          bottom:
            Platform.OS ===
            "ios"
              ? 10
              : 8,

          height: 74,

          borderRadius: 28,

          borderTopWidth: 0,

          backgroundColor:
            "#FFFFFF",

          shadowColor:
            "#000",

          shadowOpacity: 0.08,

          shadowRadius: 14,

          elevation: 8,
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
            "Opprett"
          ) {

            iconName =
              "add";

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
            "Profil"
          ) {

            iconName =
              focused
                ? "person"
                : "person-outline";
          }

          // CREATE BUTTON

          if (
            route.name ===
            "Opprett"
          ) {

            return (

              <View
                style={{

                  width: 58,

                  height: 58,

                  borderRadius: 20,

                  backgroundColor:
                    "#2563EB",

                  justifyContent:
                    "center",

                  alignItems:
                    "center",

                  marginBottom: 22,

                  shadowColor:
                    "#2563EB",

                  shadowOpacity: 0.25,

                  shadowRadius: 10,

                  elevation: 8,
                }}
              >

                <Ionicons
                  name="add"

                  size={30}

                  color="#FFFFFF"
                />

              </View>
            );
          }

          return (

            <View
              style={{
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
                    ? 28
                    : 24
                }

                color={
                  focused
                    ? "#111827"
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
        component={
          HomeScreen
        }
      />

      <Tab.Screen
        name="Kart"
        component={
          MapScreen
        }
      />

      <Tab.Screen
        name="Opprett"
        component={
          CreateTaskScreen
        }
      />

      <Tab.Screen
        name="Meldinger"
        component={
          MessagesScreen
        }
      />

      <Tab.Screen
        name="Profil"
        component={
          ProfileScreen
        }
      />

    </Tab.Navigator>
  );
}

export default function App() {

  const [user, setUser] =
    useState(null);

  // AUTH

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,

        (user) => {

          setUser(user);
        }
      );

    return unsubscribe;

  }, []);

  // PUSH NOTIFICATIONS

  useEffect(() => {

    registerForPushNotifications();

  }, []);

  const registerForPushNotifications =
    async () => {

      try {

        if (
          Device.isDevice
        ) {

          const {
            status:
              existingStatus,
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
              "Push notifications må tillates 😄"
            );

            return;
          }

          const token =
            await Notifications.getExpoPushTokenAsync();

          console.log(
            "EXPO PUSH TOKEN:",
            token.data
          );
        }

        // ANDROID CHANNEL

        if (
          Platform.OS ===
          "android"
        ) {

          await Notifications.setNotificationChannelAsync(
            "default",

            {
              name:
                "default",

              importance:
                Notifications.AndroidImportance.MAX,

              vibrationPattern:
                [0, 250, 250, 250],

              lightColor:
                "#2563EB",
            }
          );
        }

      } catch (e) {

        console.log(
          "PUSH ERROR:",
          e
        );
      }
    };

  return (

    <NotificationProvider>

      <TaskProvider>

        <NavigationContainer>

          <Stack.Navigator
            screenOptions={{

              headerShown:
                false,

              animation:
                "slide_from_right",
            }}
          >

            {user ? (

              <Stack.Screen
                name="Tabs"

                component={
                  Tabs
                }
              />

            ) : (

              <Stack.Screen
                name="Login"

                component={
                  LoginScreen
                }
              />
            )}

            <Stack.Screen
              name="Tasks"

              component={
                TasksScreen
              }
            />

            <Stack.Screen
              name="TaskDetail"

              component={
                TaskDetailScreen
              }
            />

            <Stack.Screen
              name="CreateTask"

              component={
                CreateTaskScreen
              }
            />

            <Stack.Screen
              name="Chat"

              component={
                ChatScreen
              }
            />

            <Stack.Screen
              name="Review"

              component={
                ReviewScreen
              }
            />

          </Stack.Navigator>

        </NavigationContainer>

      </TaskProvider>

    </NotificationProvider>
  );
}