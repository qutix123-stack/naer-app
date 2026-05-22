import React, {
  useEffect,
  useState,
} from "react";

import {
  Image,
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";

import {
  signOut,
  updatePassword,
  deleteUser,
} from "firebase/auth";

import { auth } from "../firebaseConfig";

import * as ImagePicker from "expo-image-picker";

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebaseConfig";

export default function ProfileScreen() {
  const [image, setImage] =
    useState(null);

  const [userData, setUserData] =
    useState(null);

  const [reviews, setReviews] =
    useState([]);

  const [averageRating, setAverageRating] =
    useState(5);

  const [newPassword, setNewPassword] =
    useState("");

  const [name, setName] =
    useState("");

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  // 🔥 HELPER LEVEL
  const getHelperLevel =
    () => {
      const completed =
        userData?.completedTasks ||
        0;

      if (
        completed >= 100
      ) {
        return {
          title:
            "👑 Elite Helper",

          color:
            "#F59E0B",
        };
      }

      if (
        completed >= 50
      ) {
        return {
          title:
            "⭐ Super Helper",

          color:
            "#8B5CF6",
        };
      }

      if (
        completed >= 20
      ) {
        return {
          title:
            "✅ Trusted Helper",

          color:
            "#2563EB",
        };
      }

      if (
        completed >= 5
      ) {
        return {
          title:
            "🚀 Aktiv Helper",

          color:
            "#22C55E",
        };
      }

      return {
        title:
          "🌱 Ny Helper",

        color:
          "#6B7280",
      };
    };

  const helperLevel =
    getHelperLevel();

  // 🔥 LOGOUT
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.log(e);
    }
  };

  // 🔥 LOAD USER
  useEffect(() => {
    const fetchUser =
      async () => {
        try {
          const docRef =
            doc(
              db,
              "users",
              auth
                .currentUser
                .uid
            );

          const docSnap =
            await getDoc(
              docRef
            );

          if (
            docSnap.exists()
          ) {
            const data =
              docSnap.data();

            setUserData(
              data
            );

            setName(
              data.name ||
                ""
            );
          }
        } catch (e) {
          console.log(e);
        }
      };

    fetchUser();
  }, []);

  // 🔥 LOAD REVIEWS
  useEffect(() => {
    if (
      !auth.currentUser
    )
      return;

    const q = query(
      collection(
        db,
        "reviews"
      ),

      where(
        "to",
        "==",
        auth.currentUser
          ?.email
      )
    );

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {
          const loadedReviews =
            snapshot.docs.map(
              (
                document
              ) => ({
                id: document.id,
                ...document.data(),
              })
            );

          setReviews(
            loadedReviews
          );

          if (
            loadedReviews.length >
            0
          ) {
            const total =
              loadedReviews.reduce(
                (
                  sum,
                  review
                ) =>
                  sum +
                  (review.rating ||
                    5),

                0
              );

            setAverageRating(
              (
                total /
                loadedReviews.length
              ).toFixed(
                1
              )
            );
          }
        }
      );

    return unsubscribe;
  }, []);

  // 🔥 PICK IMAGE
  const pickImage =
    async () => {
      let result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes:
              ImagePicker.MediaType.Images,

            allowsEditing: true,

            aspect: [1, 1],

            quality: 1,
          }
        );

      if (
        !result.canceled
      ) {
        setImage(
          result.assets[0]
            .uri
        );
      }
    };

  // 🔥 SAVE NAME
  const saveName =
    async () => {
      try {
        if (
          !name.trim()
        ) {
          return Alert.alert(
            "Skriv inn navn"
          );
        }

        await updateDoc(
          doc(
            db,
            "users",
            auth
              .currentUser
              .uid
          ),

          {
            name:
              name.trim(),
          }
        );

        Alert.alert(
          "Navn lagret 😄"
        );
      } catch (e) {
        console.log(e);
      }
    };

  // 🔥 CHANGE PASSWORD
  const changePassword =
    async () => {
      try {
        if (
          newPassword.length <
          6
        ) {
          return Alert.alert(
            "Passord må være minst 6 tegn"
          );
        }

        await updatePassword(
          auth.currentUser,
          newPassword
        );

        setNewPassword(
          ""
        );

        setShowPasswordModal(
          false
        );

        Alert.alert(
          "Passord oppdatert 🔥"
        );
      } catch (e) {
        console.log(e);

        Alert.alert(
          "Logg inn igjen for å endre passord"
        );
      }
    };

  // 🔥 DELETE ACCOUNT
  const removeAccount =
    () => {
      Alert.alert(
        "Slett bruker",

        "Er du sikker på at du vil slette brukeren?",

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
              async () => {
                try {
                  await deleteUser(
                    auth.currentUser
                  );

                  Alert.alert(
                    "Bruker slettet"
                  );
                } catch (e) {
                  console.log(
                    e
                  );

                  Alert.alert(
                    "Logg inn igjen for å slette bruker"
                  );
                }
              },
          },
        ]
      );
    };

  return (
    <ScrollView
      style={{
        flex: 1,

        backgroundColor:
          "#F4F6F8",
      }}
      contentContainerStyle={{
        padding: 20,

        paddingTop: 60,

        paddingBottom: 60,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >
      <Text
        style={{
          fontSize: 32,

          fontWeight:
            "bold",

          marginBottom: 30,

          textAlign:
            "center",
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

              userData
                ?.avatar ||

              "https://i.pravatar.cc/300",
          }}
          style={{
            width: 120,

            height: 120,

            borderRadius: 60,

            borderWidth: 4,

            borderColor:
              helperLevel.color,
          }}
        />

        <Text
          style={{
            marginTop: 12,

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

      {/* NAME */}
      <TextInput
        placeholder="Fornavn"
        value={name}
        onChangeText={
          setName
        }
        style={{
          backgroundColor:
            "white",

          width: "100%",

          padding: 18,

          borderRadius: 18,

          marginBottom: 14,

          fontSize: 16,
        }}
      />

      <TouchableOpacity
        onPress={
          saveName
        }
        style={{
          backgroundColor:
            "#22C55E",

          paddingVertical: 16,

          borderRadius: 18,

          marginBottom: 20,

          width: "100%",

          alignItems:
            "center",
        }}
      >
        <Text
          style={{
            color:
              "white",

            fontSize: 16,

            fontWeight:
              "bold",
          }}
        >
          Lagre navn
        </Text>
      </TouchableOpacity>

      {/* USER CARD */}
      <View
        style={{
          backgroundColor:
            "white",

          padding: 24,

          borderRadius: 28,

          marginBottom: 24,

          shadowColor:
            "#000",

          shadowOpacity: 0.08,

          shadowRadius: 10,

          elevation: 4,
        }}
      >
        <Text
          style={{
            fontSize: 30,

            fontWeight:
              "bold",

            color:
              "#111827",

            marginBottom: 10,
          }}
        >
          {userData?.name ||
            "Bruker"}
        </Text>

        <Text
          style={{
            fontSize: 16,

            color:
              "#6B7280",

            marginBottom: 18,
          }}
        >
          {userData?.email}
        </Text>

        {/* HELPER LEVEL */}
        <View
          style={{
            backgroundColor:
              helperLevel.color,

            paddingHorizontal: 16,

            paddingVertical: 10,

            borderRadius: 18,

            alignSelf:
              "flex-start",

            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color:
                "white",

              fontWeight:
                "bold",

              fontSize: 16,
            }}
          >
            {
              helperLevel.title
            }
          </Text>
        </View>

        {/* STATS */}
        <View
          style={{
            flexDirection:
              "row",

            justifyContent:
              "space-between",

            marginTop: 10,
          }}
        >
          <View
            style={{
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
                  "#F59E0B",
              }}
            >
              ⭐{" "}
              {averageRating}
            </Text>

            <Text
              style={{
                color:
                  "#6B7280",

                marginTop: 6,
              }}
            >
              Rating
            </Text>
          </View>

          <View
            style={{
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
              {
                reviews.length
              }
            </Text>

            <Text
              style={{
                color:
                  "#6B7280",

                marginTop: 6,
              }}
            >
              Reviews
            </Text>
          </View>

          <View
            style={{
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
              {userData?.completedTasks ||
                0}
            </Text>

            <Text
              style={{
                color:
                  "#6B7280",

                marginTop: 6,
              }}
            >
              Oppdrag
            </Text>
          </View>
        </View>
      </View>

      {/* REVIEWS */}
      <Text
        style={{
          fontSize: 24,

          fontWeight:
            "bold",

          marginBottom: 20,

          color:
            "#111827",
        }}
      >
        Reviews ⭐
      </Text>

      {reviews.length ===
      0 ? (
        <View
          style={{
            backgroundColor:
              "white",

            padding: 24,

            borderRadius: 24,

            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 16,

              color:
                "#6B7280",
            }}
          >
            Ingen reviews enda 😄
          </Text>
        </View>
      ) : (
        reviews.map(
          (
            review
          ) => (
            <View
              key={
                review.id
              }
              style={{
                backgroundColor:
                  "white",

                padding: 20,

                borderRadius: 20,

                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 18,

                  fontWeight:
                    "bold",

                  color:
                    "#F59E0B",

                  marginBottom: 8,
                }}
              >
                ⭐{" "}
                {review.rating}
                /5
              </Text>

              <Text
                style={{
                  fontSize: 16,

                  color:
                    "#374151",

                  lineHeight: 24,
                }}
              >
                {review.review}
              </Text>
            </View>
          )
        )
      )}

      {/* PASSWORD BUTTON */}
      <TouchableOpacity
        onPress={() =>
          setShowPasswordModal(
            true
          )
        }
        style={{
          backgroundColor:
            "#2563EB",

          paddingVertical: 18,

          borderRadius: 20,

          marginBottom: 14,

          width: "100%",

          alignItems:
            "center",
        }}
      >
        <Text
          style={{
            color:
              "white",

            fontSize: 18,

            fontWeight:
              "bold",
          }}
        >
          Bytt passord
        </Text>
      </TouchableOpacity>

      {/* DELETE USER */}
      <TouchableOpacity
        onPress={
          removeAccount
        }
        style={{
          backgroundColor:
            "#DC2626",

          paddingVertical: 18,

          borderRadius: 20,

          marginBottom: 14,

          width: "100%",

          alignItems:
            "center",
        }}
      >
        <Text
          style={{
            color:
              "white",

            fontSize: 18,

            fontWeight:
              "bold",
          }}
        >
          Slett bruker
        </Text>
      </TouchableOpacity>

      {/* LOGOUT */}
      <TouchableOpacity
        onPress={logout}
        style={{
          backgroundColor:
            "#111827",

          paddingVertical: 18,

          borderRadius: 20,

          width: "100%",

          alignItems:
            "center",
        }}
      >
        <Text
          style={{
            color:
              "white",

            fontSize: 18,

            fontWeight:
              "bold",
          }}
        >
          Logg ut
        </Text>
      </TouchableOpacity>

      {/* PASSWORD MODAL */}
      <Modal
        visible={
          showPasswordModal
        }
        transparent
        animationType="slide"
      >
        <View
          style={{
            flex: 1,

            backgroundColor:
              "rgba(0,0,0,0.4)",

            justifyContent:
              "center",

            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor:
                "white",

              borderRadius: 24,

              padding: 24,
            }}
          >
            <Text
              style={{
                fontSize: 26,

                fontWeight:
                  "bold",

                marginBottom: 20,
              }}
            >
              Bytt passord
            </Text>

            <TextInput
              placeholder="Nytt passord"
              value={
                newPassword
              }
              onChangeText={
                setNewPassword
              }
              secureTextEntry
              style={{
                backgroundColor:
                  "#F3F4F6",

                padding: 18,

                borderRadius: 18,

                marginBottom: 20,
              }}
            />

            <TouchableOpacity
              onPress={
                changePassword
              }
              style={{
                backgroundColor:
                  "#2563EB",

                padding: 18,

                borderRadius: 18,

                alignItems:
                  "center",

                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color:
                    "white",

                  fontWeight:
                    "bold",

                  fontSize: 16,
                }}
              >
                Lagre passord
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setShowPasswordModal(
                  false
                )
              }
              style={{
                alignItems:
                  "center",
              }}
            >
              <Text
                style={{
                  color:
                    "#6B7280",

                  fontSize: 16,
                }}
              >
                Lukk
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}