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

const getDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
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
    Math.sin(
      dLat / 2
    ) *
      Math.sin(
        dLat / 2
      ) +
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

  const [location, setLocation] =
    useState(null);

  const [showReview, setShowReview] =
    useState(false);

  const [rating] =
    useState(5);

  const [review, setReview] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // 🔥 GET LOCATION
  useEffect(() => {
    let subscription;

    const getLocation =
      async () => {
        try {
          const {
            status,
          } =
            await Location.requestForegroundPermissionsAsync();

          if (
            status !==
            "granted"
          )
            return;

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

                distanceInterval: 10,
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
          console.log(
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

  // 🔥 GOOGLE MAPS
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

  // 🔥 TIME AGO
  const getTimeAgo = (
    timestamp
  ) => {
    if (!timestamp)
      return "Nettopp";

    const now =
      Date.now();

    const time =
      timestamp?.seconds
        ? timestamp.seconds *
          1000
        : timestamp;

    const diff =
      now - time;

    const minutes =
      Math.floor(
        diff / 60000
      );

    if (
      minutes < 1
    )
      return "Nettopp";

    if (
      minutes < 60
    )
      return `${minutes} min siden`;

    const hours =
      Math.floor(
        minutes / 60
      );

    if (
      hours < 24
    )
      return `${hours} t siden`;

    const days =
      Math.floor(
        hours / 24
      );

    return `${days} dager siden`;
  };

  // 🔥 STATUS COLORS
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

  // 🔥 STATUS TEXT
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
          return "Utføres";

        case "completed":
          return "Fullført";

        default:
          return "Åpen";
      }
    };

  // 🔥 HANDLE ACCEPT
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

  // 🔥 HANDLE COMPLETE
  const handleCompleteTask =
    async () => {
      try {
        setLoading(
          true
        );

        await completeTask(
          task.id
        );

        setShowReview(
          true
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

  // 🔥 SUBMIT REVIEW
  const submitReview =
    async () => {
      try {
        if (
          !review.trim()
        ) {
          return Alert.alert(
            "Skriv en vurdering"
          );
        }

        setLoading(
          true
        );

        await addDoc(
          collection(
            db,
            "reviews"
          ),
          {
            taskId:
              task.id,

            review:
              review.trim(),

            rating,

            createdAt:
              serverTimestamp(),

            from:
              auth
                .currentUser
                ?.email,

            to:
              task.acceptedBy,
          }
        );

        if (
          task.acceptedById
        ) {
          await updateDoc(
            doc(
              db,
              "users",
              task.acceptedById
            ),
            {
              completedTasks:
                increment(
                  1
                ),
            }
          );
        }

        Alert.alert(
          "Takk for vurderingen ⭐"
        );

        setShowReview(
          false
        );

        setReview("");
      } catch (e) {
        console.log(
          e
        );

        Alert.alert(
          "Kunne ikke sende vurdering"
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

      {/* CATEGORY */}
      <View
        style={{
          backgroundColor:
            "#EFF6FF",

          paddingHorizontal: 14,

          paddingVertical: 10,

          borderRadius: 18,

          alignSelf:
            "flex-start",

          marginBottom: 18,
        }}
      >
        <Text
          style={{
            color:
              "#2563EB",

            fontWeight:
              "bold",
          }}
        >
          {task.category ||
            "Annet"}
        </Text>
      </View>

      {/* REWARD */}
      <Text
        style={{
          fontSize: 22,

          color:
            "#22C55E",

          fontWeight:
            "bold",

          marginBottom: 25,
        }}
      >
        💰{" "}
        {task.reward}
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
      {task.accepted &&
        !task.completed && (
          <>
            <TouchableOpacity
              onPress={() =>
                updateTaskStatus(
                  task.id,
                  "on_the_way"
                )
              }
              style={{
                backgroundColor:
                  "#2563EB",

                padding: 18,

                borderRadius: 20,

                alignItems:
                  "center",

                marginBottom: 14,
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
                På vei
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                updateTaskStatus(
                  task.id,
                  "arrived"
                )
              }
              style={{
                backgroundColor:
                  "#8B5CF6",

                padding: 18,

                borderRadius: 20,

                alignItems:
                  "center",

                marginBottom: 14,
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
                Ankommet
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                updateTaskStatus(
                  task.id,
                  "working"
                )
              }
              style={{
                backgroundColor:
                  "#EC4899",

                padding: 18,

                borderRadius: 20,

                alignItems:
                  "center",

                marginBottom: 14,
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
                Utfører oppdrag
              </Text>
            </TouchableOpacity>
          </>
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
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
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
            )}
          </TouchableOpacity>
        )}

      {/* COMPLETE */}
      {task.accepted &&
        !task.completed && (
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
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
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
            )}
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