import * as Location from "expo-location";

import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import { Ionicons } from "@expo/vector-icons";

import { db } from "../firebaseConfig";

import colors from "../theme/colors";
import AppCard from "../components/AppCard";

export default function TasksScreen({
  navigation,
}) {

  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    userLocation,
    setUserLocation,
  ] = useState(null);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("Alle");

  const categories = [
    "Alle",
    "Flytting",
    "IT",
    "Rengjøring",
    "Hund",
    "Hage",
  ];

  useEffect(() => {

    getUserLocation();

    const q = query(
      collection(db, "tasks"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe =
      onSnapshot(

        q,

        (snapshot) => {

          const taskList =
            [];

          snapshot.forEach(
            (doc) => {

              taskList.push({
                id:
                  doc.id,

                ...doc.data(),
              });
            }
          );

          setTasks(taskList);

          setLoading(false);
        },

        (error) => {

          console.log(
            "TASKS ERROR:",
            error
          );

          setLoading(false);
        }
      );

    return unsubscribe;

  }, []);

  // LOCATION

  const getUserLocation =
    async () => {

      try {

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (
          status !==
          "granted"
        ) {

          return;
        }

        const location =
          await Location.getCurrentPositionAsync(
            {}
          );

        setUserLocation({
          latitude:
            location.coords
              .latitude,

          longitude:
            location.coords
              .longitude,
        });

      } catch (e) {

        console.log(
          "LOCATION ERROR:",
          e
        );
      }
    };

  // DISTANCE

  const getDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {

    if (
      !lat1 ||
      !lon1 ||
      !lat2 ||
      !lon2
    ) {

      return 9999;
    }

    const R = 6371;

    const dLat =
      ((lat2 - lat1) *
        Math.PI) /
      180;

    const dLon =
      ((lon2 - lon1) *
        Math.PI) /
      180;

    const a =
      Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

      Math.cos(
        (lat1 *
          Math.PI) /
          180
      ) *

        Math.cos(
          (lat2 *
            Math.PI) /
            180
        ) *

        Math.sin(
          dLon / 2
        ) *

        Math.sin(
          dLon / 2
        );

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return R * c;
  };

  // TIME AGO

  const getTimeAgo = (
    timestamp
  ) => {

    if (!timestamp)
      return "Nettopp";

    let time =
      timestamp;

    if (
      typeof timestamp ===
        "object" &&
      timestamp?.seconds
    ) {

      time =
        timestamp.seconds *
        1000;
    }

    const now =
      Date.now();

    const diff =
      now - time;

    const minutes =
      Math.floor(
        diff / 60000
      );

    const hours =
      Math.floor(
        minutes / 60
      );

    if (minutes < 1)
      return "Nettopp";

    if (minutes < 60)
      return `${minutes} min siden`;

    if (hours < 24)
      return `${hours} t siden`;

    return `${Math.floor(
      hours / 24
    )} d siden`;
  };

  // FILTER

  const filteredTasks =
    selectedCategory ===
    "Alle"

      ? tasks

      : tasks.filter(
          (task) =>
            task.category ===
            selectedCategory
        );

  return (

    <ScrollView
      style={
        styles.container
      }

      contentContainerStyle={{
        paddingBottom: 120,
      }}

      showsVerticalScrollIndicator={
        false
      }
    >

      {/* HEADER */}

      <View
        style={
          styles.header
        }
      >

        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
        >

          <Ionicons
            name="arrow-back"

            size={28}

            color={
              colors.text
            }
          />

        </TouchableOpacity>

        <Text
          style={
            styles.title
          }
        >
          Oppdrag nær deg
        </Text>

        <TouchableOpacity>

          <Ionicons
            name="options-outline"

            size={28}

            color={
              colors.text
            }
          />

        </TouchableOpacity>

      </View>

      {/* CATEGORIES */}

      <ScrollView
        horizontal

        showsHorizontalScrollIndicator={
          false
        }

        style={{
          marginBottom: 25,
        }}
      >

        {categories.map(
          (category) => (

            <TouchableOpacity
              key={category}

              style={[
                styles.categoryButton,

                selectedCategory ===
                  category && {

                  backgroundColor:
                    colors.primary,
                },
              ]}

              onPress={() =>
                setSelectedCategory(
                  category
                )
              }
            >

              <Text
                style={[
                  styles.categoryText,

                  selectedCategory ===
                    category && {

                    color:
                      "#FFFFFF",
                  },
                ]}
              >
                {category}
              </Text>

            </TouchableOpacity>
          )
        )}

      </ScrollView>

      {/* TASKS */}

      {loading ? (

        <ActivityIndicator
          size="large"

          color={
            colors.primary
          }

          style={{
            marginTop: 50,
          }}
        />

      ) : filteredTasks.length ===
        0 ? (

        <Text
          style={
            styles.empty
          }
        >
          Ingen oppdrag funnet
        </Text>

      ) : (

        filteredTasks

          .sort((a, b) => {

            if (
              !userLocation
            ) {

              return 0;
            }

            const distA =
              getDistance(
                userLocation.latitude,
                userLocation.longitude,
                a.latitude,
                a.longitude
              );

            const distB =
              getDistance(
                userLocation.latitude,
                userLocation.longitude,
                b.latitude,
                b.longitude
              );

            return (
              distA - distB
            );
          })

          .map((task) => (

            <TouchableOpacity
              key={task.id}

              onPress={() =>

                navigation.navigate(
                  "TaskDetail",

                  {
                    taskId:
                      task.id,
                  }
                )
              }
            >

              <AppCard
                style={
                  styles.taskCard
                }
              >

                <View
                  style={
                    styles.taskRow
                  }
                >

                  <View
                    style={{
                      flex: 1,
                    }}
                  >

                    <Text
                      style={
                        styles.taskTitle
                      }
                    >
                      {task.title}
                    </Text>

                    <Text
                      style={
                        styles.taskDescription
                      }

                      numberOfLines={
                        2
                      }
                    >
                      {
                        task.description
                      }
                    </Text>

                    <Text
                      style={
                        styles.meta
                      }
                    >
                      {Math.round(
                        getDistance(
                          userLocation?.latitude,
                          userLocation?.longitude,
                          task.latitude,
                          task.longitude
                        )
                      )}{" "}
                      km unna •{" "}
                      {getTimeAgo(
                        task.createdAt
                      )}
                    </Text>

                  </View>

                  <Text
                    style={
                      styles.price
                    }
                  >
                    {task.price
                      ? `${task.price} kr`
                      : "0 kr"}
                  </Text>

                </View>

              </AppCard>

            </TouchableOpacity>
          ))
      )}

    </ScrollView>
  );
}

const styles =
  StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor:
        colors.background,

      paddingTop: 60,

      paddingHorizontal: 20,
    },

    header: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom: 30,
    },

    title: {

      fontSize: 24,

      fontWeight: "700",

      color:
        colors.text,
    },

    categoryButton: {

      backgroundColor:
        "#FFFFFF",

      paddingHorizontal: 18,

      paddingVertical: 10,

      borderRadius: 20,

      marginRight: 10,
    },

    categoryText: {

      color:
        colors.text,

      fontWeight: "600",
    },

    taskCard: {

      marginBottom: 16,
    },

    taskRow: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    taskTitle: {

      fontSize: 18,

      fontWeight: "700",

      color:
        colors.text,

      marginBottom: 6,
    },

    taskDescription: {

      color:
        colors.muted,

      marginBottom: 8,
    },

    meta: {

      color:
        colors.muted,

      fontSize: 14,
    },

    price: {

      fontSize: 20,

      fontWeight: "800",

      color:
        "#22C55E",
    },

    empty: {

      textAlign:
        "center",

      marginTop: 50,

      color:
        colors.muted,
    },
  });