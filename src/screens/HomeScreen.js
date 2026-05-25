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
  Image,
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

export default function HomeScreen({
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

  useEffect(() => {
    getUserLocation();

    const q = query(
      collection(db, "tasks"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {
        const taskList = [];

        snapshot.forEach((doc) => {
          taskList.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setTasks(taskList);
        setLoading(false);
      });

    return unsubscribe;
  }, []);

  // USER LOCATION

  const getUserLocation =
    async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (
          status !== "granted"
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

  // TIME AGO

  const getTimeAgo = (
    timestamp
  ) => {
    if (!timestamp)
      return "Nettopp";

    let time = timestamp;

    // FIRESTORE TIMESTAMP

    if (
      typeof timestamp ===
        "object" &&
      timestamp?.seconds
    ) {
      time =
        timestamp.seconds *
        1000;
    }

    const now = Date.now();

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

    const days =
      Math.floor(
        hours / 24
      );

    if (minutes < 1)
      return "Nettopp";

    if (minutes < 60)
      return `${minutes} min siden`;

    if (hours < 24)
      return `${hours} t siden`;

    return `${days} d siden`;
  };

  // REAL DISTANCE

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
    )
      return 9999;

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />

          <Text style={styles.location}>
            Oppdrag nær deg
          </Text>
        </View>

        <TouchableOpacity>
          <Ionicons
            name="notifications-outline"
            size={28}
            color={colors.dark}
          />
        </TouchableOpacity>
      </View>

      {/* HERO */}

      <View
        style={styles.heroContainer}
      >
        <TouchableOpacity
          style={
            styles.needHelpCard
          }
          onPress={() =>
            navigation.navigate(
            "CreateTask"
            )
          }
        >
          <Text
            style={styles.heroTitle}
          >
            Trenger hjelp
          </Text>

          <Text
            style={
              styles.heroSubtitle
            }
          >
            Opprett et oppdrag
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={
            styles.canHelpCard
            }

            onPress={() =>
            navigation.navigate(
            "Tasks"
            )
            }
        >
          <Text
            style={styles.heroTitle}
          >
            Kan hjelpe
          </Text>

          <Text
            style={
              styles.heroSubtitle
            }
          >
            Se oppdrag nær deg
          </Text>
        </TouchableOpacity>
      </View>

      {/* SECTION */}

      <View
        style={styles.sectionHeader}
      >
        <Text
          style={styles.sectionTitle}
        >
          Aktive oppdrag
        </Text>
      </View>

      {/* LOADING */}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{
            marginTop: 40,
          }}
        />
      ) : tasks.length === 0 ? (
        <Text
          style={styles.emptyText}
        >
          Ingen oppdrag enda
        </Text>
      ) : (
        tasks
          .sort((a, b) => {
            if (
              !userLocation
            )
              return 0;

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
                  "Tasks",
                  {
                    task,
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
                      marginRight: 10,
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
                        styles.taskDistance
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
                    {task.price ||
                      task.reward ||
                      0}
                  
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
      paddingHorizontal: 20,
      paddingTop: 60,
    },

    header: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 30,
    },

    logo: {
      width: 150,
      height: 60,
    },

    location: {
      fontSize: 16,
      color: colors.gray,
      marginTop: 4,
    },

    heroContainer: {
      gap: 16,
      marginBottom: 30,
    },

    needHelpCard: {
      backgroundColor:
        "#ff5f57",
      padding: 24,
      borderRadius: 24,
    },

    canHelpCard: {
      backgroundColor:
        "#22c55e",
      padding: 24,
      borderRadius: 24,
    },

    heroTitle: {
      color: "#fff",
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 6,
    },

    heroSubtitle: {
      color: "#fff",
      fontSize: 16,
    },

    sectionHeader: {
      marginBottom: 20,
    },

    sectionTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.dark,
    },

    taskCard: {
      marginBottom: 16,
    },

    taskRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    taskTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.dark,
      marginBottom: 6,
    },

    taskDescription: {
      color: colors.gray,
      marginBottom: 8,
    },

    taskDistance: {
      color: colors.gray,
      fontSize: 14,
    },

    price: {
      fontSize: 20,
      fontWeight: "800",
      color: "#22c55e",
    },

    emptyText: {
      textAlign: "center",
      marginTop: 50,
      color: colors.gray,
      fontSize: 16,
    },
  });