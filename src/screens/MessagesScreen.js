import React from "react";

import SkeletonMessageCard from "../components/SkeletonMessageCard";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import {
  useEffect,
  useState,
} from "react";

import { db, auth } from "../firebaseConfig";

export default function MessagesScreen({
  navigation,
}) {
  const [chatTasks, setChatTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // 🔥 LOAD CHATS
  useEffect(() => {
    try {
      const q = query(
        collection(
          db,
          "tasks"
        ),

        where(
          "accepted",
          "==",
          true
        )
      );

      const unsubscribe =
        onSnapshot(
          q,

          (
            snapshot
          ) => {
            try {
              const loadedTasks =
                snapshot.docs
                  .map(
                    (
                      document
                    ) => ({
                      id:
                        document.id,

                      ...document.data(),
                    })
                  )
                  .filter(
                    (
                      task
                    ) =>
                      task &&
                      task.id &&
                      (
                        task.createdBy ===
                          auth
                            .currentUser
                            ?.uid ||

                        task.acceptedById ===
                          auth
                            .currentUser
                            ?.uid
                      )
                  );

              setChatTasks(
                loadedTasks
              );

              setLoading(
                false
              );
            } catch (e) {
              console.log(
                "CHAT LOAD ERROR:",
                e
              );

              setLoading(
                false
              );
            }
          },

          (error) => {
            console.log(
              "SNAPSHOT ERROR:",
              error
            );

            setLoading(
              false
            );
          }
        );

      return unsubscribe;
    } catch (e) {
      console.log(
        "MESSAGES ERROR:",
        e
      );

      setLoading(
        false
      );
    }
  }, []);

  // 🔥 DELETE CHAT
  const deleteChat =
    async (
      taskId
    ) => {
      try {
        if (!taskId)
          return;

        await deleteDoc(
          doc(
            db,
            "tasks",
            taskId
          )
        );
      } catch (e) {
        console.log(
          "DELETE ERROR:",
          e
        );
      }
    };

  // 🔥 LONG PRESS
  const handleLongPress =
    (
      item
    ) => {
      if (
        !item ||
        !item.id
      ) {
        return;
      }

      Alert.alert(
        "Slett chat",

        "Vil du slette hele chatten?",

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
              () =>
                deleteChat(
                  item.id
                ),
          },
        ]
      );
    };

  // 🔥 LOADING
   // 🔥 LOADING
if (loading) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F4F6F8",
        paddingTop: 60,
        paddingHorizontal: 20,
      }}
    >
      <SkeletonMessageCard />
      <SkeletonMessageCard />
      <SkeletonMessageCard />
    </View>
  );
}

  return (
    <View
      style={{
        flex: 1,

        backgroundColor:
          "#F4F6F8",

        paddingTop: 60,

        paddingHorizontal: 20,
      }}
    >
      <Text
        style={{
          fontSize: 34,

          fontWeight:
            "bold",

          marginBottom: 30,

          color:
            "#111827",
        }}
      >
        Meldinger 💬
      </Text>

      {chatTasks.length ===
      0 ? (
        <View
          style={{
            flex: 1,

            justifyContent:
              "center",

            alignItems:
              "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,

              color:
                "#6B7280",

              textAlign:
                "center",
            }}
          >
            Ingen aktive chats enda 😄
          </Text>
        </View>
      ) : (
        <FlatList
          data={
            chatTasks ||
            []
          }
          keyExtractor={(
            item,
            index
          ) =>
            item?.id
              ? item.id.toString()
              : index.toString()
          }
          showsVerticalScrollIndicator={
            false
          }
          renderItem={({
            item,
          }) => {
            if (
              !item ||
              !item.id
            ) {
              return null;
            }

            return (
              <TouchableOpacity
                activeOpacity={
                  0.8
                }
                onPress={() => {
                  try {
                    navigation.navigate("Chat", {
  taskId: item.id,
})
                  } catch (e) {
                    console.log(
                      "CHAT NAV ERROR:",
                      e
                    );
                  }
                }}
                onLongPress={() =>
                  handleLongPress(
                    item
                  )
                }
                style={{
                  backgroundColor:
                    "white",

                  padding: 20,

                  borderRadius: 22,

                  marginBottom: 15,

                  shadowColor:
                    "#000",

                  shadowOpacity: 0.05,

                  shadowRadius: 8,

                  elevation: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,

                    fontWeight:
                      "bold",

                    color:
                      "#111827",

                    marginBottom: 8,
                  }}
                >
                  {item.title ||
                    "Ukjent oppdrag"}
                </Text>

                <Text
                  style={{
                    fontSize: 16,

                    color:
                      "#6B7280",

                    marginBottom: 8,
                  }}
                >
                  💰{" "}
                  {item.reward ||
                    "0 kr"}
                </Text>

                <Text
                  style={{
                    fontSize: 14,

                    color:
                      "#2563EB",
                  }}
                >
                  Trykk for å åpne chat →
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}