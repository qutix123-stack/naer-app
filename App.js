import TasksScreen from "./src/screens/TasksScreen";

import {
  useEffect,
  useState,
  useRef,
} from "react";

import * as SplashScreen
from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

import BottomTabs from "./src/navigation/BottomTabs";

import {
  View,
  Text,
  Platform,
  Animated,
} from "react-native";

import { Image }
from "expo-image";

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

// import * as Notifications from "expo-notifications";

// import registerForPushNotificationsAsync from "./src/registerForPushNotifications";

const Stack =
  createNativeStackNavigator();

const Tab =
  createBottomTabNavigator();

// THEME
const MyTheme = {
  ...DefaultTheme,

  colors: {
    ...DefaultTheme.colors,

    background:
      "#F4F6F8",
  },
};

// FOREGROUND NOTIFICATIONS
/*Notifications.setNotificationHandler(
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
); */

// TABS
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
              ? 28
              : 18,

          left: 18,

          right: 18,

          elevation: 0,

          backgroundColor:
            "white",

          borderRadius: 28,

          height: 78,

          shadowColor:
            "#000",

          shadowOpacity: 0.08,

          shadowRadius: 16,

          shadowOffset: {
            width: 0,
            height: 10,
          },

          borderTopWidth: 0,
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
            "Map"
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
              focused
                ? "add-circle"
                : "add-circle-outline";

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

          return (
            <View
              style={{
                justifyContent:
                  "center",

                alignItems:
                  "center",
              }}
            >

              <View
                style={{
                   transform: [
                {
                  scale:
                    focused
                    ? 1.15
                    : 1,
                  },
            ],
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
        name="Map"
        component={MapScreen}
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

  const [loading, setLoading] =
    useState(true);

  const notificationListener =
    useRef();

  const responseListener =
    useRef();

  const [appReady, setAppReady] =
  useState(false);

  useEffect(() => {

  const prepare =
    async () => {

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1800
          )
      );

      setAppReady(true);

      await SplashScreen.hideAsync();
    };

  prepare();

}, []);

  // PUSH NOTIFICATIONS
  /*useEffect(() => {
    registerForPushNotificationsAsync()
      .then(
        async (
          token
        ) => {
          console.log(
            "PUSH TOKEN:",
            token
          );

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
                "TOKEN ERROR:",
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
            "NOTIFICATION:",
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
            "RESPONSE:",
            response
          );
        }
      );

    return () => {
  notificationListener.current?.remove();
  responseListener.current?.remove();
};
  }, []); */

  // AUTH
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

  // LOADING SCREEN
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
          <Image
          source={require("./assets/logo.png")}

          style={{
            width: 140,
            height: 140,
            contentFit: "contain",
          }}
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

                tabBarStyle: {
                position: "absolute",

                height: 86,

                borderTopWidth: 0,

                backgroundColor:
                "rgba(255,255,255,0.92)",

                shadowColor:
                "#000",

                shadowOpacity: 0.08,

                shadowRadius: 12,

                elevation: 8,
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
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="Tasks"
              component={
                TasksScreen}
                        
              options={{
              headerShown: false,
              }}
            />

            <Stack.Screen
              name="CreateTask"
              component={
                CreateTaskScreen}
              options={{
              headerShown: false,
              }}
            />

          </Stack.Navigator>
        </NavigationContainer>
      </TaskProvider>
    </NotificationProvider>
  );
}