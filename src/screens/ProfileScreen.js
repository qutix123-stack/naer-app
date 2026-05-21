import React, {
  useEffect,
  useState,
} from "react";

import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { signOut } from "firebase/auth";

import {
  auth,
  db,
  storage,
} from "../firebaseConfig";

import * as ImagePicker from "expo-image-picker";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export default function ProfileScreen() {
  const [image, setImage] =
    useState(null);

  const [userData, setUserData] =
    useState(null);

  useEffect(() => {
    const fetchUser =
      async () => {
        try {
          const docRef = doc(
            db,
            "users",
            auth.currentUser.uid
          );

          const docSnap =
            await getDoc(docRef);

          if (
            docSnap.exists()
          ) {
            setUserData(
              docSnap.data()
            );

            setImage(
              docSnap.data()
                .avatar
            );
          }
        } catch (e) {
          console.log(e);
        }
      };

    fetchUser();
  }, []);

  const logout =
    async () => {
      try {
        await signOut(auth);
      } catch (e) {
        console.log(e);
      }
    };

  const uploadImage =
    async (uri) => {
      try {
        const response =
          await fetch(uri);

        const blob =
          await response.blob();

        const filename =
          `avatars/${auth.currentUser.uid}_${Date.now()}`;

        const storageRef =
          ref(
            storage,
            filename
          );

        await uploadBytes(
          storageRef,
          blob
        );

        const downloadURL =
          await getDownloadURL(
            storageRef
          );

        return downloadURL;
      } catch (e) {
        console.log(e);
      }
    };

  const pickImage =
    async () => {
      let result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes: [
              "images",
            ],

            allowsEditing: true,

            aspect: [1, 1],

            quality: 1,
          }
        );

      if (
        !result.canceled
      ) {
        const localUri =
          result.assets[0]
            .uri;

        setImage(localUri);

        try {
          const imageUrl =
            await uploadImage(
              localUri
            );

          await updateDoc(
            doc(
              db,
              "users",
              auth
                .currentUser
                .uid
            ),
            {
              avatar:
                imageUrl,
            }
          );

          setImage(
            imageUrl
          );
        } catch (e) {
          console.log(e);
        }
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
        justifyContent:
          "center",

        alignItems:
          "center",

        padding: 20,

        paddingTop: 80,
      }}
    >
      <Text
        style={{
          fontSize: 36,

          fontWeight:
            "bold",

          marginBottom: 40,

          color: "#111827",
        }}
      >
        Profil
      </Text>

      {/* PROFILE IMAGE */}
      <TouchableOpacity
        onPress={
          pickImage
        }
        style={{
          alignItems:
            "center",

          marginBottom: 30,
        }}
      >
        <Image
          source={{
            uri:
              image ||
              "https://i.pravatar.cc/300",
          }}
          style={{
            width: 130,

            height: 130,

            borderRadius: 65,

            borderWidth: 4,

            borderColor:
              "white",
          }}
        />

        <Text
          style={{
            marginTop: 14,

            fontSize: 16,

            color:
              "#2563EB",

            fontWeight:
              "bold",
          }}
        >
          Endre profilbilde
        </Text>
      </TouchableOpacity>

      {/* USER INFO */}
      <View
        style={{
          backgroundColor:
            "white",

          width: "100%",

          padding: 25,

          borderRadius: 24,

          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 26,

            fontWeight:
              "bold",

            color:
              "#111827",

            marginBottom: 12,
          }}
        >
          {userData?.email}
        </Text>

        <Text
          style={{
            fontSize: 18,

            color:
              "#111827",

            marginBottom: 10,
          }}
        >
          ⭐{" "}
          {userData?.rating ||
            5}
          /5 rating
        </Text>

        <Text
          style={{
            fontSize: 18,

            color:
              "#111827",

            marginBottom: 10,
          }}
        >
          ✅{" "}
          {userData?.completedTasks ||
            0}{" "}
          fullførte oppdrag
        </Text>

        <Text
          style={{
            fontSize: 16,

            color:
              userData?.online
                ? "#22C55E"
                : "#6B7280",
          }}
        >
          {userData?.online
            ? "🟢 Online nå"
            : "Sist aktiv nylig"}
        </Text>
      </View>

      {/* STATS */}
      <View
        style={{
          flexDirection:
            "row",

          width: "100%",

          justifyContent:
            "space-between",

          marginBottom: 40,
        }}
      >
        <View
          style={{
            backgroundColor:
              "white",

            width: "48%",

            padding: 22,

            borderRadius: 22,

            alignItems:
              "center",
          }}
        >
          <Text
            style={{
              fontSize: 28,

              fontWeight:
                "bold",

              color:
                "#2563EB",
            }}
          >
            {userData?.completedTasks ||
              0}
          </Text>

          <Text
            style={{
              marginTop: 8,

              color:
                "#6B7280",
            }}
          >
            Oppdrag
          </Text>
        </View>

        <View
          style={{
            backgroundColor:
              "white",

            width: "48%",

            padding: 22,

            borderRadius: 22,

            alignItems:
              "center",
          }}
        >
          <Text
            style={{
              fontSize: 28,

              fontWeight:
                "bold",

              color:
                "#22C55E",
            }}
          >
            {userData?.rating ||
              5}
          </Text>

          <Text
            style={{
              marginTop: 8,

              color:
                "#6B7280",
            }}
          >
            Rating
          </Text>
        </View>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity
        onPress={logout}
        style={{
          backgroundColor:
            "#EF4444",

          paddingVertical: 18,

          paddingHorizontal: 50,

          borderRadius: 22,
        }}
      >
        <Text
          style={{
            color: "white",

            fontSize: 18,

            fontWeight:
              "bold",
          }}
        >
          Logg ut
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}