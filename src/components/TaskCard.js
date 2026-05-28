import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

export default function TaskCard({
  task,
  distance,
  timeAgo,
  onPress,
}) {

  const getCategoryData =
    () => {

      switch (
        task?.category
      ) {

        case "Rengjøring":

          return {
            icon:
              "sparkles",

            color:
              "#8B5CF6",
          };

        case "Transport":

          return {
            icon:
              "car",

            color:
              "#F97316",
          };

        case "Levering":

          return {
            icon:
              "cube",

            color:
              "#3B82F6",
          };

        case "Dyrepass":

          return {
            icon:
              "paw",

            color:
              "#EAB308",
          };

        case "Flytting":

          return {
            icon:
              "home",

            color:
              "#22C55E",
          };

        default:

          return {
            icon:
              "apps",

            color:
              "#9CA3AF",
          };
      }
    };

  const {
    icon,
    color,
  } = getCategoryData();

  return (

    <TouchableOpacity
      activeOpacity={0.92}

      onPress={onPress}

      style={
        styles.card
      }
    >

      {/* LEFT */}

      <View
        style={[
          styles.iconBox,

          {
            backgroundColor:
              `${color}20`,
          },
        ]}
      >

        <Ionicons
          name={icon}
          size={18}
          color={color}
        />

      </View>

      {/* CENTER */}

      <View
        style={
          styles.content
        }
      >

        <Text
          style={
            styles.title
          }

          numberOfLines={1}
        >
          {task?.title}
        </Text>

        <View
          style={
            styles.metaRow
          }
        >

          <Text
            style={
              styles.meta
            }
          >
            {distance} km unna
          </Text>

          <Text
            style={
              styles.dot
            }
          >
            •
          </Text>

          <Text
            style={
              styles.meta
            }
          >
            {timeAgo}
          </Text>

        </View>

      </View>

      {/* RIGHT */}

      <View
        style={
          styles.right
        }
      >

        <Text
          style={[
            styles.price,

            {
              color,
            },
          ]}
        >
          {task?.price || 0} kr
        </Text>

      </View>

    </TouchableOpacity>
  );
}

const styles =
  StyleSheet.create({

    card: {

      backgroundColor:
        "#FFFFFF",

      borderRadius: 20,

      paddingVertical: 14,

      paddingHorizontal: 14,

      marginBottom: 12,

      flexDirection:
        "row",

      alignItems:
        "center",

      shadowColor:
        "#000",

      shadowOpacity: 0.04,

      shadowRadius: 10,

      elevation: 2,
    },

    iconBox: {

      width: 42,

      height: 42,

      borderRadius: 14,

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight: 12,
    },

    content: {

      flex: 1,
    },

    title: {

      fontSize: 15,

      fontWeight: "700",

      color:
        "#0F172A",

      marginBottom: 4,
    },

    metaRow: {

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    meta: {

      fontSize: 13,

      color:
        "#6B7280",
    },

    dot: {

      marginHorizontal: 6,

      color:
        "#9CA3AF",

      fontSize: 12,
    },

    right: {

      marginLeft: 12,
    },

    price: {

      fontSize: 14,

      fontWeight: "700",
    },
  });