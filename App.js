import "./src/firebaseConfig";

import {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
} from "react-native";

import {
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "./src/firebaseConfig";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  NavigationContainer,
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

const Stack =
  createNativeStackNavigator();

const Tab =
  createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Hjem"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Varsler"
        component={NotificationsScreen}
      />

      <Tab.Screen
        name="Mine"
        component={MyTasksScreen}
      />

      <Tab.Screen
        name="Kart"
        component={MapScreen}
      />

      <Tab.Screen
        name="Meldinger"
        component={MessagesScreen}
      />

      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
      />

      <Tab.Screen
        name="Opprett"
        component={CreateTaskScreen}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

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

  // 🔥 LOADING
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
        <Text
          style={{
            fontSize: 20,

            fontWeight:
              "bold",

            color:
              "#111827",
          }}
        >
          Laster...
        </Text>
      </View>
    );
  }

  return (
    <NotificationProvider>
      <TaskProvider>
        <NavigationContainer>
          <Stack.Navigator>
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