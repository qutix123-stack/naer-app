import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  orderBy,
  limit,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../firebaseConfig";

import SkeletonMessageCard from "../components/SkeletonMessageCard";

export default function MessagesScreen({
  navigation,
}) {

  const [chatTasks, setChatTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  // TEMP UNREAD STATE

  const hasUnread =
    false;

  // LOAD CHATS

  useEffect(() => {

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

        async (snapshot) => {

          try {

            const loaded =
              await Promise.all(

                snapshot.docs

                  .map(
                    async (
                      document
                    ) => {

                      const task = {

                        id:
                          document.id,

                        ...document.data(),
                      };

                      // ONLY MY CHATS

                      const isMine =

                        task.ownerId ===
                        auth.currentUser?.uid ||

                        task.acceptedById ===
                        auth.currentUser?.uid;

                      if (!isMine)
                        return null;

                      // LOAD LAST MESSAGE

                      const messagesQuery =
                        query(

                          collection(
                            db,
                            "tasks",
                            task.id,
                            "messages"
                          ),

                          orderBy(
                            "createdAt",
                            "desc"
                          ),

                          limit(1)
                        );

                      return new Promise(
                        (
                          resolve
                        ) => {

                          onSnapshot(
                            messagesQuery,

                            (
                              messageSnapshot
                            ) => {

                              let lastMessage =
                                null;

                              messageSnapshot.forEach(
                                (
                                  msg
                                ) => {

                                  lastMessage =
                                    msg.data();
                                }
                              );

                              resolve({

                                ...task,

                                lastMessage,
                              });
                            }
                          );
                        }
                      );
                    }
                  )
              );

            setChatTasks(

              loaded.filter(
                Boolean
              )
            );

          } catch (e) {

            console.log(e);

          } finally {

            setLoading(
              false
            );
          }
        }
      );

    return unsubscribe;

  }, []);

// DELETE CHAT

const deleteChat =
  async (
    taskId
  ) => {

    Alert.alert(
      "Kommer snart 🚀",
      "Sletting av chatter kommer i en senere oppdatering."
    );
  };

  // LONG PRESS

  const handleLongPress =
    (item) => {

      Alert.alert(
        "Slett chat",

        "Vil du slette chatten?",

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

  // FILTER

  const filteredChats =
    chatTasks.filter(
      (task) =>

        task?.title
          ?.toLowerCase()

          .includes(
            search.toLowerCase()
          )
    );

  // TIME

  const getTimeAgo = (
    timestamp
  ) => {

    if (
      !timestamp?.seconds
    )
      return "Nå";

    const date =
      new Date(
        timestamp.seconds *
        1000
      );

    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // LOADING

  if (loading) {

    return (

      <View
        style={
          styles.loadingContainer
        }
      >

        <SkeletonMessageCard />
        <SkeletonMessageCard />
        <SkeletonMessageCard />

      </View>
    );
  }

  return (

    <View
      style={
        styles.container
      }
    >

      {/* HEADER */}

      <View
        style={
          styles.header
        }
      >

        <Text
          style={
            styles.title
          }
        >
          Meldinger
        </Text>

        <TouchableOpacity
          style={
            styles.headerButton
          }
        >

          <Ionicons
            name="notifications-outline"
            size={22}
            color="#111827"
          />

          {/* BADGE */}

          {hasUnread && (

            <View
              style={
                styles.headerDot
              }
            />
          )}

        </TouchableOpacity>

      </View>

      {/* SEARCH */}

      <View
        style={
          styles.searchContainer
        }
      >

        <Ionicons
          name="search-outline"
          size={20}
          color="#9CA3AF"
        />

        <TextInput
          value={search}

          onChangeText={
            setSearch
          }

          placeholder="Søk meldinger"

          placeholderTextColor="#9CA3AF"

          style={
            styles.searchInput
          }
        />

      </View>

      {/* EMPTY */}

      {filteredChats.length ===
      0 ? (

        <View
          style={
            styles.emptyContainer
          }
        >

          <View
            style={
              styles.emptyIcon
            }
          >

            <Ionicons
              name="chatbubble-ellipses-outline"
              size={42}
              color="#9CA3AF"
            />

          </View>

          <Text
            style={
              styles.emptyTitle
            }
          >
            Ingen meldinger enda
          </Text>

          <Text
            style={
              styles.emptySubtitle
            }
          >
            Chats dukker opp når noen aksepterer et oppdrag 😄
          </Text>

        </View>

      ) : (

        <FlatList
          data={
            filteredChats
          }

          keyExtractor={(
            item
          ) => item.id}

          showsVerticalScrollIndicator={
            false
          }

          contentContainerStyle={{
            paddingBottom: 120,
          }}

          renderItem={({
            item,
          }) => {

            const isUnread =

              item?.lastMessage
                ?.senderId !==
                auth.currentUser
                  ?.uid;

            return (

              <TouchableOpacity
                activeOpacity={
                  0.9
                }

                onPress={() =>

                  navigation.navigate(
                    "Chat",

                    {
                      taskId:
                        item.id,
                    }
                  )
                }

                onLongPress={() =>
                  handleLongPress(
                    item
                  )
                }

                style={
                  styles.chatCard
                }
              >

                {/* AVATAR */}

                <View
                  style={
                    styles.avatar
                  }
                >

                  <Ionicons
                    name="person"
                    size={22}
                    color="#111827"
                  />

                  <View
                    style={
                      styles.onlineDot
                    }
                  />

                </View>

                {/* CONTENT */}

                <View
                  style={
                    styles.chatContent
                  }
                >

                  <View
                    style={
                      styles.topRow
                    }
                  >

                    <Text
                      style={
                        styles.chatName
                      }

                      numberOfLines={
                        1
                      }
                    >
                      {item?.creatorName ||
                        "Bruker"}
                    </Text>

                    <Text
                      style={
                        styles.time
                      }
                    >
                      {
                        getTimeAgo(
                          item
                            ?.lastMessage
                            ?.createdAt
                        )
                      }
                    </Text>

                  </View>

                  <Text
                    style={
                      styles.taskTitle
                    }

                    numberOfLines={
                      1
                    }
                  >
                    {
                      item?.title
                    }
                  </Text>

                  <Text
                    style={[
                      styles.lastMessage,

                      isUnread && {
                        color:
                          "#111827",

                        fontWeight:
                          "700",
                      },
                    ]}

                    numberOfLines={
                      1
                    }
                  >

                    {item
                      ?.lastMessage
                      ?.image

                      ? "📷 Bilde"

                      : item
                          ?.lastMessage
                          ?.text ||

                        "Trykk for å åpne chat"}

                  </Text>

                </View>

                {/* RIGHT */}

                <View
                  style={
                    styles.rightSide
                  }
                >

                  {isUnread && (

                    <View
                      style={
                        styles.unreadBadge
                      }
                    >

                      <Text
                        style={
                          styles.unreadText
                        }
                      >
                        1
                      </Text>

                    </View>
                  )}

                </View>

              </TouchableOpacity>
            );
          }}
        />
      )}

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor:
        "#F6F7FB",

      paddingTop:
        Platform.OS ===
        "android"

          ? 52

          : 64,

      paddingHorizontal: 20,
    },

    loadingContainer: {

      flex: 1,

      backgroundColor:
        "#F6F7FB",

      paddingTop:
        Platform.OS ===
        "android"

          ? 52

          : 64,

      paddingHorizontal: 20,
    },

    header: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom: 22,
    },

    title: {

      fontSize: 34,

      fontWeight: "800",

      color:
        "#111827",
    },

    headerButton: {

      width: 46,

      height: 46,

      borderRadius: 16,

      backgroundColor:
        "#FFFFFF",

      justifyContent:
        "center",

      alignItems:
        "center",

      position:
        "relative",
    },

    headerDot: {

      position:
        "absolute",

      top: 10,

      right: 10,

      width: 10,

      height: 10,

      borderRadius: 999,

      backgroundColor:
        "#EF4444",
    },

    searchContainer: {

      backgroundColor:
        "#FFFFFF",

      borderRadius: 18,

      paddingHorizontal: 16,

      height: 56,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom: 24,
    },

    searchInput: {

      flex: 1,

      marginLeft: 10,

      fontSize: 15,

      color:
        "#111827",
    },

    emptyContainer: {

      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",

      paddingBottom: 100,
    },

    emptyIcon: {

      width: 92,

      height: 92,

      borderRadius: 30,

      backgroundColor:
        "#FFFFFF",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginBottom: 24,
    },

    emptyTitle: {

      fontSize: 22,

      fontWeight: "800",

      color:
        "#111827",

      marginBottom: 10,
    },

    emptySubtitle: {

      fontSize: 15,

      color:
        "#6B7280",

      textAlign:
        "center",

      lineHeight: 24,

      paddingHorizontal: 30,
    },

    chatCard: {

      backgroundColor:
        "#FFFFFF",

      borderRadius: 24,

      padding: 18,

      marginBottom: 14,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    avatar: {

      width: 58,

      height: 58,

      borderRadius: 20,

      backgroundColor:
        "#F3F4F6",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight: 14,

      position:
        "relative",
    },

    onlineDot: {

      width: 12,

      height: 12,

      borderRadius: 999,

      backgroundColor:
        "#22C55E",

      position:
        "absolute",

      right: 3,

      bottom: 3,

      borderWidth: 2,

      borderColor:
        "#FFFFFF",
    },

    chatContent: {

      flex: 1,
    },

    topRow: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom: 4,
    },

    chatName: {

      fontSize: 16,

      fontWeight: "700",

      color:
        "#111827",

      flex: 1,

      marginRight: 10,
    },

    time: {

      fontSize: 13,

      color:
        "#9CA3AF",
    },

    taskTitle: {

      fontSize: 15,

      fontWeight: "600",

      color:
        "#374151",

      marginBottom: 4,
    },

    lastMessage: {

      fontSize: 14,

      color:
        "#9CA3AF",
    },

    rightSide: {

      marginLeft: 10,
    },

    unreadBadge: {

      minWidth: 24,

      height: 24,

      borderRadius: 999,

      backgroundColor:
        "#2563EB",

      justifyContent:
        "center",

      alignItems:
        "center",

      paddingHorizontal: 6,
    },

    unreadText: {

      color:
        "#FFFFFF",

      fontSize: 12,

      fontWeight: "700",
    },
  });