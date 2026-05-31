import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import * as ImagePicker from "expo-image-picker";

import {
  sendPushNotification,
} from "../services/sendPush";

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
  ActivityIndicator,
  Image,
  Modal,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import {
  auth,
  db,
  storage,
} from "../firebaseConfig";

export default function ChatScreen({
  route,
  navigation,
}) {

  const taskId =
    route?.params?.taskId;

  const [messages, setMessages] =
    useState([]);

  const [
  selectedImage,
  setSelectedImage,
] = useState(null);

  const [text, setText] =
    useState("");

  const [
  myAvatar,
  setMyAvatar,
] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [task, setTask] =
    useState(null);

  const [image, setImage] =
    useState(null);

  const [sending, setSending] =
    useState(false);

  const [otherUser, setOtherUser] =
    useState("Bruker");

  const [
  otherUserAvatar,
  setOtherUserAvatar,
] = useState(null);

  const [isTyping, setIsTyping] =
    useState(false);

  const [typingTimeout, setTypingTimeout] =
    useState(null);

  const flatListRef =
    useRef(null);

  const typingRef =
    doc(
      db,
      "tasks",
      taskId,
      "typing",
      "status"
    );

  // LOAD

    const markMessagesAsRead =
  async () => {

    try {

      const snapshot =
        await getDocs(
          collection(
            db,
            "tasks",
            taskId,
            "messages"
          )
        );

      snapshot.forEach(
        async (message) => {

          const data =
            message.data();


          if (

            data.receiverId ===
            auth.currentUser?.uid &&

            data.read === false

          ) {

            await updateDoc(

              doc(
                db,
                "tasks",
                taskId,
                "messages",
                message.id
              ),

              {
                read: true,
              }
            );

            await updateDoc(
              doc(
              db,
              "tasks",
              taskId
                ),
              {
            hasUnreadFor:
              null,
              }
            );

          }
        }
      );

    } catch (e) {

      console.log(e);
    }
  };

  useEffect(() => {

    loadTask();
    markMessagesAsRead();

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

          const loaded =
            [];

          snapshot.forEach(
            (doc) => {

              loaded.push({
                id:
                  doc.id,

                ...doc.data(),
              });
            }
          );

          setMessages(
            loaded
          );

          markMessagesAsRead();

          setLoading(
            false
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

  }, []);

  // TYPING LISTENER

  useEffect(() => {

    const unsubscribe =
      onSnapshot(

        typingRef,

        (snap) => {

          const data =
            snap.data();

          if (
            !data
          )
            return;

          if (

            data.userId !==
            auth.currentUser?.uid

          ) {

            setIsTyping(
              data.typing
            );
          }
        }
      );

    return unsubscribe;

  }, []);

  // LOAD TASK

  const loadTask =
    async () => {

      try {

        const snap =
          await getDoc(
            doc(
              db,
              "tasks",
              taskId
            )
          );

        const data =
          snap.data();

        if (!data)
          return;

        setTask({
  id: snap.id,
  ...data,
});

        const myUserSnap =
  await getDoc(
    doc(
      db,
      "users",
      auth.currentUser.uid
    )
  );

  if (
  myUserSnap.exists()
) {

  setMyAvatar(
    myUserSnap.data()
      ?.avatar || null
  );
}


        let otherUserId = null;

if (
  data.ownerId ===
  auth.currentUser?.uid
) {

  setOtherUser(
    data.acceptedByName ||
    "Hjelper"
  );

  otherUserId =
    data.acceptedById;

} else {

  setOtherUser(
    data.creatorName ||
    "Bruker"
  );

  otherUserId =
    data.ownerId;
}

if (otherUserId) {

  const userSnap =
    await getDoc(
      doc(
        db,
        "users",
        otherUserId
      )
    );

  if (
    userSnap.exists()
  ) {

    setOtherUserAvatar(
      userSnap.data()
        ?.avatar || null
    );
  }
}

      } catch (e) {

        console.log(e);
      }
    };

  // PICK IMAGE

  const pickImage =
  async () => {

    try {

      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes:
              ImagePicker.MediaTypeOptions.Images,

            quality: 0.7,
          }
        );

      if (
        result.canceled
      )
        return;

      setImage(
        result.assets[0]
          .uri
      );

    } catch (e) {

      console.log(
        "IMAGE PICKER ERROR:",
        e
      );
    }
  };

  // SEND MESSAGE

  const sendMessage =
    async () => {

      const cleaned =
        text.trim();

      if (
        !cleaned &&
        !image
      )
        return;

      try {

        setSending(true);

        let imageUrl =
          null;

        // STOP TYPING

        await setDoc(

          typingRef,

          {
            typing:
              false,

            userId:
              auth.currentUser
                ?.uid,
          }
        );

        // UPLOAD IMAGE

        if (image) {

          const response =
            await fetch(
              image
            );

          const blob =
            await response.blob();

          const filename =
            `chatImages/${Date.now()}`;

          const storageRef =
            ref(
              storage,
              filename
            );

          await uploadBytes(
            storageRef,
            blob
          );

          imageUrl =
            await getDownloadURL(
              storageRef
            );

            console.log(
              "IMAGE URL:",
              imageUrl
            );
        }

        // SAVE MESSAGE

        await addDoc(
  collection(
    db,
    "tasks",
    taskId,
    "messages"
  ),
  {
    text:
      cleaned || "",

    image:
      imageUrl,

    senderId:
      auth.currentUser?.uid,

    senderName:
      auth.currentUser?.displayName ||
      "Bruker",

    senderPhoto:
      myAvatar,

    receiverId:
      task?.ownerId ===
      auth.currentUser?.uid

        ? task?.acceptedById
        : task?.ownerId,

    read: false,

    createdAt:
      serverTimestamp(),
  }
);

// Send PUSH
const receiverId =

  task?.ownerId ===
  auth.currentUser?.uid

    ? task?.acceptedById
    : task?.ownerId;

const receiverSnap =
  await getDoc(
    doc(
      db,
      "users",
      receiverId
    )
  );

const pushToken =
  receiverSnap.data()
    ?.expoPushToken;

if (pushToken) {

  await sendPushNotification(

    pushToken,

    auth.currentUser
      ?.displayName ||

      "Ny melding",

    cleaned
      ? cleaned
      : "📷 Bilde"
  );
}

await updateDoc(
  doc(
    db,
    "tasks",
    taskId
  ),
  {
    hasUnreadFor:
      task?.ownerId ===
      auth.currentUser?.uid

        ? task?.acceptedById
        : task?.ownerId,
  }
);

setText("");

setImage(null);

        await updateDoc(
        doc(
          db,
          "tasks",
          taskId
          ),
          {
         lastMessageAt:
        serverTimestamp(),
          }
        );

      } catch (e) {

        console.log(
          "SEND ERROR:",
          e
        );

      } finally {

        setSending(false);
      }
    };

  // TIME

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

  // RENDER MESSAGE

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
                style={
                  styles.avatarText
                }
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
              styles.bubble,

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
                  item.senderName
                }
              </Text>
            )}

            {!!item.text && (

              <Text
                style={[
                  styles.messageText,

                  {
                    color:
                      isMine
                        ? "#FFFFFF"
                        : "#111827",
                  },
                ]}
              >
                {item.text}
              </Text>
            )}

            {item.image && (

  <TouchableOpacity
    onPress={() =>
      setSelectedImage(
        item.image
      )
    }
  >

    <Image
      source={{
        uri:
          item.image,
      }}

      style={
        styles.messageImage
      }
    />

  </TouchableOpacity>
)}

            <Text
              style={[
                styles.time,

                {
                  color:
                    isMine
                      ? "rgba(255,255,255,0.7)"
                      : "#9CA3AF",
                },
              ]}
            >
              {
                getTime(
                  item.createdAt
                )
              }
            </Text>

          </View>

        </View>
      );
    };

  // LOADING

  if (loading) {

    return (

      <View
        style={
          styles.loader
        }
      >

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

      </View>
    );
  }

  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

      <KeyboardAvoidingView
        behavior={
          Platform.OS ===
          "ios"

            ? "padding"

            : undefined
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

    <Ionicons
      name="arrow-back"
      size={24}
      color="#111827"
    />

  </TouchableOpacity>

  <TouchableOpacity
    style={
      styles.headerCenter
    }

    activeOpacity={0.8}

    onPress={() =>
      navigation.navigate(
        "UserProfile",
        {
          userId:
           task?.ownerId ===
          auth.currentUser?.uid

        ? task?.acceptedById
        : task?.ownerId,

          taskId:
          task?.id,
        }
      )
    }
  >

    <View
      style={
        styles.headerAvatar
      }
    >

      {otherUserAvatar ? (

        <Image
          source={{
            uri:
              otherUserAvatar,
          }}

          style={{
            width: "100%",
            height: "100%",
            borderRadius: 18,
          }}
        />

      ) : (

        <Text
          style={
            styles.headerAvatarText
          }
        >
          {otherUser?.charAt(0)}
        </Text>

      )}

      <View
        style={
          styles.onlineDot
        }
      />

    </View>

    <View>

      <Text
        style={
          styles.headerName
        }
      >
        {otherUser}
      </Text>

      <Text
        style={
          styles.headerTask
        }

        numberOfLines={1}
      >
        {task?.title}
      </Text>

    </View>

  </TouchableOpacity>

</View>

        {/* TYPING */}

        {isTyping && (

          <View
            style={
              styles.typingContainer
            }
          >

            <Text
              style={
                styles.typingText
              }
            >
              {otherUser} skriver...
            </Text>

          </View>
        )}

        {/* CHAT */}

        <FlatList
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
            padding:
              18,

            paddingBottom:
              140,
          }}
        />

        {/* IMAGE PREVIEW */}

        {image && (

          <View
            style={
              styles.previewContainer
            }
          >

            <Image
              source={{
                uri:
                  image,
              }}

              style={
                styles.previewImage
              }
            />

            <TouchableOpacity
              style={
                styles.removeImage
              }

              onPress={() =>
                setImage(
                  null
                )
              }
            >

              <Ionicons
                name="close"
                size={18}
                color="#FFFFFF"
              />

            </TouchableOpacity>

          </View>
        )}

        {/* INPUT */}

        <View
          style={
            styles.inputContainer
          }
        >

          <TouchableOpacity
            onPress={
              pickImage
            }

            style={
              styles.imageButton
            }
          >

            <Ionicons
              name="image-outline"
              size={22}
              color="#6B7280"
            />

          </TouchableOpacity>

          <TextInput
            value={text}

            onChangeText={async (
              value
            ) => {

              setText(value);

              // TYPING TRUE

              await setDoc(

                typingRef,

                {
                  typing:
                    true,

                  userId:
                    auth.currentUser
                      ?.uid,
                }
              );

              // CLEAR TIMER

              if (
                typingTimeout
              ) {

                clearTimeout(
                  typingTimeout
                );
              }

              // STOP TYPING

              const timeout =
                setTimeout(
                  async () => {

                    await setDoc(

                      typingRef,

                      {
                        typing:
                          false,

                        userId:
                          auth.currentUser
                            ?.uid,
                      }
                    );

                  },

                  1400
                );

              setTypingTimeout(
                timeout
              );
            }}

            placeholder="Skriv melding..."

            placeholderTextColor="#9CA3AF"

            multiline

            style={
              styles.input
            }
          />

          <TouchableOpacity
            activeOpacity={0.9}

            onPress={
              sendMessage
            }

            disabled={
              sending
            }

            style={
              styles.sendButton
            }
          >

            {sending ? (

              <ActivityIndicator
                color="#FFFFFF"
              />

            ) : (

              <Ionicons
                name="send"
                size={20}
                color="#FFFFFF"
              />
            )}

          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>

            {selectedImage && (

        <Modal
          transparent
          visible
        >

          <View
            style={{
              flex: 1,
              backgroundColor:
                "black",
              justifyContent:
                "center",
            }}
          >

            <TouchableOpacity
  onPress={() =>
    setSelectedImage(null)
  }

  style={{
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 999,

    width: 44,
    height: 44,
    borderRadius: 22,

    backgroundColor:
      "rgba(17,24,39,0.85)",

    justifyContent:
      "center",

    alignItems:
      "center",
  }}
>

  <Ionicons
    name="close"
    size={24}
    color="#FFFFFF"
  />

</TouchableOpacity>

            <Image
              source={{
                uri:
                  selectedImage,
              }}

              resizeMode="contain"

              style={{
                width: "100%",
                height: "100%",
              }}
            />

          </View>

        </Modal>
      )}

    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor:
        "#F6F7FB",
    },

    loader: {

      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",

      backgroundColor:
        "#F6F7FB",
    },

    header: {

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal: 20,

      paddingTop:
        Platform.OS === "android"
          ? 50
          : 12,

      paddingBottom: 18,

      backgroundColor:
        "#FFFFFF",

      borderBottomWidth: 1,

      borderColor:
        "#F3F4F6",
    },

    headerCenter: {

      flexDirection:
        "row",

      alignItems:
        "center",

      marginLeft: 16,

      flex: 1,
    },

    headerAvatar: {

      width: 52,

      height: 52,

      borderRadius: 18,

      backgroundColor:
        "#E5E7EB",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight: 14,

      position:
        "relative",
    },

    headerAvatarText: {

      fontSize: 18,

      fontWeight: "700",

      color:
        "#111827",
    },

    onlineDot: {

      width: 12,

      height: 12,

      borderRadius: 999,

      backgroundColor:
        "#22C55E",

      position:
        "absolute",

      right: 2,

      bottom: 2,

      borderWidth: 2,

      borderColor:
        "#FFFFFF",
    },

    headerName: {

      fontSize: 17,

      fontWeight: "700",

      color:
        "#111827",

      marginBottom: 2,
    },

    headerTask: {

      fontSize: 13,

      color:
        "#9CA3AF",

      width: 180,
    },

    typingContainer: {

      paddingHorizontal: 20,

      paddingTop: 10,

      paddingBottom: 2,
    },

    typingText: {

      fontSize: 13,

      color:
        "#6B7280",

      fontWeight: "600",
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

      borderRadius: 14,

      backgroundColor:
        "#2563EB",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight: 8,
    },

    avatarText: {

      color:
        "#FFFFFF",

      fontWeight: "700",
    },

    bubble: {

      maxWidth: "78%",

      borderRadius: 26,

      paddingHorizontal: 16,

      paddingVertical: 14,
    },

    myBubble: {

      backgroundColor:
        "#2563EB",

      borderBottomRightRadius: 10,

      marginLeft:
        "auto",
    },

    otherBubble: {

      backgroundColor:
        "#FFFFFF",

      borderBottomLeftRadius: 10,
    },

    senderName: {

      fontSize: 13,

      fontWeight: "700",

      color:
        "#6B7280",

      marginBottom: 6,
    },

    messageText: {

      fontSize: 16,

      lineHeight: 24,
    },

    messageImage: {

      width: 220,

      height: 220,

      borderRadius: 18,

      marginTop: 10,
    },

    time: {

      fontSize: 11,

      marginTop: 8,

      alignSelf:
        "flex-end",
    },

    previewContainer: {

      marginLeft: 16,

      marginBottom: 10,

      position:
        "relative",

      alignSelf:
        "flex-start",
    },

    previewImage: {

      width: 120,

      height: 120,

      borderRadius: 20,
    },

    removeImage: {

      position:
        "absolute",

      top: 8,

      right: 8,

      width: 28,

      height: 28,

      borderRadius: 999,

      backgroundColor:
        "rgba(0,0,0,0.7)",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    inputContainer: {

      flexDirection:
        "row",

      alignItems:
        "flex-end",

      paddingHorizontal: 16,

      paddingTop: 12,

      paddingBottom:
        Platform.OS ===
        "ios"

          ? 28

          : 42,

      backgroundColor:
        "#FFFFFF",

      borderTopWidth: 1,

      borderColor:
        "#F3F4F6",
    },

    imageButton: {

      width: 46,

      height: 46,

      borderRadius: 16,

      backgroundColor:
        "#F3F4F6",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight: 10,
    },

    input: {

      flex: 1,

      backgroundColor:
        "#F3F4F6",

      borderRadius: 24,

      paddingHorizontal: 18,

      paddingVertical: 16,

      fontSize: 16,

      color:
        "#111827",

      maxHeight: 120,

      marginRight: 12,
    },

    sendButton: {

      width: 54,

      height: 54,

      borderRadius: 20,

      backgroundColor:
        "#2563EB",

      justifyContent:
        "center",

      alignItems:
        "center",

      shadowColor:
        "#2563EB",

      shadowOpacity: 0.25,

      shadowRadius: 10,

      elevation: 6,
    },
  });