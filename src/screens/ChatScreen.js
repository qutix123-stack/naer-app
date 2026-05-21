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
} from "react-native";

export default function ChatScreen({
  route,
}) {
  const { task } =
    route.params;

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

  // 🔥 REALTIME MESSAGES
  useEffect(() => {
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
                  msg.taskId ===
                  task.id
              );

          setMessages(
            loadedMessages
          );

          setLoading(
            false
          );
        },

        (error) => {
          console.log(
            error
          );

          setLoading(
            false
          );
        }
      );

    return unsubscribe;
  }, [task.id]);

  // 🔥 MARK AS SEEN
  useEffect(() => {
    const markSeen =
      async () => {
        try {
          const unseenMessages =
            messages.filter(
              (
                msg
              ) =>
                msg.senderId !==
                  auth
                    .currentUser
                    ?.uid &&
                !msg.seen
            );

          for (const msg of unseenMessages) {
            await updateDoc(
              doc(
                db,
                "messages",
                msg.id
              ),

              {
                seen: true,
              }
            );
          }
        } catch (e) {
          console.log(
            e
          );
        }
      };

    if (
      messages.length >
      0
    ) {
      markSeen();
    }
  }, [messages]);

  // 🔥 AUTO SCROLL
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd(
        {
          animated: true,
        }
      );
    }, 100);
  }, [messages]);

  // 🔥 TYPING LISTENER
  useEffect(() => {
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
  }, [task.id]);

  // 🔥 SEND MESSAGE
  const sendMessage =
    async () => {
      try {
        if (
          !message.trim()
        )
          return;

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

            senderId:
              auth
                .currentUser
                ?.uid,

            taskId:
              task.id,

            seen: false,
          }
        );

        // 🔥 RESET TYPING
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
          e
        );
      }
    };

  // 🔥 HANDLE TYPING
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
          e
        );
      }
    };

  // 🔥 TIME FORMAT
  const formatTime = (
    timestamp
  ) => {
    if (!timestamp)
      return "";

    const time =
      timestamp?.seconds
        ? timestamp.seconds *
          1000
        : timestamp;

    return new Date(
      time
    ).toLocaleTimeString(
      [],

      {
        hour:
          "2-digit",

        minute:
          "2-digit",
      }
    );
  };

  // 🔥 LOADING
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
          : undefined
      }
    >
      <View
        style={{
          flex: 1,

          backgroundColor:
            "#F4F6F8",
        }}
      >
        {/* MESSAGES */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(
            item
          ) => item.id}
          contentContainerStyle={{
            padding: 20,

            paddingTop: 60,

            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={
            false
          }
          renderItem={({
            item,
          }) => (
            <View
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
                {item.text}
              </Text>

              <Text
                style={{
                  fontSize: 10,

                  marginTop: 6,

                  color:
                    item.senderId ===
                    auth
                      .currentUser
                      ?.uid
                      ? "#DCEBFF"
                      : "#6B7280",
                }}
              >
                {formatTime(
                  item.createdAt
                )}

                {item.senderId ===
                  auth
                    .currentUser
                    ?.uid && (
                  <Text>
                    {item.seen
                      ? " ✓✓"
                      : " ✓"}
                  </Text>
                )}
              </Text>
            </View>
          )}
        />

        {/* TYPING */}
        {Object.entries(
          typingUsers
        ).some(
          ([
            uid,
            isTyping,
          ]) =>
            uid !==
              auth
                .currentUser
                ?.uid &&
            isTyping
        ) && (
          <Text
            style={{
              marginLeft: 20,

              marginBottom: 10,

              color:
                "#6B7280",
            }}
          >
            skriver...
          </Text>
        )}

        {/* INPUT */}
        <View
          style={{
            flexDirection:
              "row",

            padding: 12,

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