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

  const [onlineUsers, setOnlineUsers] =
    useState({});

  const [blockedUsers, setBlockedUsers] =
    useState([]);

  const flatListRef =
    useRef();

  // 🔥 UPDATE ONLINE STATUS
  useEffect(() => {
    const setOnline =
      async () => {
        try {
          await updateDoc(
            doc(
              db,
              "users",
              auth
                .currentUser
                ?.uid
            ),

            {
              online: true,

              lastSeen:
                Date.now(),
            }
          );
        } catch (e) {
          console.log(
            e
          );
        }
      };

    setOnline();

    return async () => {
      try {
        await updateDoc(
          doc(
            db,
            "users",
            auth
              .currentUser
              ?.uid
          ),

          {
            online: false,

            lastSeen:
              Date.now(),
          }
        );
      } catch (e) {
        console.log(
          e
        );
      }
    };
  }, []);

  // 🔥 LISTEN USERS
  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "users"
        ),

        (
          snapshot
        ) => {
          const users =
            {};

          snapshot.docs.forEach(
            (
              document
            ) => {
              users[
                document.id
              ] =
                document.data();
            }
          );

          setOnlineUsers(
            users
          );
        }
      );

    return unsubscribe;
  }, []);

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

            seen: false,
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

  // 🔥 DELETE MESSAGE
  const deleteMessage =
    async (
      messageId
    ) => {
      try {
        await deleteDoc(
          doc(
            db,
            "messages",
            messageId
          )
        );
      }
      catch (e) {
  console.log(
    e
  );
}
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
          : "height"
      }
      keyboardVerticalOffset={
        Platform.OS ===
        "ios"
          ? 120
          : 100
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
            {task.creatorName ||
              "Chat"}
          </Text>
        </View>

        {/* MESSAGES */}
        <FlatList
          ref={flatListRef}
          data={messages.filter(
            (
              msg
            ) =>
              !blockedUsers.includes(
                msg.senderId
              )
          )}
          keyExtractor={(
            item
          ) => item.id}
          contentContainerStyle={{
            padding: 20,

            paddingBottom: 180,
          }}
          showsVerticalScrollIndicator={
            false
          }
          renderItem={({
            item,
          }) => (
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
            </TouchableOpacity>
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
            ✍️ skriver...
          </Text>
        )}

        {/* INPUT */}
        <View
          style={{
            flexDirection:
              "row",

            padding: 12,

            paddingBottom:
              Platform.OS ===
              "ios"
                ? 110
                : 130,

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