import React, {
  useContext,
} from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  TaskContext,
} from "../context/TaskContext";

import {
  auth,
} from "../firebaseConfig";

export default function MyTasksScreen() {

  const { tasks } =
    useContext(
      TaskContext
    );

  const myTasks =
    tasks.filter(
      (task) =>

        task.ownerId ===
        auth.currentUser?.uid
    );

  const helpingTasks =
    tasks.filter(
      (task) =>

        task.helperId ===
        auth.currentUser?.uid
    );

  const renderCard = (
    task,
    type
  ) => {

    const color =
      type === "my"
        ? "#2563EB"
        : "#10B981";

    const icon =
      type === "my"
        ? "briefcase-outline"
        : "heart-outline";

    return (

      <TouchableOpacity
        key={task.id}

        activeOpacity={0.9}

        style={
          styles.card
        }
      >

        <View
          style={[
            styles.iconBox,

            {
              backgroundColor:
                `${color}15`,
            },
          ]}
        >

          <Ionicons
            name={icon}

            size={32}

            color={color}
          />

        </View>

        <View
          style={{
            flex: 1,
          }}
        >

          <Text
            style={
              styles.cardTitle
            }
          >
            {task.title}
          </Text>

          <Text
            style={
              styles.cardDescription
            }

            numberOfLines={2}
          >
            {task.description ||
              "Ingen beskrivelse"}
          </Text>

          <View
            style={
              styles.bottomRow
            }
          >

            <View
              style={[
                styles.priceBadge,

                {
                  backgroundColor:
                    `${color}15`,
                },
              ]}
            >

              <Text
                style={[
                  styles.priceText,

                  {
                    color,
                  },
                ]}
              >
                {task.reward ||
                  task.price ||
                  "0"} kr
              </Text>

            </View>

            <Ionicons
              name="chevron-forward"

              size={22}

              color="#9CA3AF"
            />

          </View>

        </View>

      </TouchableOpacity>
    );
  };

  return (

    <ScrollView
      style={
        styles.container
      }

      contentContainerStyle={{
        paddingBottom: 140,
      }}

      showsVerticalScrollIndicator={
        false
      }
    >

      {/* HEADER */}

      <Text
        style={
          styles.title
        }
      >
        Mine oppdrag
      </Text>

      {/* MY TASKS */}

      <View
        style={
          styles.sectionHeader
        }
      >

        <Ionicons
          name="briefcase"

          size={22}

          color="#2563EB"
        />

        <Text
          style={
            styles.sectionTitle
          }
        >
          Publisert av meg
        </Text>

      </View>

      {myTasks.length ===
      0 ? (

        <View
          style={
            styles.emptyCard
          }
        >

          <Text
            style={
              styles.emptyText
            }
          >
            Ingen oppdrag enda 😄
          </Text>

        </View>

      ) : (

        myTasks.map(
          (task) =>

            renderCard(
              task,
              "my"
            )
        )
      )}

      {/* HELPING */}

      <View
        style={[
          styles.sectionHeader,

          {
            marginTop: 34,
          },
        ]}
      >

        <Ionicons
          name="heart"

          size={22}

          color="#10B981"
        />

        <Text
          style={
            styles.sectionTitle
          }
        >
          Jeg hjelper med
        </Text>

      </View>

      {helpingTasks.length ===
      0 ? (

        <View
          style={
            styles.emptyCard
          }
        >

          <Text
            style={
              styles.emptyText
            }
          >
            Ingen aktive hjelpinger 😄
          </Text>

        </View>

      ) : (

        helpingTasks.map(
          (task) =>

            renderCard(
              task,
              "help"
            )
        )
      )}

    </ScrollView>
  );
}

const styles =
  StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor:
        "#F4F7FB",

      paddingTop: 60,

      paddingHorizontal: 20,
    },

    title: {

      fontSize: 36,

      fontWeight: "800",

      color:
        "#111827",

      marginBottom: 34,
    },

    sectionHeader: {

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom: 18,
    },

    sectionTitle: {

      fontSize: 22,

      fontWeight: "700",

      color:
        "#111827",

      marginLeft: 10,
    },

    card: {

      backgroundColor:
        "#FFFFFF",

      borderRadius: 30,

      padding: 18,

      marginBottom: 18,

      flexDirection:
        "row",

      shadowColor:
        "#000",

      shadowOpacity: 0.06,

      shadowRadius: 14,

      elevation: 4,
    },

    iconBox: {

      width: 74,

      height: 74,

      borderRadius: 24,

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight: 16,
    },

    cardTitle: {

      fontSize: 20,

      fontWeight: "800",

      color:
        "#111827",

      marginBottom: 6,
    },

    cardDescription: {

      fontSize: 15,

      lineHeight: 22,

      color:
        "#6B7280",

      marginBottom: 14,
    },

    bottomRow: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    priceBadge: {

      paddingHorizontal: 16,

      paddingVertical: 10,

      borderRadius: 16,
    },

    priceText: {

      fontWeight:
        "800",

      fontSize: 16,
    },

    emptyCard: {

      backgroundColor:
        "#FFFFFF",

      borderRadius: 26,

      padding: 24,

      alignItems:
        "center",

      marginBottom: 10,
    },

    emptyText: {

      color:
        "#6B7280",

      fontSize: 16,

      fontWeight: "600",
    },
  });