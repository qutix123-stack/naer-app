import React from "react";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import {
  Ionicons,
} from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import TasksScreen from "../screens/TasksScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MapScreen from "../screens/MapScreen";
import ChatScreen from "../screens/ChatScreen";

const Tab =
  createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }) => ({
        headerShown: false,

        tabBarShowLabel: false,

        tabBarStyle: {
          height: 85,

          borderTopWidth: 0,

          backgroundColor:
            "white",

          position:
            "absolute",

          elevation: 10,

          shadowOpacity: 0.08,
        },

        tabBarIcon: ({
          focused,
          color,
          size,
        }) => {
          let iconName;

          if (
            route.name ===
            "Home"
          ) {
            iconName =
              focused
                ? "home"
                : "home-outline";
          }

          else if (
            route.name ===
            "Tasks"
          ) {
            iconName =
              focused
                ? "list"
                : "list-outline";
          }

          else if (
            route.name ===
            "Kart"
          ) {
            iconName =
              focused
                ? "map"
                : "map-outline";
          }

          else if (
            route.name ===
            "Chat"
          ) {
            iconName =
              focused
                ? "chatbubble"
                : "chatbubble-outline";
          }

          else if (
            route.name ===
            "Profil"
          ) {
            iconName =
              focused
                ? "person"
                : "person-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={26}
              color={
                focused
                  ? "#2563EB"
                  : "#9CA3AF"
              }
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
      />

      <Tab.Screen
        name="Kart"
        component={MapScreen}
      />

      <Tab.Screen
        name="Chat"
        component={ChatScreen}
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