import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  doc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";

import { db, auth } from "../firebaseConfig";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";

export default function ChatScreen({
  route,
}) {
  const task =
    route?.params?.task;

  const [messages, setMessages] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [typingUsers, setTypingUsers] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const flatListRef =
    useRef();

  // INVALID TASK
  if (
    !task ||
    !task.id
  ) {
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
            color:
              "#6B7280",
          }}
        >
          Chat not available
        </Text>
      </View>
    );
  }

  // REALTIME MESSAGES
  useEffect(() => {
    try {
      const q = query(
        collection(
          db,
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

          (
            snapshot
          ) => {
            try {
              const loadedMessages =
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
                      msg
                    ) =>
                      msg &&
                      msg.taskId ===
                        task.id
                  );

              setMessages(
                loadedMessages
              );

              setLoading(
                false
              );
            } catch (e) {
              console.log(
                "MESSAGE LOAD ERROR:",
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
        "CHAT ERROR:",
        e
      );

      setLoading(
        false
      );
    }
  }, [task.id]);

  // AUTO SCROLL
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd(
        {
          animated: true,
        }
      );
    }, 100);
  }, [messages]);

  // TYPING LISTENER
  useEffect(() => {
    try {
      const unsubscribe =
        onSnapshot(
          doc(
            db,
            "typing",
            task.id
          ),

          (
            docSnap
          ) => {
            if (
              docSnap.exists()
            ) {
              setTypingUsers(
                docSnap.data()
              );
            }
          }
        );

      return unsubscribe;
    } catch (e) {
      console.log(
        "TYPING ERROR:",
        e
      );
    }
  }, [task.id]);

  // SEND MESSAGE
  const sendMessage =
    async () => {
      try {
        if (
          !message.trim()
        ) {
          return;
        }

        const textToSend =
          message.trim();

        setMessage("");

        await addDoc(
          collection(
            db,
            "messages"
          ),

          {
            text:
              textToSend,

            createdAt:
              serverTimestamp(),

            sender:
              auth
                .currentUser
                ?.email,

            senderName:
              auth.currentUser?.email?.split(
                "@"
              )[0] ||
              "Bruker",

            senderId:
              auth
                .currentUser
                ?.uid,

            taskId:
              task.id,
          }
        );

        await setDoc(
          doc(
            db,
            "typing",
            task.id
          ),

          {
            [auth
              .currentUser
              ?.uid]:
              false,
          },

          {
            merge: true,
          }
        );
      } catch (e) {
        console.log(
          "SEND ERROR:",
          e
        );
      }
    };

  // HANDLE TYPING
  const handleTyping =
    async (
      text
    ) => {
      try {
        setMessage(
          text
        );

        await setDoc(
          doc(
            db,
            "typing",
            task.id
          ),

          {
            [auth
              .currentUser
              ?.uid]:
              text.length >
              0,
          },

          {
            merge: true,
          }
        );
      } catch (e) {
        console.log(
          "TYPING SAVE ERROR:",
          e
        );
      }
    };

  // DELETE MESSAGE
  const deleteMessage =
    async (
      messageId
    ) => {
      try {
        if (
          !messageId
        ) {
          return;
        }

        await deleteDoc(
          doc(
            db,
            "messages",
            messageId
          )
        );
      } catch (e) {
        console.log(
          "DELETE ERROR:",
          e
        );
      }
    };

  // LONG PRESS
  const handleLongPress =
    (item) => {
      if (
        !item ||
        !item.id
      ) {
        return;
      }

      Alert.alert(
        "Melding",

        "Vil du slette meldingen?",

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
                deleteMessage(
                  item.id
                ),
          },
        ]
      );
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

        <Text
          style={{
            marginTop: 20,

            color:
              "#6B7280",
          }}
        >
          Laster chat...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
      behavior={
        Platform.OS ===
        "ios"
          ? "padding"
          : "height"
      }
      keyboardVerticalOffset={
        Platform.OS ===
        "ios"
          ? 90
          : 20
      }
    >
      <View
        style={{
          flex: 1,

          backgroundColor:
            "#F4F6F8",
        }}
      >
        {/* HEADER */}
        {message.length ===
          0 && (
          <View
            style={{
              paddingTop: 60,

              paddingHorizontal: 20,

              paddingBottom: 18,

              backgroundColor:
                "white",

              borderBottomWidth: 1,

              borderBottomColor:
                "#E5E7EB",
            }}
          >
            <Text
              style={{
                fontSize: 24,

                fontWeight:
                  "bold",

                color:
                  "#111827",
              }}
            >
              {task.createdBy ===
              auth
                .currentUser
                ?.uid
                ? task.acceptedByName ||
                  task.acceptedBy ||
                  "Hjelper"
                : task.creatorName ||
                  task.createdByName ||
                  task.email?.split(
                    "@"
                  )[0] ||
                  "Bruker"}
            </Text>
          </View>
        )}

        {/* MESSAGES */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(
            item,
            index
          ) =>
            item?.id
              ? item.id.toString()
              : index.toString()
          }
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={
            false
          }
          renderItem={({
            item,
          }) => {
            if (
              !item
            ) {
              return null;
            }

            return (
              <TouchableOpacity
                activeOpacity={
                  0.8
                }
                onLongPress={() =>
                  handleLongPress(
                    item
                  )
                }
                style={{
                  backgroundColor:
                    item.senderId ===
                    auth
                      .currentUser
                      ?.uid
                      ? "#2563EB"
                      : "#E5E7EB",

                  padding: 14,

                  borderRadius: 18,

                  marginBottom: 10,

                  alignSelf:
                    item.senderId ===
                    auth
                      .currentUser
                      ?.uid
                      ? "flex-end"
                      : "flex-start",

                  maxWidth:
                    "80%",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,

                    marginBottom: 4,

                    fontWeight:
                      "bold",

                    color:
                      item.senderId ===
                      auth
                        .currentUser
                        ?.uid
                        ? "#DCEBFF"
                        : "#6B7280",
                  }}
                >
                  {item.senderName ||
                    "Bruker"}
                </Text>

                <Text
                  style={{
                    color:
                      item.senderId ===
                      auth
                        .currentUser
                        ?.uid
                        ? "white"
                        : "black",

                    fontSize: 16,
                  }}
                >
                  {item.text ||
                    ""}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* INPUT */}
        <View
          style={{
            flexDirection:
              "row",

            padding: 12,

            paddingBottom:
              Platform.OS ===
              "ios"
                ? 25
                : 10,

            backgroundColor:
              "white",

            borderTopWidth: 1,

            borderTopColor:
              "#E5E7EB",
          }}
        >
          <TextInput
            value={message}
            onChangeText={
              handleTyping
            }
            placeholder="Skriv melding..."
            multiline
            maxLength={
              500
            }
            style={{
              flex: 1,

              backgroundColor:
                "#F3F4F6",

              padding: 14,

              borderRadius: 20,

              marginRight: 10,

              maxHeight: 120,
            }}
          />

          <TouchableOpacity
            onPress={
              sendMessage
            }
            style={{
              backgroundColor:
                "#2563EB",

              paddingHorizontal: 20,

              justifyContent:
                "center",

              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color:
                  "white",

                fontWeight:
                  "bold",
              }}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}