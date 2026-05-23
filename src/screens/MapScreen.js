import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import MapView, {
  Marker,
} from "react-native-maps";

import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { TaskContext } from "../context/TaskContext";

export default function MapScreen({
  navigation,
}) {
  const { tasks } =
    useContext(TaskContext);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    console.log(
      "TASKS:",
      tasks
    );

    setTimeout(() => {
      setLoading(false);
    }, 1200);
  }, []);

  // TEMP TEST DATA
  const demoTasks = [
    {
      id: "1",
      title: "Hjelp med sofa",
      latitude: 59.9139,
      longitude: 10.7522,
    },

    {
      id: "2",
      title: "Handle mat",
      latitude: 59.918,
      longitude: 10.758,
    },

    {
      id: "3",
      title: "Hundepass",
      latitude: 59.909,
      longitude: 10.745,
    },

    {
      id: "4",
      title: "Bære TV",
      latitude: 59.921,
      longitude: 10.764,
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

          <Text
            style={
              styles.loadingText
            }
          >
            Laster kart...
          </Text>
        </View>
      )}

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 59.9139,
          longitude: 10.7522,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        mapType="standard"
        loadingEnabled={false}
        showsUserLocation={false}
        showsMyLocationButton={
          false
        }
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
      >
        {demoTasks.map(
          (task) => (
            <Marker
              key={task.id}
              coordinate={{
                latitude:
                  task.latitude,
                longitude:
                  task.longitude,
              }}
              title={task.title}
              description="Trykk for detaljer"
              pinColor="#2563EB"
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
      </MapView>

      {/* TOP CARD */}
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
          Live oppdrag
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          {
            demoTasks.length
          }{" "}
          aktive oppdrag
        </Text>
      </View>

      {/* RELOAD BUTTON */}
      <TouchableOpacity
        style={
          styles.reloadButton
        }
        onPress={() =>
          navigation.replace(
            "Map"
          )
        }
      >
        <Text
          style={
            styles.reloadText
          }
        >
          📍
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F4F6F8",
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
        "#F4F6F8",

      zIndex: 999,
    },

    loadingText: {
      marginTop: 20,

      fontSize: 16,

      color:
        "#6B7280",
    },

    topCard: {
      position:
        "absolute",

      top: 60,

      left: 20,

      right: 20,

      backgroundColor:
        "white",

      padding: 22,

      borderRadius: 28,

      elevation: 6,
    },

    title: {
      fontSize: 24,

      fontWeight:
        "bold",

      color:
        "#111827",
    },

    subtitle: {
      marginTop: 6,

      fontSize: 17,

      color:
        "#6B7280",
    },

    reloadButton: {
      position:
        "absolute",

      right: 22,

      bottom: 120,

      width: 70,

      height: 70,

      borderRadius: 35,

      backgroundColor:
        "#0B1437",

      justifyContent:
        "center",

      alignItems:
        "center",

      elevation: 8,
    },

    reloadText: {
      color: "white",

      fontSize: 22,
    },
  });