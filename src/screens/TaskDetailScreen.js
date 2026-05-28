import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  LinearGradient,
} from "expo-linear-gradient";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebaseConfig";

export default function TaskDetailScreen({
  route,
  navigation,
}) {

  const taskId =
    route?.params?.taskId;

  const [task, setTask] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [accepting, setAccepting] =
    useState(false);

  const [completing, setCompleting] =
    useState(false);

  useEffect(() => {

    loadTask();

  }, []);

  const loadTask =
    async () => {

      try {

        const ref =
          doc(
            db,
            "tasks",
            String(taskId)
          );

        const snapshot =
          await getDoc(ref);

        if (
          snapshot.exists()
        ) {

          setTask({
            id:
              snapshot.id,

            ...snapshot.data(),
          });

        } else {

          Alert.alert(
            "Oppdrag finnes ikke"
          );
        }

      } catch (e) {

        console.log(e);

      } finally {

        setLoading(false);
      }
    };

  // ACCEPT

  const handleAccept =
    async () => {

      try {

        setAccepting(true);

        await updateDoc(
          doc(
            db,
            "tasks",
            task.id
          ),

          {
            accepted: true,

            acceptedBy:
              auth.currentUser?.uid,

            acceptedByName:
              auth.currentUser
                ?.displayName ||

              "Bruker",

            acceptedAt:
              Date.now(),

            status:
              "accepted",
          }
        );

        Alert.alert(
          "Oppdrag akseptert 🔥"
        );

        loadTask();

      } catch (e) {

        console.log(e);

      } finally {

        setAccepting(false);
      }
    };

  // COMPLETE

  const completeTask =
    async () => {

      try {

        setCompleting(true);

        await updateDoc(
          doc(
            db,
            "tasks",
            task.id
          ),

          {
            completed:
              true,

            completedAt:
              Date.now(),

            status:
              "completed",
          }
        );

        navigation.navigate(
          "Review",

          {
            taskId:
              task.id,

            taskTitle:
              task.title,

            toUserEmail:

              auth.currentUser?.uid ===
              task.ownerId

                ? task.acceptedByEmail

                : task.creatorEmail,

            toUserName:

              auth.currentUser?.uid ===
              task.ownerId

                ? task.acceptedByName

                : task.creatorName,
          }
        );

      } catch (e) {

        console.log(e);

      } finally {

        setCompleting(false);
      }
    };

  // LOADING

  if (loading) {

    return (

      <View
        style={
          styles.center
        }
      >

        <ActivityIndicator
          size="large"
          color="#22C55E"
        />

      </View>
    );
  }

  if (!task) {

    return (

      <View
        style={
          styles.center
        }
      >

        <Text>
          Oppdrag finnes ikke
        </Text>

      </View>
    );
  }

  const isAccepted =
    task?.accepted;

  const isCompleted =
    task?.completed;

  const isOwner =
    auth.currentUser?.uid ===
    task?.ownerId;

  const canComplete =

    isAccepted &&
    !isCompleted &&

    (
      isOwner ||

      auth.currentUser?.uid ===
      task?.acceptedBy
    );

  return (

    <View
      style={
        styles.container
      }
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={{
          paddingBottom: 180,
        }}
      >

        {/* HERO IMAGE */}

        <View
          style={
            styles.hero
          }
        >

          {task?.image ? (

            <Image
              source={{
                uri:
                  task.image,
              }}

              style={
                styles.image
              }
            />

          ) : (

            <View
              style={
                styles.placeholder
              }
            >

              <Ionicons
                name="image-outline"
                size={64}
                color="#9CA3AF"
              />

            </View>
          )}

          {/* OVERLAY */}

          <LinearGradient
            colors={[
              "transparent",
              "rgba(0,0,0,0.78)",
            ]}

            style={
              styles.overlay
            }
          />

          {/* TOP BAR */}

          <View
            style={
              styles.topBar
            }
          >

            <TouchableOpacity
              activeOpacity={0.9}

              style={
                styles.topButton
              }

              onPress={() =>
                navigation.goBack()
              }
            >

              <Ionicons
                name="arrow-back"
                size={22}
                color="#111827"
              />

            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}

              style={
                styles.topButton
              }
            >

              <Ionicons
                name="heart-outline"
                size={22}
                color="#111827"
              />

            </TouchableOpacity>

          </View>

          {/* HERO CONTENT */}

          <View
            style={
              styles.heroContent
            }
          >

            {/* STATUS */}

            {isCompleted ? (

              <View
                style={
                  styles.completedBadge
                }
              >

                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#16A34A"
                />

                <Text
                  style={
                    styles.completedText
                  }
                >
                  Fullført
                </Text>

              </View>

            ) : isAccepted ? (

              <View
                style={
                  styles.acceptedBadge
                }
              >

                <Ionicons
                  name="flash"
                  size={16}
                  color="#2563EB"
                />

                <Text
                  style={
                    styles.acceptedText
                  }
                >
                  Akseptert
                </Text>

              </View>

            ) : (

              <View
                style={
                  styles.categoryBadge
                }
              >

                <Text
                  style={
                    styles.categoryText
                  }
                >
                  {task?.category ||
                    "Diverse"}
                </Text>

              </View>
            )}

            <Text
              style={
                styles.title
              }
            >
              {task?.title}
            </Text>

            <View
              style={
                styles.heroMeta
              }
            >

              <Text
                style={
                  styles.meta
                }
              >
                📍 2 km unna
              </Text>

              <Text
                style={
                  styles.meta
                }
              >
                Aktiv nå
              </Text>

            </View>

          </View>

        </View>

        {/* CONTENT */}

        <View
          style={
            styles.content
          }
        >

          {/* PRICE */}

          <View
            style={
              styles.priceCard
            }
          >

            <Text
              style={
                styles.priceLabel
              }
            >
              Pris
            </Text>

            <Text
              style={
                styles.price
              }
            >
              {task?.price ||
                0} kr
            </Text>

          </View>

          {/* DESCRIPTION */}

          <View
            style={
              styles.section
            }
          >

            <Text
              style={
                styles.sectionTitle
              }
            >
              Beskrivelse
            </Text>

            <Text
              style={
                styles.description
              }
            >
              {task?.description}
            </Text>

          </View>

          {/* USER */}

          <View
            style={
              styles.userCard
            }
          >

            <View
              style={
                styles.avatar
              }
            >

              <Ionicons
                name="person"
                size={24}
                color="#111827"
              />

            </View>

            <View
              style={{
                flex: 1,
              }}
            >

              <Text
                style={
                  styles.userLabel
                }
              >
                Opprettet av
              </Text>

              <Text
                style={
                  styles.userName
                }
              >
                {task?.creatorName ||
                  "Bruker"}
              </Text>

            </View>

            <View
              style={
                styles.ratingBadge
              }
            >

              <Text
                style={
                  styles.ratingText
                }
              >
                ⭐ 5.0
              </Text>

            </View>

          </View>

        </View>

      </ScrollView>

      {/* CTA */}

      {!isAccepted && (

        <TouchableOpacity
          activeOpacity={0.92}

          style={
            styles.acceptButton
          }

          disabled={
            accepting
          }

          onPress={
            handleAccept
          }
        >

          {accepting ? (

            <ActivityIndicator
              color="#FFFFFF"
            />

          ) : (

            <Text
              style={
                styles.acceptText
              }
            >
              Aksepter oppdrag
            </Text>
          )}

        </TouchableOpacity>
      )}

      {canComplete && (

        <TouchableOpacity
          activeOpacity={0.92}

          style={
            styles.completeButton
          }

          disabled={
            completing
          }

          onPress={
            completeTask
          }
        >

          {completing ? (

            <ActivityIndicator
              color="#FFFFFF"
            />

          ) : (

            <Text
              style={
                styles.completeText
              }
            >
              Fullfør oppdrag
            </Text>
          )}

        </TouchableOpacity>
      )}

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor:
        "#F8FAFC",
    },

    center: {

      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    hero: {

      height: 420,

      position:
        "relative",
    },

    image: {

      width: "100%",

      height: "100%",
    },

    placeholder: {

      width: "100%",

      height: "100%",

      backgroundColor:
        "#E5E7EB",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    overlay: {

      position:
        "absolute",

      left: 0,

      right: 0,

      bottom: 0,

      height: 220,
    },

    topBar: {

      position:
        "absolute",

      top:
        Platform.OS ===
        "android"

          ? 58

          : 70,

      left: 20,

      right: 20,

      flexDirection:
        "row",

      justifyContent:
        "space-between",
    },

    topButton: {

      width: 48,

      height: 48,

      borderRadius: 18,

      backgroundColor:
        "rgba(255,255,255,0.96)",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    heroContent: {

      position:
        "absolute",

      left: 24,

      right: 24,

      bottom: 34,
    },

    categoryBadge: {

      alignSelf:
        "flex-start",

      backgroundColor:
        "#22C55E",

      paddingHorizontal: 14,

      paddingVertical: 8,

      borderRadius: 999,

      marginBottom: 16,
    },

    categoryText: {

      color:
        "#FFFFFF",

      fontSize: 13,

      fontWeight: "700",
    },

    acceptedBadge: {

      alignSelf:
        "flex-start",

      backgroundColor:
        "#2563EB",

      paddingHorizontal: 14,

      paddingVertical: 8,

      borderRadius: 999,

      marginBottom: 16,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    acceptedText: {

      color:
        "#FFFFFF",

      marginLeft: 6,

      fontWeight: "700",
    },

    completedBadge: {

      alignSelf:
        "flex-start",

      backgroundColor:
        "#16A34A",

      paddingHorizontal: 14,

      paddingVertical: 8,

      borderRadius: 999,

      marginBottom: 16,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    completedText: {

      color:
        "#FFFFFF",

      marginLeft: 6,

      fontWeight: "700",
    },

    title: {

      fontSize: 34,

      fontWeight: "800",

      color:
        "#FFFFFF",

      lineHeight: 42,

      marginBottom: 14,
    },

    heroMeta: {

      flexDirection:
        "row",
    },

    meta: {

      color:
        "rgba(255,255,255,0.88)",

      fontSize: 14,

      fontWeight: "600",

      marginRight: 18,
    },

    content: {

      padding: 22,
    },

    priceCard: {

      backgroundColor:
        "#FFFFFF",

      borderRadius: 28,

      padding: 22,

      marginTop: -54,

      marginBottom: 22,

      shadowColor:
        "#000",

      shadowOpacity: 0.08,

      shadowRadius: 18,

      elevation: 6,
    },

    priceLabel: {

      fontSize: 14,

      color:
        "#6B7280",

      marginBottom: 8,
    },

    price: {

      fontSize: 34,

      fontWeight: "800",

      color:
        "#22C55E",
    },

    section: {

      backgroundColor:
        "#FFFFFF",

      borderRadius: 28,

      padding: 22,

      marginBottom: 22,
    },

    sectionTitle: {

      fontSize: 18,

      fontWeight: "800",

      color:
        "#111827",

      marginBottom: 14,
    },

    description: {

      fontSize: 15,

      color:
        "#4B5563",

      lineHeight: 28,
    },

    userCard: {

      backgroundColor:
        "#FFFFFF",

      borderRadius: 28,

      padding: 20,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    avatar: {

      width: 58,

      height: 58,

      borderRadius: 22,

      backgroundColor:
        "#F3F4F6",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight: 16,
    },

    userLabel: {

      fontSize: 13,

      color:
        "#9CA3AF",

      marginBottom: 4,
    },

    userName: {

      fontSize: 17,

      fontWeight: "700",

      color:
        "#111827",
    },

    ratingBadge: {

      backgroundColor:
        "#FEF3C7",

      paddingHorizontal: 12,

      paddingVertical: 8,

      borderRadius: 14,
    },

    ratingText: {

      fontWeight: "700",

      color:
        "#92400E",
    },

    acceptButton: {

      position:
        "absolute",

      left: 20,

      right: 20,

      bottom: 38,

      backgroundColor:
        "#22C55E",

      borderRadius: 24,

      paddingVertical: 20,

      alignItems:
        "center",

      shadowColor:
        "#22C55E",

      shadowOpacity: 0.25,

      shadowRadius: 12,

      elevation: 8,
    },

    acceptText: {

      color:
        "#FFFFFF",

      fontSize: 17,

      fontWeight: "800",
    },

    completeButton: {

      position:
        "absolute",

      left: 20,

      right: 20,

      bottom: 38,

      backgroundColor:
        "#2563EB",

      borderRadius: 24,

      paddingVertical: 20,

      alignItems:
        "center",

      shadowColor:
        "#2563EB",

      shadowOpacity: 0.25,

      shadowRadius: 12,

      elevation: 8,
    },

    completeText: {

      color:
        "#FFFFFF",

      fontSize: 17,

      fontWeight: "800",
    },
  });