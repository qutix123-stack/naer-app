import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import * as Location from "expo-location";

import MapView, {
  Marker,
} from "react-native-maps";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import {
  db,
} from "../firebaseConfig";

export default function MapScreen({
  navigation,
}) {

  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    selectedTask,
    setSelectedTask,
  ] = useState(null);

  const [
    userLocation,
    setUserLocation,
  ] = useState(null);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("Alle");

  const mapRef =
    useRef(null);

  const categories = [

    "Alle",

    "Flytting",

    "Transport",

    "Småjobber",

    "Rengjøring",

    "IT",

    "Barnepass",

    "Hage",

    "Bygg",

    "Annet",
  ];

  // LOAD

  useEffect(() => {

    loadLocation();

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

  const loadLocation =
    async () => {

      try {

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (
          status !==
          "granted"
        ) {

          setLoading(false);

          return;
        }

        const location =
          await Location.getCurrentPositionAsync(
            {}
          );

        setUserLocation(
          location.coords
        );

      } catch (e) {

        console.log(e);

      } finally {

        setLoading(false);
      }
    };

  // CATEGORY COLORS

  const getCategoryColor =
    (category) => {

      switch (
        category
      ) {

        case "Flytting":
          return "#22C55E";

        case "Transport":
          return "#0EA5E9";

        case "Småjobber":
          return "#F59E0B";

        case "Rengjøring":
          return "#8B5CF6";

        case "IT":
          return "#2563EB";

        case "Barnepass":
          return "#EC4899";

        case "Hage":
          return "#16A34A";

        case "Bygg":
          return "#EA580C";

        case "Annet":
          return "#6B7280";

        default:
          return "#6B7280";
      }
    };

  // CATEGORY ICONS

  const getCategoryIcon =
    (category) => {

      switch (
        category
      ) {

        case "Flytting":
          return "home";

        case "Transport":
          return "car";

        case "Småjobber":
          return "flash";

        case "Rengjøring":
          return "sparkles";

        case "IT":
          return "desktop";

        case "Barnepass":
          return "happy";

        case "Hage":
          return "leaf";

        case "Bygg":
          return "hammer";

        case "Annet":
          return "apps";

        default:
          return "apps";
      }
    };

  // FILTER

  const filteredTasks =
    tasks.filter(
      (task) =>

        selectedCategory ===
          "Alle"

          ? true

          : task.category ===
            selectedCategory
    );

  // DISTANCE

  const calculateDistance =
    (
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
          Math.sqrt(
            1 - a
          )
        );

      return Math.round(
        R * c
      );
    };

  return (

    <View
      style={
        styles.container
      }
    >

      {loading ? (

        <View
          style={
            styles.loadingContainer
          }
        >

          <ActivityIndicator
            size="large"
            color="#22C55E"
          />

        </View>

      ) : (

        <MapView
          ref={mapRef}

          style={
            styles.map
          }

          showsUserLocation

          showsMyLocationButton={
            false
          }

          initialRegion={{
            latitude:
              userLocation
                ?.latitude ||
              69.6492,

            longitude:
              userLocation
                ?.longitude ||
              18.9553,

            latitudeDelta:
              0.08,

            longitudeDelta:
              0.08,
          }}
        >

          {filteredTasks.map(
            (task) => (

              <Marker
                key={task.id}

                coordinate={{
                  latitude:
                    Number(
                      task.latitude
                    ),

                  longitude:
                    Number(
                      task.longitude
                    ),
                }}

                onPress={() =>
                  setSelectedTask(
                    task
                  )
                }
              >

                <View
                  style={[
                    styles.marker,

                    {
                      backgroundColor:
                        getCategoryColor(
                          task.category
                        ),
                    },
                  ]}
                >

                  <Ionicons
                    name={getCategoryIcon(
                      task.category
                    )}

                    size={17}

                    color="#FFFFFF"
                  />

                </View>

              </Marker>
            )
          )}

        </MapView>
      )}

      {/* TOP */}

      <View
        style={
          styles.topContainer
        }
      >

        <View
          style={
            styles.searchCard
          }
        >

          <Ionicons
            name="map-outline"
            size={18}
            color="#111827"
          />

          <Text
            style={
              styles.searchText
            }
          >
            Oppdrag i området
          </Text>

        </View>

        <TouchableOpacity
          style={
            styles.filterButton
          }
        >

          <Ionicons
            name="options-outline"
            size={22}
            color="#111827"
          />

        </TouchableOpacity>

      </View>

      {/* FILTERS */}

      <ScrollView
        horizontal

        showsHorizontalScrollIndicator={
          false
        }

        style={
          styles.filterScroll
        }
      >

        {categories.map(
          (category) => (

            <TouchableOpacity
              key={category}

              activeOpacity={0.9}

              onPress={() =>
                setSelectedCategory(
                  category
                )
              }

              style={[
                styles.categoryChip,

                selectedCategory ===
                  category && {

                  backgroundColor:
                    "#111827",
                },
              ]}
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

                {category ===
                  "Alle" &&
                  "⚡ "}

                {category ===
                  "Flytting" &&
                  "🚚 "}

                {category ===
                  "Transport" &&
                  "🚗 "}

                {category ===
                  "Småjobber" &&
                  "⚡ "}

                {category ===
                  "IT" &&
                  "💻 "}

                {category ===
                  "Rengjøring" &&
                  "✨ "}

                {category ===
                  "Barnepass" &&
                  "👶 "}

                {category ===
                  "Hage" &&
                  "🌿 "}

                {category ===
                  "Bygg" &&
                  "🛠️ "}

                {category ===
                  "Annet" &&
                  "📦 "}

                {category}

              </Text>

            </TouchableOpacity>
          )
        )}

      </ScrollView>

      {/* LOCATION */}

      <TouchableOpacity
        style={
          styles.locationButton
        }

        onPress={
          loadLocation
        }
      >

        <Ionicons
          name="locate"
          size={22}
          color="#FFFFFF"
        />

      </TouchableOpacity>

      {/* BOTTOM CARD */}

      {selectedTask && (

        <TouchableOpacity
          activeOpacity={0.95}

          style={
            styles.bottomCard
          }

          onPress={() =>

            navigation.navigate(
              "TaskDetail",

              {
                taskId:
                  selectedTask.id,
              }
            )
          }
        >

          <View
            style={
              styles.dragHandle
            }
          />

          <View
            style={
              styles.cardTop
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

                numberOfLines={1}
              >
                {
                  selectedTask.title
                }
              </Text>

              <Text
                style={
                  styles.taskDescription
                }

                numberOfLines={2}
              >
                {
                  selectedTask.description
                }
              </Text>

            </View>

            <Text
              style={
                styles.price
              }
            >
              {
                selectedTask.price
              } kr
            </Text>

          </View>

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
              📍 {
                calculateDistance(
                  userLocation?.latitude,
                  userLocation?.longitude,
                  selectedTask.latitude,
                  selectedTask.longitude
                )
              } km unna
            </Text>

            <View
              style={[
                styles.categoryBadge,

                {
                  backgroundColor:
                    getCategoryColor(
                      selectedTask.category
                    ),
                },
              ]}
            >

              <Text
                style={
                  styles.categoryBadgeText
                }
              >
                {
                  selectedTask.category
                }
              </Text>

            </View>

          </View>

        </TouchableOpacity>
      )}

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
    },

    map: {
      flex: 1,
    },

    loadingContainer: {

      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",

      backgroundColor:
        "#F5F7FA",
    },

    topContainer: {

      position:
        "absolute",

      top:
        Platform.OS ===
        "android"

          ? 58

          : 68,

      left: 20,

      right: 20,

      flexDirection:
        "row",
    },

    searchCard: {

      flex: 1,

      backgroundColor:
        "rgba(255,255,255,0.96)",

      borderRadius: 22,

      paddingHorizontal: 18,

      paddingVertical: 16,

      flexDirection:
        "row",

      alignItems:
        "center",

      shadowColor:
        "#000",

      shadowOpacity: 0.08,

      shadowRadius: 12,

      elevation: 4,
    },

    searchText: {

      marginLeft: 10,

      fontSize: 15,

      fontWeight: "700",

      color:
        "#111827",
    },

    filterButton: {

      width: 56,

      height: 56,

      borderRadius: 20,

      backgroundColor:
        "rgba(255,255,255,0.96)",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginLeft: 12,

      shadowColor:
        "#000",

      shadowOpacity: 0.08,

      shadowRadius: 12,

      elevation: 4,
    },

    filterScroll: {

      position:
        "absolute",

      top:
        Platform.OS ===
        "android"

          ? 135

          : 145,

      paddingLeft: 20,
    },

    categoryChip: {

      backgroundColor:
        "rgba(255,255,255,0.95)",

      paddingHorizontal: 18,

      paddingVertical: 12,

      borderRadius: 999,

      marginRight: 10,
    },

    categoryText: {

      fontSize: 14,

      fontWeight: "700",

      color:
        "#111827",
    },

    marker: {

      width: 42,

      height: 42,

      borderRadius: 21,

      justifyContent:
        "center",

      alignItems:
        "center",

      shadowColor:
        "#000",

      shadowOpacity: 0.24,

      shadowRadius: 12,

      elevation: 6,

      borderWidth: 3,

      borderColor:
        "#FFFFFF",
    },

    locationButton: {

      position:
        "absolute",

      right: 20,

      bottom: 190,

      width: 60,

      height: 60,

      borderRadius: 30,

      backgroundColor:
        "#111827",

      justifyContent:
        "center",

      alignItems:
        "center",

      shadowColor:
        "#000",

      shadowOpacity: 0.2,

      shadowRadius: 12,

      elevation: 8,
    },

    bottomCard: {

      position:
        "absolute",

      left: 20,

      right: 20,

      bottom: 108,

      backgroundColor:
        "rgba(255,255,255,0.98)",

      borderRadius: 32,

      paddingHorizontal: 22,

      paddingTop: 12,

      paddingBottom: 20,

      shadowColor:
        "#000",

      shadowOpacity: 0.12,

      shadowRadius: 18,

      elevation: 10,
    },

    dragHandle: {

      width: 42,

      height: 5,

      borderRadius: 999,

      backgroundColor:
        "#D1D5DB",

      alignSelf:
        "center",

      marginBottom: 16,
    },

    cardTop: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "flex-start",

      marginBottom: 12,
    },

    taskTitle: {

      fontSize: 19,

      fontWeight: "800",

      color:
        "#111827",

      marginBottom: 6,
    },

    taskDescription: {

      fontSize: 14,

      color:
        "#6B7280",

      lineHeight: 21,

      paddingRight: 12,
    },

    price: {

      fontSize: 22,

      fontWeight: "800",

      color:
        "#22C55E",

      marginLeft: 14,
    },

    metaRow: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    meta: {

      fontSize: 14,

      color:
        "#6B7280",

      fontWeight: "600",
    },

    categoryBadge: {

      paddingHorizontal: 12,

      paddingVertical: 8,

      borderRadius: 999,
    },

    categoryBadgeText: {

      color:
        "#FFFFFF",

      fontSize: 12,

      fontWeight: "700",
    },
  });