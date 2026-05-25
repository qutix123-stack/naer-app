import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  sendPushNotification,
} from "../utils/sendPushNotification";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
} from "react-native";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebaseConfig";

export default function ChatScreen({
  route,
  navigation,
}) {

  const taskId =
    route?.params?.taskId;

  const [messages, setMessages] =
    useState([]);

  const [text, setText] =
    useState("");

  const [otherUser, setOtherUser] =
    useState("Bruker");

  const flatListRef =
    useRef(null);

  useEffect(() => {

    loadOtherUser();

    if (!taskId) return;

    const q = query(
      collection(
        db,
        "tasks",
        taskId,
        "messages"
      ),

      orderBy(
        "createdAt",
        "asc"
      )
    );

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {

          const loaded = [];

          snapshot.forEach(
            (doc) => {

              loaded.push({
                id: doc.id,
                ...doc.data(),
              });

            }
          );

          setMessages(
            loaded
          );

          setTimeout(() => {

            flatListRef.current?.scrollToEnd(
              {
                animated: true,
              }
            );

          }, 100);
        }
      );

    return unsubscribe;

  }, [taskId]);

  const loadOtherUser =
    async () => {

      try {

        const taskSnap =
          await getDoc(
            doc(
              db,
              "tasks",
              taskId
            )
          );

        const task =
          taskSnap.data();

        if (!task)
          return;

        if (
          task.createdBy ===
          auth.currentUser.uid
        ) {

          setOtherUser(
            task.acceptedBy ||
            "Hjelper"
          );

        } else {

          setOtherUser(
            task.creatorName ||
            "Bruker"
          );

        }

      } catch (e) {

        console.log(e);

      }
    };

  const sendMessage =
    async () => {

       const cleaned =
        text
          .replace(
            /\s+/g,
            " "
          )
          .trim();

      if (
        !cleaned ||

        cleaned.length > 300
        )
        return;

      try {

        await addDoc(
          collection(
            db,
            "tasks",
            taskId,
            "messages"
          ),

          {
            text:
              cleaned,

            senderId:
              auth.currentUser
                ?.uid || "",

            senderName:
              auth.currentUser
                ?.displayName ||

              auth.currentUser
                ?.email ||

              "Bruker",

            createdAt:
              serverTimestamp(),
          }
        );

        try {

          const taskRef =
            await getDoc(
              doc(
                db,
                "tasks",
                taskId
              )
            );

          const taskData =
            taskRef.data();

          let otherUserId =
            null;

          if (
            taskData.createdBy ===
            auth.currentUser.uid
          ) {

            otherUserId =
              taskData.acceptedById;

          } else {

            otherUserId =
              taskData.createdBy;

          }

          if (
            otherUserId
          ) {

            const userRef =
              await getDoc(
                doc(
                  db,
                  "users",
                  otherUserId
                )
              );

            const userData =
              userRef.data();

            if (
              userData?.pushToken
            ) {

              await sendPushNotification(
                userData.pushToken,

                `💬 ${auth.currentUser.displayName}`,

                text
              );
            }
          }

        } catch (e) {

          console.log(
            "NOTIFICATION ERROR:",
            e
          );

        }

        setText("");

        setTimeout(() => {

          flatListRef.current?.scrollToEnd(
            {
              animated: true,
            }
          );

        }, 100);

      } catch (e) {

        console.log(e);

      }
    };

  const getTime = (
    timestamp
  ) => {

    if (
      !timestamp?.seconds
    )
      return "";

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

  const renderItem =
    ({ item }) => {

      const isMine =
        item.senderId ===
        auth.currentUser?.uid;

      return (

        <View
          style={[
            styles.messageWrapper,

            isMine
              ? styles.myWrapper
              : styles.otherWrapper,
          ]}
        >

          {!isMine && (

            <View
              style={
                styles.avatar
              }
            >

              <Text
                style={{
                  color: "white",
                  fontWeight:
                    "bold",
                }}
              >
                {
                  item.senderName?.charAt(
                    0
                  ) || "B"
                }
              </Text>

            </View>
          )}

          <View
            style={[
              styles.messageBubble,

              isMine
                ? styles.myBubble
                : styles.otherBubble,
            ]}
          >

            {!isMine && (

              <Text
                style={
                  styles.senderName
                }
              >
                {
                  item.senderName ||
                  "Bruker"
                }
              </Text>
            )}

            <Text

            numberOfLines={12}

            ellipsizeMode="tail"

              style={[

                styles.messageText,

                {
                  color:
                    isMine
                      ? "white"
                      : "#111827",
                },
              ]}
            >
              {item.text}
            </Text>

            <Text
              style={[
                styles.time,

                {
                  color:
                    isMine
                      ? "rgba(255,255,255,0.7)"
                      : "#6B7280",
                },
              ]}
            >
              {
                getTime(
                  item.createdAt
                )
              }
            </Text>

            {item.image && (

              <Image
                source={{
                  uri:
                    item.image,
                }}
                style={
                  styles.image
                }
              />
            )}

          </View>

        </View>
      );
    };

  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

      <KeyboardAvoidingView
  behavior={
    Platform.OS === "ios"
      ? "padding"
      : "height"
  }

  keyboardVerticalOffset={
    Platform.OS === "ios"
      ? 0
      : 20
  }

  style={{
    flex: 1,
  }}
>

        {/* HEADER */}

        <View
          style={
            styles.header
          }
        >

          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
          >

            <Text
              style={
                styles.back
              }
            >
              ←
            </Text>

          </TouchableOpacity>

          <View>

            <Text
              style={
                styles.headerTitle
              }
            >
              {otherUser}
            </Text>

            <Text
              style={
                styles.online
              }
            >
              Aktiv nå
            </Text>

          </View>

        </View>

        {/* CHAT */}

        <FlatList

          keyboardShouldPersistTaps="handled"

          ref={flatListRef}

          data={messages}

          keyExtractor={(
            item
          ) => item.id}

          renderItem={
            renderItem
          }

          showsVerticalScrollIndicator={
            false
          }

          contentContainerStyle={{
            padding: 16,
            paddingBottom: 120,
          }}
        />

        {/* INPUT */}

        <View
          style={
            styles.inputContainer
          }
        >

          <TextInput
            multiline
            maxLength={300}
            placeholder="Skriv melding..."

            value={text}

            onChangeText={
              setText
            }

            style={
              styles.input
            }

            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity
            style={
              styles.sendButton
            }

            onPress={
              sendMessage
            }
          >

            <Text
              style={
                styles.sendText
              }
            >
              Send
            </Text>

          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F3F4F6",
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal: 20,

      paddingTop: 18,

      paddingBottom: 16,

      backgroundColor:
        "white",

      borderBottomWidth: 1,

      borderColor:
        "#E5E7EB",
    },

    back: {
      fontSize: 34,

      marginRight: 18,

      color:
        "#111827",
    },

    headerTitle: {
      fontSize: 22,

      fontWeight:
        "bold",

      color:
        "#111827",
    },

    online: {
      color:
        "#22C55E",

      marginTop: 2,
    },

    messageWrapper: {
      marginBottom: 14,

      flexDirection:
        "row",

      alignItems:
        "flex-end",
    },

    myWrapper: {
      justifyContent:
        "flex-end",
    },

    otherWrapper: {
      justifyContent:
        "flex-start",
    },

    avatar: {
      width: 34,

      height: 34,

      borderRadius: 17,

      backgroundColor:
        "#2563EB",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight: 8,
    },

    messageBubble: {
      maxWidth: "78%",

      borderRadius: 30,

      padding: 16,
    },

    myBubble: {
      backgroundColor:
        "#2563EB",

      borderBottomRightRadius: 8,

      marginLeft: "auto",
    },

    otherBubble: {
      backgroundColor:
        "white",

      borderBottomLeftRadius: 8,
    },

    senderName: {
      fontSize: 14,

      fontWeight:
        "bold",

      marginBottom: 6,

      color:
        "#6B7280",
    },

    messageText: {
      fontSize: 17,

      lineHeight: 24,
    },

    time: {
      fontSize: 12,

      marginTop: 8,

      alignSelf:
        "flex-end",
    },

    image: {
      width: 220,

      height: 220,

      borderRadius: 18,

      marginTop: 10,
    },

    inputContainer: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal: 16,

      paddingTop: 12,

      paddingBottom:
        Platform.OS === "ios"
          ? 28
          : 46,

      backgroundColor:
        "white",

      borderTopWidth: 1,

      borderColor:
        "#E5E7EB",
    },

    input: {
      flex: 1,

      backgroundColor:
        "#F3F4F6",

      borderRadius: 20,

      paddingHorizontal: 18,

      minHeight: 58,

      maxHeight: 120,

      fontSize: 17,

      marginRight: 10,

      color:
        "#111827",
    },

    sendButton: {
      backgroundColor:
        "#2563EB",

      shadowColor:
        "#2563EB",

      shadowOpacity: 0.25,

      shadowRadius: 8,

      elevation: 6,

      paddingHorizontal: 24,

      height: 58,

      borderRadius: 20,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    sendText: {
      color: "white",

      fontWeight:
        "bold",

      fontSize: 17,
    },
  });
