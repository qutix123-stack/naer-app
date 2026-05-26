import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
} from "./src/firebaseConfig";

import {
  View,
  Platform,
} from "react-native";

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

          bottom:
            Platform.OS ===
            "ios"
              ? 28
              : 18,

          left: 18,

          right: 18,

          height: 78,

          borderRadius: 28,

          borderTopWidth: 0,

          backgroundColor:
            "#FFFFFF",
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
        component={
          HomeScreen
        }
      />

      <Tab.Screen
        name="Map"
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

  return (

    <NotificationProvider>

      <TaskProvider>

        <NavigationContainer>

          <Stack.Navigator
            screenOptions={{

              headerShadowVisible:
                false,

              headerStyle: {
                backgroundColor:
                  "#FFFFFF",
              },

              headerTitleStyle: {
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
                  headerShown:
                    false,
                }}
              />

            ) : (

              <Stack.Screen
                name="Login"

                component={
                  LoginScreen
                }

                options={{
                  headerShown:
                    false,
                }}
              />
            )}

            <Stack.Screen
              name="Tasks"

              component={
                TasksScreen
              }

              options={{
                headerShown:
                  false,
              }}
            />

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
              name="CreateTask"

              component={
                CreateTaskScreen
              }

              options={{
                headerShown:
                  false,
              }}
            />

            <Stack.Screen
              name="Chat"

              component={
                ChatScreen
              }

              options={{
                headerShown:
                  false,
              }}
            />

          </Stack.Navigator>

        </NavigationContainer>

      </TaskProvider>

    </NotificationProvider>
  );
}