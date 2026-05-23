import { auth, db } from "../firebaseConfig";

import {
  useContext,
  useState,
  useEffect,
} from "react";

import {
  TaskContext,
} from "../context/TaskContext";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";

import * as Linking from "expo-linking";

import {
  NotificationContext,
} from "../context/NotificationContext";

import * as Location from "expo-location";

import {
  doc,
  updateDoc,
  addDoc,
  collection,
  increment,
  serverTimestamp,
} from "firebase/firestore";

export default function TaskDetailScreen({
  route,
  navigation,
}) {
  const { task } =
    route.params;

  const {
    acceptTask,
    completeTask,
    updateTaskStatus,
  } =
    useContext(
      TaskContext
    );

  const {
    addNotification,
  } =
    useContext(
      NotificationContext
    );

  const [showReview, setShowReview] =
    useState(false);

  const [rating] =
    useState(5);

  const [review, setReview] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // GOOGLE MAPS
  const openMaps =
    () => {
      if (
        task.latitude ==
          null ||
        task.longitude ==
          null
      ) {
        return Alert.alert(
          "Ingen lokasjon funnet"
        );
      }

      const url = `https://www.google.com/maps/search/?api=1&query=${task.latitude},${task.longitude}`;

      Linking.openURL(
        url
      );
    };

  // STATUS COLOR
  const getStatusColor =
    () => {
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

  // STATUS TEXT
  const getStatusText =
    () => {
      switch (
        task.status
      ) {
        case "accepted":
          return "Akseptert";

        case "on_the_way":
          return "På vei";

        case "arrived":
          return "Ankommet";

        case "working":
          return "Utfører oppdrag";

        case "completed":
          return "Fullført";

        default:
          return "Åpen";
      }
    };

  // ACCEPT TASK
  const handleAcceptTask =
    async () => {
      try {
        setLoading(
          true
        );

        await acceptTask(
          task.id,
          "Hjelper"
        );

        addNotification(
          {
            title:
              "🎉 Noen vil hjelpe deg",

            message:
              "Oppdraget ditt ble akseptert",

            task,
          }
        );

        navigation.navigate(
          "Chat",
          {
            task,
          }
        );
      } catch (e) {
        console.log(
          e
        );

        Alert.alert(
          "Noe gikk galt"
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  // COMPLETE TASK
  const handleCompleteTask =
    async () => {
      try {
        setLoading(
          true
        );

        await completeTask(
          task.id
        );

        Alert.alert(
          "Oppdrag fullført 🎉"
        );
      } catch (e) {
        console.log(
          e
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor:
          "#F4F6F8",
      }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: 60,
        paddingBottom: 60,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* IMAGE */}
      {task.image ? (
        <Image
          source={{
            uri:
              task.image,
          }}
          style={{
            width:
              "100%",
            height: 260,
            borderRadius: 28,
            marginBottom: 25,
          }}
        />
      ) : null}

      {/* STATUS */}
      <View
        style={{
          backgroundColor:
            getStatusColor(),
          padding: 14,
          borderRadius: 18,
          alignSelf:
            "flex-start",
          marginBottom: 20,
        }}
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
          {getStatusText()}
        </Text>
      </View>

      {/* TITLE */}
      <Text
        style={{
          fontSize: 32,
          fontWeight:
            "bold",
          color:
            "#111827",
          marginBottom: 15,
        }}
      >
        {task.title}
      </Text>

      {/* DESCRIPTION */}
      <View
        style={{
          backgroundColor:
            "white",
          padding: 22,
          borderRadius: 24,
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 17,
            color:
              "#374151",
            lineHeight: 28,
          }}
        >
          {task.description ||
            "Ingen beskrivelse"}
        </Text>
      </View>

      {/* STATUS BUTTONS */}

      {task.status ===
        "accepted" && (
        <TouchableOpacity
          style={{
            backgroundColor:
              "#2563EB",
            padding: 18,
            borderRadius: 20,
            alignItems:
              "center",
            marginBottom: 14,
          }}
          onPress={() =>
            updateTaskStatus(
              task.id,
              "on_the_way"
            )
          }
        >
          <Text
            style={{
              color:
                "white",
              fontSize: 18,
              fontWeight:
                "bold",
            }}
          >
            På vei
          </Text>
        </TouchableOpacity>
      )}

      {task.status ===
        "on_the_way" && (
        <TouchableOpacity
          style={{
            backgroundColor:
              "#8B5CF6",
            padding: 18,
            borderRadius: 20,
            alignItems:
              "center",
            marginBottom: 14,
          }}
          onPress={() =>
            updateTaskStatus(
              task.id,
              "arrived"
            )
          }
        >
          <Text
            style={{
              color:
                "white",
              fontSize: 18,
              fontWeight:
                "bold",
            }}
          >
            Ankommet
          </Text>
        </TouchableOpacity>
      )}

      {task.status ===
        "arrived" && (
        <TouchableOpacity
          style={{
            backgroundColor:
              "#EC4899",
            padding: 18,
            borderRadius: 20,
            alignItems:
              "center",
            marginBottom: 14,
          }}
          onPress={() =>
            updateTaskStatus(
              task.id,
              "working"
            )
          }
        >
          <Text
            style={{
              color:
                "white",
              fontSize: 18,
              fontWeight:
                "bold",
            }}
          >
            Utfører oppdrag
          </Text>
        </TouchableOpacity>
      )}

      {/* USER */}
      <View
        style={{
          backgroundColor:
            "white",
          padding: 22,
          borderRadius: 24,
          marginBottom: 40,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight:
              "bold",
            marginBottom: 10,
          }}
        >
          {task.creatorName ||
            task.createdByName ||
            task.email?.split(
              "@"
            )[0] ||
            "Bruker"}
        </Text>

        <Text
          style={{
            fontSize: 16,
            color:
              "#6B7280",
          }}
        >
          ⭐ Trusted user
        </Text>
      </View>

      {/* ACCEPT */}
      {!task.accepted &&
        !task.completed && (
          <TouchableOpacity
            disabled={
              loading
            }
            onPress={
              handleAcceptTask
            }
            style={{
              backgroundColor:
                "#22C55E",
              padding: 24,
              borderRadius: 24,
              alignItems:
                "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                color:
                  "white",
                fontSize: 24,
                fontWeight:
                  "bold",
              }}
            >
              Jeg kan hjelpe
            </Text>
          </TouchableOpacity>
        )}

      {/* COMPLETE */}
      {task.status ===
        "working" && (
        <TouchableOpacity
          disabled={
            loading
          }
          onPress={
            handleCompleteTask
          }
          style={{
            backgroundColor:
              "#22C55E",
            padding: 22,
            borderRadius: 24,
            alignItems:
              "center",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color:
                "white",
              fontSize: 20,
              fontWeight:
                "bold",
            }}
          >
            Fullfør oppdrag
          </Text>
        </TouchableOpacity>
      )}

      {/* MAPS */}
      <TouchableOpacity
        onPress={
          openMaps
        }
        style={{
          backgroundColor:
            "#111827",
          padding: 20,
          borderRadius: 20,
          alignItems:
            "center",
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            color:
              "white",
            fontSize: 18,
            fontWeight:
              "bold",
          }}
        >
          Åpne i Google Maps
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}