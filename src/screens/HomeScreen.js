import React, {
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

import MapView, {
  Marker,
} from "react-native-maps";

import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
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

          if (
            status !==
            "granted"
          ) {
            return;
          }

          const currentLocation =
            await Location.getCurrentPositionAsync(
              {
                accuracy:
                  Location.Accuracy.High,
              }
            );

          setLocation(
            currentLocation.coords
          );

          subscription =
            await Location.watchPositionAsync(
              {
                accuracy:
                  Location.Accuracy.High,

                timeInterval: 5000,

                distanceInterval: 5,
              },

              (
                newLocation
              ) => {
                setLocation(
                  newLocation.coords
                );
              }
            );
        } catch (e) {
          console.log(e);
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
            location.latitude,

          longitude:
            location.longitude,

          latitudeDelta:
            0.02,

          longitudeDelta:
            0.02,
        },

        1000
      );
    };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        followsUserLocation
        initialRegion={{
          latitude:
            location
              ?.latitude ||
            59.9139,

          longitude:
            location
              ?.longitude ||
            10.7522,

          latitudeDelta:
            0.05,

          longitudeDelta:
            0.05,
        }}
      >
        {/* 🔥 TASK MARKERS */}
        {tasks
          .filter(
            (
              task
            ) =>
              task &&
              task.latitude !=
                null &&
              task.longitude !=
                null
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
                title={
                  task.title ||
                  "Oppdrag"
                }
                description={
                  task.reward ||
                  ""
                }
                pinColor={
                  task.accepted
                    ? "#22C55E"
                    : "#EF4444"
                }
                onPress={() =>
                  navigation.navigate(
                    "TaskDetail",
                    {
                      task,
                    }
                  )
                }
              />
            )
          )}

        {/* 🔥 LIVE HELPER */}
        {tasks
          .filter(
            (
              task
            ) =>
              task.accepted &&
              task.helperLatitude !=
                null &&
              task.helperLongitude !=
                null
          )
          .map(
            (task) => (
              <Marker
                key={`helper-${task.id}`}
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
                title="Hjelper"
                description={
                  task.acceptedBy ||
                  ""
                }
                pinColor="#2563EB"
              />
            )
          )}
      </MapView>

      {/* 🔥 BUTTON */}
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
          Min posisjon
        </Text>
      </TouchableOpacity>
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

      bottom: 40,

      right: 20,

      backgroundColor:
        "#111827",

      paddingVertical: 14,

      paddingHorizontal: 20,

      borderRadius: 18,

      elevation: 5,
    },
  });