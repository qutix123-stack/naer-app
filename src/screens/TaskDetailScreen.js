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
} from "react-native";

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

  console.log(
    "TASK ID:",
    taskId
  );

  console.log(
    "TYPEOF TASKID:",
    typeof taskId
  );

  if (!taskId) {

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
        }}
      >

        <Text
          style={{
            fontSize: 18,

            color: "#111827",
          }}
        >
          Task mangler ID
        </Text>

      </View>
    );
  }

  const [task, setTask] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [accepting, setAccepting] =
    useState(false);

  // LOAD TASK

  useEffect(() => {

    const loadTask =
      async () => {

        try {

          console.log(
            "FETCHING TASK:",
            taskId
          );

          const ref =
            doc(
              db,
              "tasks",
              String(taskId)
            );

          const snapshot =
            await getDoc(ref);

          console.log(
            "SNAPSHOT EXISTS:",
            snapshot.exists()
          );

          if (
            snapshot.exists()
          ) {

            const data =
              snapshot.data();

            console.log(
              "TASK DATA:",
              JSON.stringify(data)
            );

            setTask({
              id:
                snapshot.id,

              ...data,
            });

          } else {

            console.log(
              "TASK NOT FOUND"
            );

            Alert.alert(
              "Oppdrag finnes ikke"
            );
          }

        } catch (e) {

          console.log(
            "TASK DETAIL ERROR FULL:",
            JSON.stringify(e)
          );

          console.log(
            "TASK DETAIL ERROR:",
            e
          );

          Alert.alert(
            "Kunne ikke laste oppdrag"
          );

        } finally {

          setLoading(false);
        }
      };

    loadTask();

  }, []);

  // ACCEPT TASK

  const handleAcceptTask =
    async () => {

      try {

        if (!task?.id) {

          return Alert.alert(
            "Task mangler ID"
          );
        }

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

            acceptedAt:
              Date.now(),

            status:
              "accepted",
          }
        );

        Alert.alert(
          "Oppdrag akseptert 🔥"
        );

        navigation.goBack();

      } catch (e) {

        console.log(
          "ACCEPT ERROR:",
          e
        );

        Alert.alert(
          "Kunne ikke akseptere oppdrag"
        );

      } finally {

        setAccepting(false);
      }
    };

  // LOADING

  if (loading) {

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
        }}
      >

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

      </View>
    );
  }

  // NO TASK

  if (!task) {

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
        }}
      >

        <Text
          style={{
            fontSize: 18,

            color: "#111827",
          }}
        >
          Oppdrag finnes ikke
        </Text>

      </View>
    );
  }

  return (

    <View
      style={{
        flex: 1,

        backgroundColor:
          "#F4F6F8",
      }}
    >

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 140,
        }}

        showsVerticalScrollIndicator={
          false
        }
      >

        {/* IMAGE */}

        {task?.image ? (

          <Image
            source={{
              uri:
                task.image,
            }}

            style={{
              width: "100%",

              height: 280,
            }}

            resizeMode="cover"
          />

        ) : (

          <View
            style={{
              width: "100%",

              height: 280,

              backgroundColor:
                "#E5E7EB",

              justifyContent:
                "center",

              alignItems:
                "center",
            }}
          >

            <Text
              style={{
                fontSize: 50,
              }}
            >
              📦
            </Text>

          </View>
        )}

        {/* CONTENT */}

        <View
          style={{
            padding: 24,
          }}
        >

          {/* CATEGORY */}

          <View
            style={{
              alignSelf:
                "flex-start",

              backgroundColor:
                "#DBEAFE",

              paddingHorizontal: 14,

              paddingVertical: 8,

              borderRadius: 999,

              marginBottom: 18,
            }}
          >

            <Text
              style={{
                color: "#2563EB",

                fontWeight: "700",
              }}
            >
              {task?.category ||
                "Annet"}
            </Text>

          </View>

          {/* TITLE */}

          <Text
            style={{
              fontSize: 34,

              fontWeight: "bold",

              color: "#111827",

              marginBottom: 16,
            }}
          >
            {task?.title ||
              "Ingen tittel"}
          </Text>

          {/* PRICE */}

          <Text
            style={{
              fontSize: 28,

              fontWeight: "bold",

              color: "#22C55E",

              marginBottom: 24,
            }}
          >
            {task?.price
              ? `${task.price} kr`
              : task?.reward ||
                "0 kr"}
          </Text>

          {/* DESCRIPTION */}

          <Text
            style={{
              fontSize: 18,

              lineHeight: 30,

              color: "#374151",

              marginBottom: 32,
            }}
          >
            {task?.description ||
              "Ingen beskrivelse"}
          </Text>

          {/* CREATOR */}

          <View
            style={{
              backgroundColor:
                "#FFFFFF",

              padding: 22,

              borderRadius: 24,

              marginBottom: 24,
            }}
          >

            <Text
              style={{
                color: "#6B7280",

                marginBottom: 8,
              }}
            >
              Opprettet av
            </Text>

            <Text
              style={{
                fontSize: 18,

                fontWeight: "700",

                color: "#111827",
              }}
            >
              {task?.creatorName ||
                "Bruker"}
            </Text>

          </View>

          {/* LOCATION */}

          <View
            style={{
              backgroundColor:
                "#FFFFFF",

              padding: 22,

              borderRadius: 24,

              marginBottom: 30,
            }}
          >

            <Text
              style={{
                fontSize: 18,

                fontWeight: "700",

                color: "#111827",

                marginBottom: 8,
              }}
            >
              Lokasjon
            </Text>

            <Text
              style={{
                color: "#6B7280",
              }}
            >
              GPS registrert
            </Text>

          </View>

          {/* ACCEPT BUTTON */}

          {!task?.accepted && (

            <TouchableOpacity
              disabled={
                accepting
              }

              onPress={
                handleAcceptTask
              }

              style={{
                backgroundColor:
                  accepting
                    ? "#93C5FD"
                    : "#2563EB",

                padding: 24,

                borderRadius: 28,

                alignItems:
                  "center",
              }}
            >

              {accepting ? (

                <ActivityIndicator
                  color="white"
                />

              ) : (

                <Text
                  style={{
                    color:
                      "#FFFFFF",

                    fontSize: 22,

                    fontWeight:
                      "bold",
                  }}
                >
                  Aksepter oppdrag
                </Text>
              )}

            </TouchableOpacity>
          )}

        </View>

      </ScrollView>

      {/* LOADING OVERLAY */}

      {accepting && (

        <View
          style={{
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
              "rgba(255,255,255,0.35)",

            zIndex: 999,
          }}
        >

          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

        </View>
      )}

    </View>
  );
}