import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";

import MapViewDirections
from "react-native-maps-directions";

import * as Location from "expo-location";

import MapView, {
  Marker,
  Circle,
  AnimatedRegion,
} from "react-native-maps";

import {
  View,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  PanResponder,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  TaskContext,
} from "../context/TaskContext";

export default function MapScreen({
  navigation,
}) {
  const { tasks } =
    useContext(TaskContext);
    console.log(
  "TASKS:",
  JSON.stringify(
    tasks,
    null,
    2
  )
);

  const [loading, setLoading] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [userLocation, setUserLocation] =
    useState(null);

  const [selectedCategory, setSelectedCategory] =
    useState("Alle");

  const mapRef = useRef(null);

  const slideAnim =
  useRef(
    new Animated.Value(
      300
    )
  ).current;

  const SNAP_TOP = 40;

  const SNAP_MIDDLE = 70;

  const SNAP_BOTTOM = 900;

  const panResponder =
  useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder:
        (_, gesture) =>
          gesture.dy > 8,

      onPanResponderMove:
        (_, gesture) => {

          if (
            gesture.dy > 0
          ) {

            slideAnim.setValue(
              gesture.dy
            );
          }
        },

      onPanResponderRelease:
  (_, gesture) => {

    if (
      gesture.dy > 180
    ) {

      Animated.spring(
        slideAnim,
        {
          toValue:
            SNAP_BOTTOM,

          useNativeDriver:
            true,
        }
      ).start(() => {
        setSelectedTask(
          null
        );
      });

    } else if (
      gesture.dy < -80
    ) {

      Animated.spring(
        slideAnim,
        {
          toValue:
            SNAP_TOP,

          useNativeDriver:
            true,
        }
      ).start();

    } else {

      Animated.spring(
        slideAnim,
        {
          toValue:
            SNAP_MIDDLE,

          useNativeDriver:
            true,
        }
      ).start();
    }
  },
    })
  ).current;

  const helperCoordinate =
  useRef(
    new AnimatedRegion({
      latitude:
        69.9642,

      longitude:
        23.3171,

      latitudeDelta:
        0.01,

      longitudeDelta:
        0.01,
    })
  ).current;

  const categories = [
  "Alle",
  "Flytting",
  "Rengjøring",
  "IT",
  "Levering",
  "Hage",
  "Bæring",
  "Dyrepass",
  "Annet",
];

  const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const toRad = (
      value
    ) =>
      (value * Math.PI) /
      180;

    const R = 6371;

    const dLat = toRad(
      lat2 - lat1
    );

    const dLon = toRad(
      lon2 - lon1
    );

    const a =
      Math.sin(dLat / 2) *
        Math.sin(
          dLat / 2
        ) +
      Math.cos(
        toRad(lat1)
      ) *
        Math.cos(
          toRad(lat2)
        ) *
        Math.sin(dLon / 2) *
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

    return (
      R * c
    ).toFixed(1);
  };

  const getTimeAgo = (
  createdAt
) => {

  if (!createdAt)
    return "Nå";

  const date =
    createdAt?.seconds
      ? new Date(
          createdAt.seconds *
            1000
        )
      : new Date(
          createdAt
        );

  const diff =
    Date.now() -
    date.getTime();

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

  useEffect(() => {

  if (
    selectedTask?.helperLatitude &&
    selectedTask?.helperLongitude
  ) {

    helperCoordinate.timing({
      latitude:
        selectedTask.helperLatitude,

      longitude:
        selectedTask.helperLongitude,

      duration: 1200,

      useNativeDriver:
        false,
    }).start();
  }

}, [
  selectedTask?.helperLatitude,
  selectedTask?.helperLongitude,
]);

  useEffect(() => {
    const loadMap =
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

          mapRef.current?.animateToRegion(
            {
              latitude:
                location.coords
                  .latitude,

              longitude:
                location.coords
                  .longitude,

              latitudeDelta:
                0.012,

              longitudeDelta:
                0.012,
            },
            1000
          );
        } catch (e) {
          console.log(e);
        } finally {
          setLoading(false);
        }
      };

    loadMap();
  }, []);

  const activeTasks =
  useMemo(() => {

    console.log(
      "RAW TASKS:",
      tasks
    );

    return (
      tasks?.filter(
        (task) => {

          console.log(
            "TASK:",
            task
          );

          const category =
            task.category ||
            "Annet";

          const hasCoords =
            task?.latitude != null &&
            task?.longitude != null;

          console.log(
            "HAS COORDS:",
            hasCoords,
            task?.latitude,
            task?.longitude
          );

          return (
            (selectedCategory ===
              "Alle" ||
              category ===
                selectedCategory) &&

            !task?.completed &&

            task?.status !==
              "completed" &&

            hasCoords
          );
        }
      ) || []
    );
  }, [
    tasks,
    selectedCategory,
  ]);

  const focusLocation =
    async () => {
      try {
        const location =
          await Location.getCurrentPositionAsync(
            {}
          );

        setUserLocation(
          location.coords
        );

        mapRef.current?.animateToRegion(
          {
            latitude:
              location.coords
                .latitude,

            longitude:
              location.coords
                .longitude,

            latitudeDelta:
              0.05,

            longitudeDelta:
              0.05,
          },
          1000
        );
      } catch (e) {
        console.log(e);
      }
    };

  const distance =
    selectedTask &&
    userLocation
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          selectedTask.latitude,
          selectedTask.longitude
        )
      : null;
  const eta =
  distance
    ? Math.ceil(
        distance * 2.2
      )
    : null;

      useEffect(() => {

  if (
    userLocation &&
    selectedTask
  ) {

    mapRef.current?.fitToCoordinates(
      [
        {
          latitude:
            userLocation.latitude,

          longitude:
            userLocation.longitude,
        },

        {
          latitude:
            selectedTask.latitude,

          longitude:
            selectedTask.longitude,
        },
      ],

      {
        edgePadding: {
          top: 220,

          right: 80,

          bottom: 320,

          left: 80,
        },

        animated: true,
      }
    );
  }

}, [
  selectedTask,
]);

      useEffect(() => {
  Animated.timing(
    slideAnim,
    {
      toValue:
      selectedTask
        ? SNAP_MIDDLE
        : SNAP_BOTTOM,

      duration: 260,

      useNativeDriver:
        true,
    }
  ).start();
}, [selectedTask]);

  const mapStyle = [
  {
    featureType: "poi",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },

  {
    featureType: "transit",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },

  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        saturation: -15,
      },
    ],
  },
];

  return (
    <View style={styles.container}>
      {loading && (
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />
        </View>
      )}

      <MapView
    customMapStyle={mapStyle}

  style={{
    flex: 1,
  }}

  ref={mapRef}

  initialRegion={{
    latitude: 69.9642,
    longitude: 23.3171,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}

  showsUserLocation={true}

  showsMyLocationButton={false}
>

  {/* ROUTE */}

  {
    userLocation &&
    selectedTask && (

      <MapViewDirections
        zIndex={-1}
        origin={{
          latitude:
            userLocation.latitude,

          longitude:
            userLocation.longitude,
        }}

        destination={{
          latitude:
            selectedTask.latitude,

          longitude:
            selectedTask.longitude,
        }}

        resetOnChange={false}

        mode="DRIVING"

        apikey="AIzaSyB9WovNfpDfF_lCSGR2-her8uhmhWutP54"

        strokeWidth={5}

        strokeColor="#2563EB"
      />
    )
  }

  {/* TASKS */}

  {activeTasks.map(
    (task) => {

      return (

        <React.Fragment
          key={task.id}
        >

          {/* TASK PIN */}

          <Marker
            tracksViewChanges={false}
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

            onPress={() => {

              setSelectedTask(
                task
              );

              mapRef.current?.animateToRegion(
                {
                  latitude:
                    Number(
                      task.latitude
                    ),

                  longitude:
                    Number(
                      task.longitude
                    ),

                  latitudeDelta:
                    0.015,

                  longitudeDelta:
                    0.015,
                },

                500
              );
            }}
          />

          {/* HELPER */}

          {
            task.helperLatitude &&
            task.helperLongitude && (

              <Marker
              tracksViewChanges={false}

                coordinate={{
                  latitude:
                    Number(
                      task.helperLatitude
                    ),

                  longitude:
                    Number(
                      task.helperLongitude
                    ),
                }}
              >

                <View
                  style={{
                    width: 22,
                    height: 22,

                    borderRadius: 11,

                    backgroundColor:
                      "#22C55E",

                    borderWidth: 4,

                    borderColor:
                      "white",

                    shadowColor:
                      "#000",

                    shadowOpacity: 0.25,

                    shadowRadius: 8,

                    elevation: 8,
                  }}
                />

              </Marker>
            )
          }

        </React.Fragment>
      );
    }
  )}

</MapView>

      <View
        style={
          styles.topCard
        }
      >
        <Text
          style={
            styles.title
          }
        >
          Oppdrag nær deg
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          {
            activeTasks.length
          }{" "}
          aktive oppdrag
        </Text>
      </View>

      <View
      {...panResponder.panHandlers}
  style={{
    opacity:
      selectedTask
        ? 0.35
        : 1,
  }}
>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        style={
          styles.filterContainer
        }
      >
        {categories.map(
          (category) => (
            <TouchableOpacity
              key={category}
              onPress={() =>
                setSelectedCategory(
                  category
                )
              }
              style={[
                styles.filterChip,

                selectedCategory ===
                  category && {
                  backgroundColor:
                    "#2563EB",
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,

                  selectedCategory ===
                    category && {
                    color:
                      "white",
                  },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>
      </View>

        <View
  style={{
    opacity:
      selectedTask
        ? 0.35
        : 1,
  }}
>

  {/* LOCATION BUTTON */}

  <TouchableOpacity
    style={
      styles.locationButton
    }
    onPress={
      focusLocation
    }
  >
    <Ionicons
      name="locate"
      size={26}
      color="white"
    />
  </TouchableOpacity>

  {/* FAB BUTTON */}

  <TouchableOpacity
    style={
      styles.fabButton
    }
    onPress={() =>
      navigation.navigate(
        "CreateTask"
      )
    }
  >
    <Ionicons
      name="add"
      size={34}
      color="white"
    />
  </TouchableOpacity>

</View>

        {selectedTask && (
  <Animated.View
    pointerEvents="none"
    style={{
      position:
        "absolute",

      top: 0,
      left: 0,
      right: 0,
      bottom: 0,

      backgroundColor:
        "black",

      opacity: 0.08,

      zIndex: 5,
    }}
  />
)}

      {selectedTask && (
        <Animated.View
        pointerEvents="box-none"
  style={[
    styles.bottomCard,
    {
      transform: [
        {
          translateY:
            slideAnim,
        },
      ],
    },
  ]}
>

  <TouchableOpacity
    style={
      styles.closeButton
    }
    onPress={() =>
      setSelectedTask(
        null
      )
    }
  >
    <Ionicons
      name="close"
      size={24}
      color="#111827"
    />
  </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.92}
            style={
              styles.sheetContent
            }
            onPress={() =>
              navigation.navigate(
                "TaskDetail",
                {
                  task:
                    selectedTask,
                }
              )
            }
          >
            <View
              style={
                styles.bottomTop
              }
            >
              <Text
                style={
                  styles.bottomTitle
                }
              >
                {
                  selectedTask.title
                }
              </Text>

              <Text
                style={
                  styles.price
                }
              >
                {
                  selectedTask.reward
                }
              </Text>
            </View>

            <Text
              style={
                styles.description
              }
              numberOfLines={3}
            >
              {
                selectedTask.description
              }
            </Text>

            <View
              style={
                styles.metaRow
              }
            >
              <Text
                style={
                  styles.metaText
                }
              >
                {"⭐".repeat(
                  Math.round(
                  selectedTask?.creatorRating
                    || 5
                  )
                )}

                {" "}
                (
                  {selectedTask?.creatorRating
                    || 5}
                )
              </Text>

              <Text
                style={
                styles.metaText
                }
              >
              🕒 {
                  getTimeAgo(
                  selectedTask.createdAt
                  )
                  }
              </Text>

              <Text
                style={
                  styles.metaText
                }
              >
                📍{" "}
                {distance} km
              </Text>
                <Text
                style={
                styles.metaText
                }
            >
              🚗 {eta} min unna
            </Text>
            </View>

            <TouchableOpacity
              style={
              styles.openButton
                    }
              onPress={() =>
                navigation.navigate(
                "TaskDetail",
              {
                task:
                  selectedTask,
              }
                )
              }
            >
              <Text
                style={
                  styles.openButtonText
                }
              >
                Åpne oppdrag
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
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
      width: "100%",
      height: "100%",
    },

    loadingContainer: {
      position:
        "absolute",

      top: 0,
      left: 0,
      right: 0,
      bottom: 0,

      justifyContent:
        "center",

      alignItems:
        "center",

      backgroundColor:
        "#F3F4F6",

      zIndex: 999,
    },

    topCard: {
      position:
        "absolute",

      borderWidth: 1,

      borderColor:
      "rgba(255,255,255,0.7)",

      top: 62,

      left: 18,

      right: 18,

      backgroundColor:
        "rgba(255,255,255,0.88)",

      padding: 22,

      borderRadius: 28,

      shadowColor:
        "#000",

      shadowOpacity: 0.08,

      shadowRadius: 14,

      elevation: 8,
    },

    title: {
      fontSize: 30,

      fontWeight:
        "bold",

      color:
        "#111827",
    },

    subtitle: {
      marginTop: 6,

      fontSize: 18,

      color:
        "#6B7280",
    },

    filterContainer: {
      position:
        "absolute",

      top: 190,

      paddingLeft: 18,
    },

    filterChip: {
      backgroundColor:
        "rgba(255,255,255,0.96)",

      paddingHorizontal: 18,

      paddingVertical: 12,

      borderRadius: 20,

      marginRight: 12,

      shadowColor: "#000",

      shadowOpacity: 0.08,

      shadowRadius: 8,

      elevation: 4,
    },

    filterText: {
      fontWeight: "700",

      color: "#111827",
    },

    locationButton: {
      position:
        "absolute",

      right: 20,

      bottom: 150,

      width: 72,

      height: 72,

      borderRadius: 36,

      backgroundColor:
        "#0B1437",

      justifyContent:
        "center",

      alignItems:
        "center",

      shadowColor:
        "#000",

      shadowOpacity: 0.22,

      shadowRadius: 12,

      elevation: 10,
    },

    bottomCard: {
  position: "absolute",

  overflow: "hidden",

  borderWidth: 1,

  borderColor:
    "rgba(255,255,255,0.65)",

  left: 18,

  right: 18,

  bottom: 140,

  backgroundColor:
    "rgba(255,255,255,0.96)",

  borderRadius: 34,

  padding: 24,

  paddingBottom: 34,

  shadowColor:
    "#000",

  shadowOpacity: 0.14,

  shadowRadius: 18,

  elevation: 12,
},

    closeButton: {
  position: "absolute",

  top: 18,

  right: 18,

  zIndex: 999,

  width: 36,

  height: 36,

  borderRadius: 18,

  backgroundColor:
    "#F3F4F6",

  justifyContent:
    "center",

  alignItems:
    "center",
},

    bottomTop: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    bottomTitle: {
        fontSize: 28,

        fontWeight: "bold",

        color: "#111827",

        flex: 1,

        maxWidth: "68%",

        lineHeight: 34,
    },

    price: {
      fontSize: 38,

      fontWeight: "900",

      color: "#4ADE80",

      marginLeft: 16,

    },

    description: {
      marginTop: 12,

      fontSize: 17,

      color:
        "#6B7280",

      lineHeight: 24,

      backgroundColor:"white",

      borderRadius: 26,

      padding: 26,

      shadowOpacity: 0.06,

      shadowColor: "#000",

      shadowRadius: 10,

      elevation: 4,
    },

    metaRow: {
      flexDirection:
        "row",

      flexWrap: "wrap",

      gap: 10,

      justifyContent:
        "space-between",

      marginTop: 18,
    },

    metaText: {
      fontSize: 14,

      marginRight: 10,

      marginBottom: 8,

      fontWeight:
        "700",

      color:
        "#6B7280",
    },

    sheetContent: {
      flex: 1,
    },

    openButton: {
  marginTop: 24,

  backgroundColor:
    "#2563EB",

  paddingVertical: 18,

  borderRadius: 18,

  alignItems:
    "center",

  shadowColor:
    "#2563EB",

  shadowOpacity: 0.28,

  shadowRadius: 12,

  elevation: 8,
},

    openButtonText: {
      color: "white",

      fontWeight: "bold",

      fontSize: 17,
    },

fabButton: {
  position: "absolute",

  left: 20,

  bottom: 150,

  width: 72,

  height: 72,

  borderRadius: 36,

  backgroundColor:
    "#2563EB",

  justifyContent:
    "center",

  alignItems:
    "center",

  shadowColor:
    "#000",

  shadowOpacity: 0.22,

  shadowRadius: 12,

  elevation: 10,
},

  });