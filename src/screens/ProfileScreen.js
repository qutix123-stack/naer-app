import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { LinearGradient }
from "expo-linear-gradient";

import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Animated,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Keyboard,
} from "react-native";

import {
  Ionicons,
  Feather,
} from "@expo/vector-icons";

import {
  auth,
  db,
  storage, 
} from "../firebaseConfig";

import {
  signOut,
  updatePassword,
  deleteUser,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {


  const [userData, setUserData] =
    useState(null);

  const [reviews, setReviews] =
    useState([]);

  const [averageRating, setAverageRating] =
    useState(5);

  const [image, setImage] =
    useState(null);

  const [newName, setNewName] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    showNameModal,
    setShowNameModal,
  ] = useState(false);

  const [
    showPasswordModal,
    setShowPasswordModal,
  ] = useState(false);

  // LOAD USER
  useEffect(() => {

    const fetchUser =
      async () => {

        try {

          const userRef =
            doc(
              db,
              "users",
              auth.currentUser.uid
            );

          const userSnap =
            await getDoc(
              userRef
            );

          if (
            userSnap.exists()
          ) {

            const data =
              userSnap.data();

            setUserData(
              data
            );

            setNewName(
              data.name || ""
            );
          }

        } catch (e) {
          console.log(e);
        }
      };

    fetchUser();

  }, []);

  // LOAD REVIEWS
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
        auth.currentUser.email
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

  // PICK IMAGE
  const pickImage =
  async () => {

    try {

      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes: [
              "images",
            ],

            allowsEditing:
              true,

            aspect: [1, 1],

            quality: 0.7,
          }
        );

      if (
        result.canceled
      )
        return;

      const uri =
        result.assets[0]
          .uri;

      setImage(uri);

      // FETCH IMAGE
      const response =
        await fetch(
          uri
        );

      const blob =
        await response.blob();

      // STORAGE REF
      const storageRef =
        ref(
          storage,

          `avatars/${auth.currentUser.uid}`
        );

      // UPLOAD
      await uploadBytes(
        storageRef,
        blob
      );

      // GET URL
      const downloadURL =
        await getDownloadURL(
          storageRef
        );

      // SAVE TO FIRESTORE
      await setDoc(
        doc(
          db,
          "users",
          auth.currentUser.uid
        ),

        {
          avatar:
            downloadURL,
        },

        {
          merge: true,
        }
      );

      // UPDATE LOCAL
      setUserData({
        ...userData,

        avatar:
          downloadURL,
      });

      Alert.alert(
        "Profilbilde oppdatert 😄"
      );

    } catch (e) {

      console.log(e);

      Alert.alert(
        "Kunne ikke laste opp bilde"
      );
    }
  };

  // SAVE NAME
  const saveName =
    async () => {

      try {

        if (
          !newName.trim()
        ) {

          return Alert.alert(
            "Skriv inn navn"
          );
        }

        Keyboard.dismiss();

        await setDoc(
          doc(
            db,
            "users",
            auth.currentUser.uid
          ),

          {
            name:
              newName.trim(),
          },

          {
            merge: true,
          }
        );

        await updateProfile(
          auth.currentUser,

          {
            displayName:
              newName.trim(),
          }
        );

        setUserData({
          ...userData,

          name:
            newName.trim(),
        });

        setShowNameModal(
          false
        );

      } catch (e) {
        console.log(e);
      }
    };

  // CHANGE PASSWORD
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

        setNewPassword("");

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

  // LOGOUT
  const logout =
  async () => {

    try {

      await signOut(auth);

      navigation.reset({
        index: 0,

        routes: [
          {
            name:
              "Login",
          },
        ],
      });

    } catch (e) {

      console.log(e);

      Alert.alert(
        "Logout feilet"
      );
    }
  };

  // DELETE ACCOUNT
  const removeAccount =
    () => {

      Alert.alert(
        "Slett bruker",

        "Er du sikker?",

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

                } catch (e) {

                  console.log(
                    e
                  );
                }
              },
          },
        ]
      );
    };

  return (

    <ScrollView
      style={
        styles.container
      }
      contentContainerStyle={{
        paddingBottom: 140,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >

      {/* HERO */}

<LinearGradient
  colors={[
    "#2563EB",
    "#3B82F6",
    "#60A5FA",
  ]}

  style={{
    paddingTop: 90,

    paddingBottom: 120,

    borderBottomLeftRadius: 40,

    borderBottomRightRadius: 40,

    alignItems:
      "center",

    marginBottom: -70,
  }}
>

  <TouchableOpacity
    onPress={
      pickImage
    }
    activeOpacity={0.8}
  >

    <View>

      <Image
        source={{
          uri:
            image ||

            userData?.avatar ||

            "https://i.pravatar.cc/300",
        }}

        style={{
          width: 120,

          height: 120,

          borderRadius: 60,

          borderWidth: 4,

          borderColor:
            "white",

          marginBottom: 18,
        }}
      />

      {userData?.verified && (

        <View
          style={{
            position:
              "absolute",

            bottom: 20,

            right: 0,

            width: 32,

            height: 32,

            borderRadius: 16,

            backgroundColor:
              "#22C55E",

            justifyContent:
              "center",

            alignItems:
              "center",

            borderWidth: 3,

            borderColor:
              "white",
          }}
        >

          <Ionicons
            name="checkmark"
            size={16}
            color="white"
          />

        </View>
      )}

    </View>

  </TouchableOpacity>

  <Text
    style={{
      color:
        "white",

      fontSize: 34,

      fontWeight:
        "800",

      marginTop: 10,
    }}
  >
    {userData?.name ||
      "Bruker"}
  </Text>

  <Text
    style={{
      color:
        "rgba(255,255,255,0.85)",

      marginTop: 8,

      fontSize: 16,
    }}
  >
    Hjelper folk i nærheten 😄
  </Text>

</LinearGradient>

      {/* HEADER */}
      <View
        style={
          styles.header
        }
      >

        <Text
          style={
            styles.headerTitle
          }
        >
          Profil
        </Text>

      </View>

      {/* STATS */}
      <View
        style={
          styles.statsContainer
        }
      >

        <View
          style={
            styles.statBox
          }
        >
          <Text
            style={
              styles.statNumber
            }
          >
            {userData?.completedTasks ||
              0}
          </Text>

          <Text
            style={
              styles.statLabel
            }
          >
            Fullførte
          </Text>
        </View>

        <View
          style={
            styles.statBox
          }
        >
          <Text
            style={
              styles.statNumber
            }
          >
            {reviews.length}
          </Text>

          <Text
            style={
              styles.statLabel
            }
          >
            Hjulpet
          </Text>
        </View>

        <View
          style={
            styles.statBox
          }
        >
          <Text
            style={
              styles.statNumber
            }
          >
            {averageRating}
          </Text>

          <Text
            style={
              styles.statLabel
            }
          >
            Rating
          </Text>
        </View>

      </View>

      {/* MENU */}
      <View
        style={
          styles.menuContainer
        }
      >

        <MenuItem
          icon="shield-checkmark-outline"
          title="Verifisert"
        />

        <MenuItem
          icon="card-outline"
          title="Betalinger"
        />

        <MenuItem
          icon="settings-outline"
          title="Innstillinger"
          onPress={() =>
            setShowNameModal(
              true
            )
          }
        />

        <MenuItem
          icon="help-circle-outline"
          title="Hjelp & support"
        />

      </View>

      {/* BUTTONS */}
      <TouchableOpacity
        style={
          styles.logoutButton
        }
        onPress={
          logout
        }
      >
        <Text
          style={
            styles.logoutText
          }
        >
          Logg ut
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={
          styles.deleteButton
        }
        onPress={
          removeAccount
        }
      >
        <Text
          style={
            styles.deleteText
          }
        >
          Slett bruker
        </Text>
      </TouchableOpacity>

      {/* NAME MODAL */}
      <Modal
        visible={
          showNameModal
        }
        transparent
        animationType="fade"
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <View
            style={
              styles.modalContent
            }
          >

            <Text
              style={
                styles.modalTitle
              }
            >
              Endre navn
            </Text>

            <TextInput
              value={newName}
              onChangeText={
                setNewName
              }
              placeholder="Nytt navn"
              style={
                styles.input
              }
            />

            <TouchableOpacity
              style={
                styles.saveButton
              }
              onPress={
                saveName
              }
            >
              <Text
                style={
                  styles.saveText
                }
              >
                Lagre
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      </Modal>

      {/* PASSWORD MODAL */}
      <Modal
        visible={
          showPasswordModal
        }
        transparent
        animationType="fade"
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <View
            style={
              styles.modalContent
            }
          >

            <Text
              style={
                styles.modalTitle
              }
            >
              Bytt passord
            </Text>

            <TextInput
              secureTextEntry
              value={
                newPassword
              }
              onChangeText={
                setNewPassword
              }
              placeholder="Nytt passord"
              style={
                styles.input
              }
            />

            <TouchableOpacity
              style={
                styles.saveButton
              }
              onPress={
                changePassword
              }
            >
              <Text
                style={
                  styles.saveText
                }
              >
                Lagre passord
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </ScrollView>
  );
}

function MenuItem({
  icon,
  title,
  onPress,
}) {

  return (

    <TouchableOpacity
      style={
        styles.menuItem
      }
      onPress={
        onPress
      }
      activeOpacity={
        0.7
      }
    >

      <View
        style={
          styles.menuLeft
        }
      >

        <Ionicons
          name={icon}
          size={22}
          color="#111827"
        />

        <Text
          style={
            styles.menuText
          }
        >
          {title}
        </Text>

      </View>

      <Feather
        name="chevron-right"
        size={20}
        color="#9CA3AF"
      />

    </TouchableOpacity>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,

      backgroundColor:
        "#F8FAFC",
    },

    header: {
      paddingTop: 70,

      paddingHorizontal: 24,

      marginBottom: 30,
    },

    headerTitle: {
      fontSize: 34,

      fontWeight:
        "700",

      color: "#0F172A",
    },

    profileSection: {
      alignItems:
        "center",

      marginBottom: 34,
    },

    avatar: {
      width: 120,

      height: 120,

      borderRadius: 60,
    },

    verifiedBadge: {
    position: "absolute",

    bottom: 6,

    right: 6,

    width: 28,

    height: 28,

    borderRadius: 14,

    backgroundColor: "#22C55E",

    justifyContent: "center",

    alignItems: "center",

    borderWidth: 2,

    borderColor: "white",
  },

    name: {
      fontSize: 28,

      fontWeight:
        "700",

      color: "#111827",

      marginTop: 18,
    },

    rating: {
      marginTop: 8,

      fontSize: 16,

      color: "#6B7280",
    },

    statsContainer: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      marginHorizontal: 24,

      backgroundColor:
        "white",

      borderRadius: 26,

      paddingVertical: 24,

      marginBottom: 28,

      elevation: 4,
    },

    statBox: {
      flex: 1,

      alignItems:
        "center",
    },

    statNumber: {
      fontSize: 26,

      fontWeight:
        "700",

      color: "#111827",
    },

    statLabel: {
      marginTop: 6,

      color: "#6B7280",

      fontSize: 14,
    },

    menuContainer: {
      backgroundColor:
        "white",

      marginHorizontal: 24,

      borderRadius: 26,

      paddingVertical: 8,

      marginBottom: 30,

      elevation: 4,
    },

    menuItem: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      paddingHorizontal: 20,

      paddingVertical: 20,

      borderBottomWidth: 1,

      borderBottomColor:
        "#F1F5F9",
    },

    menuLeft: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    menuText: {
      marginLeft: 14,

      fontSize: 16,

      color: "#111827",

      fontWeight:
        "500",
    },

    logoutButton: {
      marginHorizontal: 24,

      backgroundColor:
        "#0F172A",

      paddingVertical: 18,

      borderRadius: 18,

      alignItems:
        "center",

      marginBottom: 14,
    },

    logoutText: {
      color: "white",

      fontWeight:
        "700",

      fontSize: 16,
    },

    deleteButton: {
      marginHorizontal: 24,

      backgroundColor:
        "#EF4444",

      paddingVertical: 18,

      borderRadius: 18,

      alignItems:
        "center",
    },

    deleteText: {
      color: "white",

      fontWeight:
        "700",

      fontSize: 16,
    },

    modalOverlay: {
      flex: 1,

      justifyContent:
        "center",

      backgroundColor:
        "rgba(0,0,0,0.45)",

      padding: 24,
    },

    modalContent: {
      backgroundColor:
        "white",

      borderRadius: 28,

      padding: 24,
    },

    modalTitle: {
      fontSize: 24,

      fontWeight:
        "700",

      marginBottom: 20,

      color: "#111827",
    },

    input: {
      backgroundColor:
        "#F1F5F9",

      borderRadius: 18,

      padding: 16,

      marginBottom: 20,

      fontSize: 16,
    },

    saveButton: {
      backgroundColor:
        "#22C55E",

      paddingVertical: 16,

      borderRadius: 18,

      alignItems:
        "center",
    },

    saveText: {
      color: "white",

      fontWeight:
        "700",

      fontSize: 16,
    },
  });