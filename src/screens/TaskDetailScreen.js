import React, {
  useContext,
  useState,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";

import * as Linking from "expo-linking";
import * as Location from "expo-location";

import {
  auth,
  db,
} from "../firebaseConfig";

import {
  TaskContext,
} from "../context/TaskContext";

import {
  NotificationContext,
} from "../context/NotificationContext";

import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function TaskDetailScreen({
  route,
  navigation,
}) {
  const { task } = route.params;

  const isOwner =
    task?.createdBy ===
    auth.currentUser?.uid;

  const {
    acceptTask,
    completeTask,
  } = useContext(TaskContext);

  const {
    addNotification,
  } = useContext(NotificationContext);

  const [loading, setLoading] =
    useState(false);

  const [showReview, setShowReview] =
    useState(false);

  const [rating, setRating] =
    useState(5);

  const [reviewText, setReviewText] =
    useState("");

  // REVIEW

  const submitReview = async () => {
    if (!reviewText.trim()) {
      return Alert.alert(
        "Skriv en review"
      );
    }

    try {
      await addDoc(
        collection(db, "reviews"),
        {
          taskId: task.id,
          rating,
          text: reviewText,
          from: auth.currentUser.uid,
          to: task.acceptedById,
          createdAt:
            serverTimestamp(),
        }
      );

      setShowReview(false);

      Alert.alert(
        "Review sendt ⭐"
      );
    } catch (e) {
      console.log(
        "REVIEW ERROR:",
        e
      );

      Alert.alert(
        "Kunne ikke sende review"
      );
    }
  };

  // LIVE TRACKING

  const startLiveTracking =
    async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (
          status !== "granted"
        ) {
          return;
        }

        const subscription =
          await Location.watchPositionAsync(
            {
              accuracy:
                Location.Accuracy.Balanced,

              timeInterval: 4000,

              distanceInterval: 8,
            },

            async (
              location
            ) => {
              try {
                await updateDoc(
                  doc(
                    db,
                    "tasks",
                    task.id
                  ),

                  {
                    helperLatitude:
                      location.coords.latitude,

                    helperLongitude:
                      location.coords.longitude,

                    trackingActive:
                      true,
                  }
                );
              } catch (e) {
                console.log(
                  "TRACK UPDATE ERROR:",
                  e
                );
              }
            }
          );

        setTimeout(() => {
          subscription.remove();
        }, 1000 * 60 * 60);
      } catch (e) {
        console.log(
          "TRACK ERROR:",
          e
        );
      }
    };

  // DELETE TASK

  const deleteTask =
    async () => {
      Alert.alert(
        "Slett oppdrag",
        "Er du sikker?",

        [
          {
            text:
              "Avbryt",

            style:
              "cancel",
          },

          {
            text:
              "Slett",

            style:
              "destructive",

            onPress:
              async () => {
                try {
                  await deleteDoc(
                    doc(
                      db,
                      "tasks",
                      task.id
                    )
                  );

                  Alert.alert(
                    "Oppdrag slettet"
                  );

                  navigation.goBack();
                } catch (e) {
                  console.log(
                    "DELETE ERROR:",
                    e
                  );

                  Alert.alert(
                    "Feil ved sletting"
                  );
                }
              },
          },
        ]
      );
    };

  // MAPS

  const openMaps = () => {
    if (
      !task?.latitude ||
      !task?.longitude
    ) {
      return Alert.alert(
        "Ingen lokasjon funnet"
      );
    }

    const url =
      `https://www.google.com/maps/search/?api=1&query=${task.latitude},${task.longitude}`;

    Linking.openURL(url);
  };

  // STATUS

  const getStatusColor =
    () => {
      switch (
        task?.status
      ) {
        case "accepted":
          return "#F59E0B";

        case "working":
          return "#EC4899";

        case "completed":
          return "#22C55E";

        default:
          return "#EF4444";
      }
    };

  const getStatusText =
    () => {
      switch (
        task?.status
      ) {
        case "accepted":
          return "Akseptert";

        case "working":
          return "Utfører oppdrag";

        case "completed":
          return "Fullført";

        default:
          return "Åpen";
      }
    };

  const getTimeAgo = (
    timestamp
  ) => {
    if (!timestamp)
      return "Nettopp";

    let time = timestamp;

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

  const getDistance = () => {
    return "2 km unna";
  };

  // ACCEPT

  const handleAcceptTask =
    async () => {
      try {
        setLoading(true);

        await acceptTask(
          task.id,

          auth.currentUser
            ?.displayName ||
            "Hjelper"
        );

        await startLiveTracking();

        addNotification({
          title:
            "🎉 Oppdrag akseptert",

          message:
            "Noen vil hjelpe deg",

          task,
        });

        navigation.push(
          "Chat",
          {
            taskId:
              task.id,
          }
        );
      } catch (e) {
        console.log(
          "ACCEPT ERROR:",
          e
        );

        Alert.alert(
          "Noe gikk galt"
        );
      } finally {
        setLoading(false);
      }
    };

  // COMPLETE

  const handleCompleteTask =
    async () => {
      try {
        setLoading(true);

        await completeTask(
          task.id
        );

        setShowReview(true);
      } catch (e) {
        console.log(
          "COMPLETE ERROR:",
          e
        );
      } finally {
        setLoading(false);
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
        padding: 22,
        paddingTop: 60,
        paddingBottom: 180,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* IMAGE */}

      {task?.image ? (
        <Image
          source={{
            uri: task.image,
          }}
          style={{
            width: "100%",
            height: 280,
            borderRadius: 32,
            marginBottom: 24,
          }}
        />
      ) : null}

      {/* STATUS */}

      <View
  style={{
    marginBottom: 26,
  }}
>

  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    }}
  >

    <View
      style={{
        backgroundColor:
          getStatusColor(),

        paddingHorizontal: 14,

        paddingVertical: 8,

        borderRadius: 99,
      }}
    >
      <Text
        style={{
          color: "white",
          fontWeight: "700",
          fontSize: 13,
        }}
      >
        {getStatusText()}
      </Text>
    </View>

    {task?.urgent && (
      <View
        style={{
          backgroundColor:
            "#FEE2E2",

          marginLeft: 10,

          paddingHorizontal: 12,

          paddingVertical: 8,

          borderRadius: 99,
        }}
      >
        <Text
          style={{
            color: "#DC2626",
            fontWeight: "700",
            fontSize: 13,
          }}
        >
          Haster
        </Text>
      </View>
    )}

  </View>

  <Text
    style={{
      fontSize: 34,
      fontWeight: "800",
      color: "#111827",
      marginBottom: 12,
      lineHeight: 40,
    }}
  >
    {task?.title}
  </Text>

  <Text
    style={{
      fontSize: 42,
      fontWeight: "800",
      color: "#22C55E",
      marginBottom: 18,
    }}
  >
    {task?.reward || "0 kr"}
  </Text>

  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
    }}
  >
    <Text
      style={{
        color: "#6B7280",
        fontSize: 15,
      }}
    >
      📍 {getDistance()} •{" "}
      {getTimeAgo(
        task.createdAt
      )}
    </Text>
  </View>

</View>

      {/* DESCRIPTION */}

      <View
        style={{
          backgroundColor:
            "white",

          padding: 24,

          borderRadius: 28,

          marginBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 18,

            color:
              "#374151",

            lineHeight: 28,
          }}
        >
          {task?.description ||
            "Ingen beskrivelse"}
        </Text>
      </View>

      {/* USER */}

      <View
  style={{
    backgroundColor:
      "rgba(255,255,255,0.96)",

    padding: 22,

    borderRadius: 30,

    marginBottom: 30,

    flexDirection: "row",

    alignItems: "center",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.8)",
  }}
>

  <View>

    <View
      style={{
        width: 72,
        height: 72,
        borderRadius: 36,

        backgroundColor:
          "#2563EB",

        justifyContent:
          "center",

        alignItems:
          "center",

        marginRight: 18,
      }}
    >
      <Text
        style={{
          color: "white",

          fontSize: 28,

          fontWeight: "800",
        }}
      >
        {task?.creatorName?.charAt(
          0
        ) || "A"}
      </Text>
    </View>

    <View
      style={{
        position: "absolute",

        bottom: 2,

        right: 14,

        width: 24,

        height: 24,

        borderRadius: 12,

        backgroundColor:
          "#22C55E",

        justifyContent:
          "center",

        alignItems:
          "center",

        borderWidth: 2,

        borderColor: "white",
      }}
    >
      <Text
        style={{
          color: "white",

          fontSize: 12,

          fontWeight: "bold",
        }}
      >
        ✓
      </Text>
    </View>

  </View>

  <View
    style={{
      flex: 1,
    }}
  >

    <Text
      style={{
        fontSize: 15,

        color: "#6B7280",

        marginBottom: 6,
      }}
    >
      Opprettet av
    </Text>

    <Text
      style={{
        fontSize: 24,

        fontWeight: "800",

        color: "#111827",
      }}
    >
      {task?.creatorName ||
        "Anonym"}
    </Text>

    <Text
      style={{
        color: "#F59E0B",

        marginTop: 6,

        fontWeight: "700",
      }}
    >
      ⭐ {task?.creatorRating || 5}
    </Text>

  </View>

</View>

      {/* ACCEPT */}

      {/* ACCEPT */}

{!isOwner &&
!task?.acceptedById &&
!task?.completed && (

  <View
    style={{
      position: "absolute",

      left: 20,

      right: 20,

      bottom: 40,
    }}
  >

    <TouchableOpacity
      disabled={loading}
      onPress={
        handleAcceptTask
      }

      activeOpacity={0.9}

      style={{
        backgroundColor:
          "#22C55E",

        height: 74,

        borderRadius: 28,

        justifyContent:
          "center",

        alignItems:
          "center",

        marginBottom: 22,

        shadowColor:
          "#22C55E",

        shadowOpacity: 0.35,

        shadowRadius: 18,

        elevation: 12,
      }}
    >

      {loading ? (

        <ActivityIndicator
          color="white"
        />

      ) : (

        <View
          style={{
            flexDirection:
              "row",

            alignItems:
              "center",
          }}
        >

          <Text
            style={{
              color:
                "white",

              fontSize: 22,

              fontWeight:
                "800",

              marginRight: 10,
            }}
          >
            Jeg kan hjelpe
          </Text>

          <Text
            style={{
              fontSize: 24,
            }}
          >
            →
          </Text>

        </View>
      )}

    </TouchableOpacity>

  </View>
)}

      {/* COMPLETE */}

      {task?.status ===
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

            padding: 24,

            borderRadius: 28,

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
            "#0B1437",

          padding: 22,

          borderRadius: 24,

          alignItems:
            "center",
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
          Åpne i Google Maps
        </Text>
      </TouchableOpacity>

      {/* DELETE */}

      {isOwner ? (
        <TouchableOpacity
          onPress={
            deleteTask
          }
          style={{
            backgroundColor:
              "#EF4444",

            marginTop: 16,

            height: 65,

            borderRadius: 22,

            justifyContent:
              "center",

            alignItems:
              "center",
          }}
        >
          <Text
            style={{
              color:
                "white",

              fontSize: 22,

              fontWeight:
                "bold",
            }}
          >
            Slett oppdrag
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* REVIEW MODAL */}

      <Modal
        visible={
          showReview
        }
        transparent
        animationType="slide"
      >
        <View
          style={{
            flex: 1,

            backgroundColor:
              "rgba(0,0,0,0.4)",

            justifyContent:
              "center",

            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor:
                "white",

              borderRadius: 28,

              padding: 24,
            }}
          >
            <Text
              style={{
                fontSize: 28,

                fontWeight:
                  "bold",

                marginBottom: 20,
              }}
            >
              Gi review ⭐
            </Text>

            <View
              style={{
                flexDirection:
                  "row",

                marginBottom: 24,
              }}
            >
              {[1,2,3,4,5].map(
                (star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() =>
                      setRating(star)
                    }
                  >
                    <Text
                      style={{
                        fontSize: 42,

                        marginRight: 8,
                      }}
                    >
                      {star <= rating
                        ? "⭐"
                        : "☆"}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <TextInput
              placeholder="Hvordan var hjelpen?"
              value={
                reviewText
              }
              onChangeText={
                setReviewText
              }
              multiline
              style={{
                backgroundColor:
                  "#F3F4F6",

                borderRadius: 18,

                padding: 18,

                height: 120,

                textAlignVertical:
                  "top",

                marginBottom: 24,
              }}
            />

            <TouchableOpacity
              onPress={
                submitReview
              }
              style={{
                backgroundColor:
                  "#2563EB",

                height: 62,

                borderRadius: 20,

                justifyContent:
                  "center",

                alignItems:
                  "center",

                marginBottom: 12,
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
                Send review
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setShowReview(false)
              }
              style={{
                alignItems:
                  "center",
              }}
            >
              <Text
                style={{
                  color:
                    "#6B7280",

                  fontSize: 16,
                }}
              >
                Lukk
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}