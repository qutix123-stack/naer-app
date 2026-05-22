import React, {
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

import MapView, {
  Marker,
  Circle,
} from "react-native-maps";

import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { TaskContext } from "../context/TaskContext";

import * as Location from "expo-location";

export default function MapScreen({
  navigation,
}) {
  const { tasks } =
    useContext(TaskContext);

  const [location, setLocation] =
    useState(null);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [locationDenied, setLocationDenied] =
    useState(false);

  const mapRef =
    useRef(null);

  // 🔥 LIVE USER LOCATION
  useEffect(() => {
    let subscription;

    const getLocation =
      async () => {
        try {
          const { status } =
            await Location.requestForegroundPermissionsAsync();

          console.log(
            "LOCATION STATUS:",
            status
          );

          if (
            status !==
            "granted"
          ) {
            setLocationDenied(
              true
            );

            return;
          }

          const currentLocation =
            await Location.getCurrentPositionAsync(
              {
                accuracy:
                  Location.Accuracy.Balanced,
              }
            );

          if (
            currentLocation?.coords
          ) {
            setLocation(
              currentLocation.coords
            );
          }

          subscription =
            await Location.watchPositionAsync(
              {
                accuracy:
                  Location.Accuracy.Balanced,

                timeInterval: 5000,

                distanceInterval: 10,
              },

              (
                newLocation
              ) => {
                if (
                  newLocation?.coords
                ) {
                  setLocation(
                    newLocation.coords
                  );
                }
              }
            );
        } catch (e) {
          console.log(
            "MAP ERROR:",
            e
          );
        }
      };

    getLocation();

    return () => {
      if (
        subscription
      ) {
        subscription.remove();
      }
    };
  }, []);

  // 🔥 CENTER MAP
  const centerMap =
    () => {
      if (
        !location ||
        !mapRef.current
      )
        return;

      mapRef.current.animateToRegion(
        {
          latitude:
            Number(
              location.latitude
            ),

          longitude:
            Number(
              location.longitude
            ),

          latitudeDelta:
            0.015,

          longitudeDelta:
            0.015,
        },

        1000
      );
    };

  // 🔥 STATUS COLORS
  const getTaskColor =
    (task) => {
      switch (
        task.status
      ) {
        case "accepted":
          return "#F59E0B";

        case "on_the_way":
          return "#2563EB";

        case "arrived":
          return "#8B5CF6";

        case "working":
          return "#EC4899";

        case "completed":
          return "#22C55E";

        default:
          return "#EF4444";
      }
    };

  // 🔥 LOCATION DENIED
  if (
    locationDenied
  ) {
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

          padding: 30,
        }}
      >
        <Text
          style={{
            fontSize: 28,

            marginBottom: 20,
          }}
        >
          📍
        </Text>

        <Text
          style={{
            fontSize: 22,

            fontWeight:
              "bold",

            color:
              "#111827",

            textAlign:
              "center",
          }}
        >
          Location required
        </Text>

        <Text
          style={{
            marginTop: 12,

            fontSize: 16,

            color:
              "#6B7280",

            textAlign:
              "center",

            lineHeight: 24,
          }}
        >
          Please enable GPS/location permissions to use the map.
        </Text>
      </View>
    );
  }

  // 🔥 LOADING
  if (!location) {
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

          padding: 30,
        }}
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text
          style={{
            marginTop: 20,

            fontSize: 18,

            fontWeight:
              "bold",

            color:
              "#111827",

            textAlign:
              "center",
          }}
        >
          Waiting for location...
        </Text>

        <Text
          style={{
            marginTop: 10,

            color:
              "#6B7280",

            textAlign:
              "center",
          }}
        >
          Please allow GPS/location permissions
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton
        followsUserLocation
        loadingEnabled
        showsCompass
        rotateEnabled
        onPress={() =>
          setSelectedTask(
            null
          )
        }
        onMapReady={() => {
          if (
            location &&
            mapRef.current
          ) {
            setTimeout(() => {
              mapRef.current.animateToRegion(
                {
                  latitude:
                    Number(
                      location.latitude
                    ),

                  longitude:
                    Number(
                      location.longitude
                    ),

                  latitudeDelta:
                    0.015,

                  longitudeDelta:
                    0.015,
                },

                1200
              );
            }, 500);
          }
        }}
        initialRegion={{
          latitude:
            Number(
              location.latitude
            ),

          longitude:
            Number(
              location.longitude
            ),

          latitudeDelta: 0.05,

          longitudeDelta: 0.05,
        }}
      >
        {/* USER RADIUS */}
        {location &&
          !isNaN(
            Number(
              location.latitude
            )
          ) &&
          !isNaN(
            Number(
              location.longitude
            )
          ) && (
            <Circle
              center={{
                latitude:
                  Number(
                    location.latitude
                  ),

                longitude:
                  Number(
                    location.longitude
                  ),
              }}
              radius={80}
              fillColor="rgba(37,99,235,0.12)"
              strokeColor="rgba(37,99,235,0.35)"
            />
          )}

        {/* TASK MARKERS */}
        {tasks
          .filter(
            (task) =>
              task &&
              !isNaN(
                Number(
                  task.latitude
                )
              ) &&
              !isNaN(
                Number(
                  task.longitude
                )
              )
          )
          .map(
            (task) => (
              <Marker
                key={
                  task.id
                }
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
                pinColor={getTaskColor(
                  task
                )}
                onPress={() =>
                  setSelectedTask(
                    task
                  )
                }
              />
            )
          )}
      </MapView>

      {/* TOP CARD */}
      <View
        style={
          styles.statusCard
        }
      >
        <Text
          style={
            styles.statusTitle
          }
        >
          Live oppdrag
        </Text>

        <Text
          style={
            styles.statusText
          }
        >
          {
            tasks.filter(
              (t) =>
                !t.completed
            ).length
          } aktive oppdrag
        </Text>
      </View>

      {/* MY LOCATION BUTTON */}
      <TouchableOpacity
        onPress={
          centerMap
        }
        style={
          styles.button
        }
      >
        <Text
          style={{
            color:
              "white",

            fontWeight:
              "bold",

            fontSize: 16,
          }}
        >
          📍
        </Text>
      </TouchableOpacity>

      {/* BOTTOM SHEET */}
      {selectedTask && (
        <View
          style={
            styles.bottomSheet
          }
        >
          <Text
            style={
              styles.taskTitle
            }
          >
            {
              selectedTask.title
            }
          </Text>

          <Text
            style={
              styles.taskReward
            }
          >
            💰{" "}
            {
              selectedTask.reward
            }
          </Text>

          <Text
            style={
              styles.taskCategory
            }
          >
            📂{" "}
            {selectedTask.category ||
              "Annet"}
          </Text>

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
              style={{
                color:
                  "white",

                fontWeight:
                  "bold",

                fontSize: 16,
              }}
            >
              Åpne oppdrag
            </Text>
          </TouchableOpacity>
        </View>
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

    button: {
      position:
        "absolute",

      bottom: 140,

      right: 20,

      backgroundColor:
        "#111827",

      width: 58,

      height: 58,

      borderRadius: 29,

      justifyContent:
        "center",

      alignItems:
        "center",

      elevation: 5,
    },

    statusCard: {
      position:
        "absolute",

      top: 70,

      left: 20,

      right: 20,

      backgroundColor:
        "white",

      padding: 18,

      borderRadius: 24,

      shadowColor:
        "#000",

      shadowOpacity: 0.08,

      shadowRadius: 10,

      elevation: 4,
    },

    statusTitle: {
      fontSize: 22,

      fontWeight:
        "bold",

      color:
        "#111827",

      marginBottom: 6,
    },

    statusText: {
      color:
        "#6B7280",

      fontSize: 16,
    },

    bottomSheet: {
      position:
        "absolute",

      bottom: 25,

      left: 20,

      right: 20,

      backgroundColor:
        "white",

      borderRadius: 28,

      padding: 24,

      shadowColor:
        "#000",

      shadowOpacity: 0.12,

      shadowRadius: 12,

      elevation: 8,
    },

    taskTitle: {
      fontSize: 24,

      fontWeight:
        "bold",

      color:
        "#111827",

      marginBottom: 10,
    },

    taskReward: {
      fontSize: 18,

      color:
        "#22C55E",

      fontWeight:
        "bold",

      marginBottom: 8,
    },

    taskCategory: {
      fontSize: 16,

      color:
        "#6B7280",

      marginBottom: 20,
    },

    openButton: {
      backgroundColor:
        "#2563EB",

      paddingVertical: 16,

      borderRadius: 18,

      alignItems:
        "center",
    },
  });