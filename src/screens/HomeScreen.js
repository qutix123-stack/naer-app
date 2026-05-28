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
  Platform,
} from "react-native";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import {
  Ionicons,
} from "@expo/vector-icons";

import { db } from "../firebaseConfig";

import TaskCard from "../components/TaskCard";

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

  const hasUnread =
    false;

  const categories = [

    {
      name:
        "Flytting",

      icon:
        "home",

      color:
        "#22C55E",
    },

    {
      name:
        "Transport",

      icon:
        "car",

      color:
        "#0EA5E9",
    },

    {
      name:
        "Småjobber",

      icon:
        "flash",

      color:
        "#F59E0B",
    },

    {
      name:
        "Rengjøring",

      icon:
        "sparkles",

      color:
        "#8B5CF6",
    },

    {
      name:
        "IT",

      icon:
        "desktop",

      color:
        "#2563EB",
    },

    {
      name:
        "Barnepass",

      icon:
        "happy",

      color:
        "#EC4899",
    },

    {
      name:
        "Hage",

      icon:
        "leaf",

      color:
        "#16A34A",
    },

    {
      name:
        "Bygg",

      icon:
        "hammer",

      color:
        "#EA580C",
    },

    {
      name:
        "Annet",

      icon:
        "apps",

      color:
        "#6B7280",
    },
  ];

  // SORT CATEGORIES

  const sortedCategories =

    [...categories].sort(

      (a, b) => {

        const countA =
          tasks.filter(

            (task) =>

              task.category ===
              a.name
          ).length;

        const countB =
          tasks.filter(

            (task) =>

              task.category ===
              b.name
          ).length;

        return (
          countB - countA
        );
      }
    );

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

        console.log(e);
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

      return 0;
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

    return Math.round(
      R * c
    );
  };

  // TIME AGO

  const getTimeAgo = (
    timestamp
  ) => {

    if (!timestamp)
      return "Nå";

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

    const days =
      Math.floor(
        hours / 24
      );

    if (minutes < 1)
      return "Nå";

    if (minutes < 60)
      return `${minutes} min`;

    if (hours < 24)
      return `${hours} t`;

    return `${days} d`;
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

      <View
        style={
          styles.header
        }
      >

        <View>

          <Text
            style={
              styles.logo
            }
          >
            Nær
          </Text>

          <View
            style={
              styles.locationRow
            }
          >

            <Ionicons
              name="location-outline"
              size={14}
              color="#111827"
            />

            <Text
              style={
                styles.locationText
              }
            >
              Fauske
            </Text>

            <Ionicons
              name="chevron-down"
              size={14}
              color="#111827"
            />

          </View>

        </View>

        <View
          style={{
            position:
              "relative",
          }}
        >

          <TouchableOpacity
            style={
              styles.bellButton
            }

            onPress={() =>

              navigation.navigate(
                "Meldinger"
              )
            }
          >

            <Ionicons
              name="notifications-outline"
              size={22}
              color="#111827"
            />

          </TouchableOpacity>

          {hasUnread && (

            <View
              style={
                styles.notificationDot
              }
            />
          )}

        </View>

      </View>

      {/* HERO BUTTONS */}

      <TouchableOpacity
        activeOpacity={0.92}

        style={
          styles.helpButton
        }

        onPress={() =>
          navigation.navigate(
            "CreateTask"
          )
        }
      >

        <View
          style={
            styles.heroIcon
          }
        >

          <Ionicons
            name="hand-left"
            size={22}
            color="#FF5A4F"
          />

        </View>

        <View>

          <Text
            style={
              styles.heroTitle
            }
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

        </View>

      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.92}

        style={
          styles.workButton
        }

        onPress={() =>
          navigation.navigate(
            "Tasks"
          )
        }
      >

        <View
          style={
            styles.heroIcon
          }
        >

          <Ionicons
            name="hand-right"
            size={22}
            color="#22C55E"
          />

        </View>

        <View>

          <Text
            style={
              styles.heroTitle
            }
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

        </View>

      </TouchableOpacity>

      {/* CATEGORIES */}

      <View
        style={
          styles.sectionHeader
        }
      >

        <Text
          style={
            styles.sectionTitle
          }
        >
          Populære kategorier
        </Text>

      </View>

      <ScrollView
        horizontal

        showsHorizontalScrollIndicator={
          false
        }

        contentContainerStyle={{
          paddingBottom: 8,
        }}
      >

        {sortedCategories.map(
          (category) => (

            <TouchableOpacity
              key={category.name}

              activeOpacity={0.92}

              onPress={() =>

                navigation.navigate(
                  "Tasks",

                  {
                    category:
                      category.name,
                  }
                )
              }

              style={[
                styles.categoryCard,

                {
                  backgroundColor:
                    category.color,
                },
              ]}
            >

              <Ionicons
                name={
                  category.icon
                }

                size={20}

                color="#FFFFFF"
              />

              <Text
                style={
                  styles.categoryTitle
                }
              >
                {
                  category.name
                }
              </Text>

            </TouchableOpacity>
          )
        )}

      </ScrollView>

      {/* NEW TASKS */}

      <View
        style={[
          styles.sectionHeader,

          {
            marginTop: 28,
          },
        ]}
      >

        <Text
          style={
            styles.sectionTitle
          }
        >
          Nye oppdrag
        </Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              "Tasks"
            )
          }
        >

          <Text
            style={
              styles.seeAll
            }
          >
            Se alle
          </Text>

        </TouchableOpacity>

      </View>

      {/* TASKS */}

      {loading ? (

        <ActivityIndicator
          size="large"
          color="#22C55E"
          style={{
            marginTop: 40,
          }}
        />

      ) : (

        tasks

          .sort((a, b) => {

            const distA =
              getDistance(
                userLocation?.latitude,
                userLocation?.longitude,
                a.latitude,
                a.longitude
              );

            const distB =
              getDistance(
                userLocation?.latitude,
                userLocation?.longitude,
                b.latitude,
                b.longitude
              );

            return (
              distA - distB
            );
          })

          .slice(0, 8)

          .map((task) => (

            <TaskCard
              key={task.id}

              task={task}

              distance={getDistance(
                userLocation?.latitude,
                userLocation?.longitude,
                task.latitude,
                task.longitude
              )}

              timeAgo={getTimeAgo(
                task.createdAt
              )}

              onPress={() =>

                navigation.navigate(
                  "TaskDetail",

                  {
                    taskId:
                      task.id,
                  }
                )
              }
            />
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
        "#F6F7FB",

      paddingHorizontal: 20,

      paddingTop:
        Platform.OS ===
        "android"

          ? 52

          : 58,
    },

    header: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom: 28,
    },

    logo: {

      fontSize: 36,

      fontWeight: "800",

      color:
        "#0F172A",
    },

    locationRow: {

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop: 4,
    },

    locationText: {

      marginHorizontal: 4,

      fontSize: 14,

      color:
        "#111827",

      fontWeight: "500",
    },

    bellButton: {

      width: 46,

      height: 46,

      borderRadius: 16,

      backgroundColor:
        "#FFFFFF",

      justifyContent:
        "center",

      alignItems:
        "center",

      shadowColor:
        "#000",

      shadowOpacity: 0.05,

      shadowRadius: 10,

      elevation: 3,
    },

    notificationDot: {

      position:
        "absolute",

      top: 0,

      right: 0,

      width: 14,

      height: 14,

      borderRadius: 999,

      backgroundColor:
        "#EF4444",

      borderWidth: 2,

      borderColor:
        "#FFFFFF",
    },

    helpButton: {

      backgroundColor:
        "#FF5A4F",

      borderRadius: 28,

      padding: 22,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom: 14,
    },

    workButton: {

      backgroundColor:
        "#22C55E",

      borderRadius: 28,

      padding: 22,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom: 30,
    },

    heroIcon: {

      width: 54,

      height: 54,

      borderRadius: 20,

      backgroundColor:
        "#FFFFFF",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight: 16,
    },

    heroTitle: {

      fontSize: 21,

      fontWeight: "800",

      color:
        "#FFFFFF",

      marginBottom: 3,
    },

    heroSubtitle: {

      fontSize: 14,

      color:
        "#FFFFFF",
    },

    sectionHeader: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom: 16,
    },

    sectionTitle: {

      fontSize: 21,

      fontWeight: "800",

      color:
        "#111827",
    },

    seeAll: {

      fontSize: 14,

      color:
        "#22C55E",

      fontWeight: "700",
    },

    categoryCard: {

      width: 88,

      height: 88,

      borderRadius: 22,

      padding: 14,

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight: 12,
    },

    categoryTitle: {

      color:
        "#FFFFFF",

      fontSize: 11,

      fontWeight: "800",

      lineHeight: 15,

      textAlign:
        "center",

      marginTop: 8,
    },
  });