import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import {
  LinearGradient,
} from "expo-linear-gradient";

import {
  registerForPushNotifications,
} from "../services/notifications";

import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Keyboard,
  Platform,
  ActivityIndicator,
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
  EmailAuthProvider,
  reauthenticateWithCredential,
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

export default function UserProfileScreen({
    route,
    navigation,
}) {

const { userId } =
  route.params;

  console.log(
  "USER PROFILE SCREEN",
  userId
);

  const [userData, setUserData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [reviews, setReviews] =
  useState([]);

  const [averageRating, setAverageRating] =
    useState(5);

  const [image, setImage] =
    useState(null);

  const [newName, setNewName] =
    useState("");

  const [newBio, setNewBio] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    showNameModal,
    setShowNameModal,
  ] = useState(false);

  const [
    showPasswordModal,
    setShowPasswordModal,
  ] = useState(false);

  useEffect(() => {
    const fetchUser =
      async () => {

        if (
          !auth.currentUser
        )
          return;

        try {

          const userRef =
            doc(
              db,
              "users",
              userId
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

            setNewBio(
              data.bio || ""
            );
          }

        } catch (e) {

          console.log(e);
        }
      };

    fetchUser();

// PUSH
      const savePushToken =
  async () => {

    try {

      const token =
        await registerForPushNotifications();

      if (token) {

        await setDoc(
          doc(
            db,
            "users",
            userId
          ),
          {
            expoPushToken:
              token,
          },
          {
            merge: true,
          }
        );

        console.log(
          "PUSH TOKEN:",
          token
        );
      }

    } catch (e) {

      console.log(e);
    }
  };

savePushToken();

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
        userId
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
                id:
                  document.id,

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
              mediaTypes:
                ImagePicker.MediaTypeOptions.Images,

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

        setLoading(true);

        const uri =
          result.assets[0]
            .uri;

        setImage(uri);

        const response =
          await fetch(
            uri
          );

        const blob =
          await response.blob();

        const storageRef =
          ref(
            storage,

            `avatars/${userId}`
          );

        await uploadBytes(
          storageRef,
          blob
        );

        const downloadURL =
          await getDownloadURL(
            storageRef
          );

        await setDoc(
          doc(
            db,
            "users",
            userId
          ),

          {
            avatar:
              downloadURL,
          },

          {
            merge: true,
          }
        );

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

      } finally {

        setLoading(false);
      }
    };

  // SAVE PROFILE

  const saveProfile =
    async () => {

      try {

        Keyboard.dismiss();

        await setDoc(
          doc(
            db,
            "users",
            userId
          ),

          {
            name:
              newName.trim(),

            bio:
              newBio.trim(),
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
            newName,

          bio:
            newBio,
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

        const credential =
          EmailAuthProvider.credential(

            auth.currentUser.email,

            currentPassword
          );

        await reauthenticateWithCredential(
          auth.currentUser,
          credential
        );

        await updatePassword(
          auth.currentUser,
          newPassword
        );

        Alert.alert(
          "Passord oppdatert 😄"
        );

        setShowPasswordModal(
          false
        );

      } catch (e) {

        console.log(e);

        Alert.alert(
          "Feil passord"
        );
      }
    };

  // LOGOUT

  const logout =
    async () => {

      try {

        setLoading(true);

        await signOut(
          auth
        );

      } catch (e) {

        console.log(e);

      } finally {

        setLoading(false);
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

                  console.log(e);
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

        style={
          styles.hero
        }
      >

        <TouchableOpacity
          onPress={
            pickImage
          }

          activeOpacity={
            0.8
          }
        >

          <Image
            source={{
              uri:
                image ||

                userData?.avatar ||

                "https://i.pravatar.cc/300",
            }}

            style={
              styles.avatar
            }
          />

          <View
            style={
              styles.editAvatar
            }
          >

            <Ionicons
              name="camera"
              size={18}
              color="#FFFFFF"
            />

          </View>

          {/* VERIFIED */}

          <View
            style={
              styles.verifiedBadge
            }
          >

            <Ionicons
              name="checkmark"
              size={14}
              color="#FFFFFF"
            />

          </View>

        </TouchableOpacity>

        <Text
          style={
            styles.name
          }
        >
          {userData?.name ||
            "Bruker"}
        </Text>

        <Text
          style={
            styles.bio
          }
        >
          {userData?.bio ||

            "Hjelper folk i nærheten 😄"}
        </Text>

      </LinearGradient>

      {/* TRUST */}

      <View
        style={
          styles.trustContainer
        }
      >

        <View
          style={
            styles.trustCard
          }
        >

          <View
            style={
              styles.trustIcon
            }
          >

            <Ionicons
              name="shield-checkmark"
              size={26}
              color="#2563EB"
            />

          </View>

          <View
            style={{
              flex: 1,
            }}
          >

            <Text
              style={
                styles.trustTitle
              }
            >
              Verifisert bruker
            </Text>

            <Text
              style={
                styles.trustSubtitle
              }
            >
              Trygg og aktiv hjelper 😄
            </Text>

          </View>

        </View>

        <View
          style={
            styles.levelCard
          }
        >

          <View
            style={
              styles.levelTop
            }
          >

            <Text
              style={
                styles.levelTitle
              }
            >
              Helper level
            </Text>

            <Text
              style={
                styles.levelBadge
              }
            >
              🔥 Pro
            </Text>

          </View>

          <View
            style={
              styles.levelBar
            }
          >

            <View
              style={
                styles.levelProgress
              }
            />

          </View>

          <Text
            style={
              styles.levelText
            }
          >
            {userData?.completedTasks || 0}
            /50 oppdrag fullført
          </Text>

        </View>

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
            {
              userData?.completedTasks ||
              0
            }
          </Text>

          <Text
            style={
              styles.statLabel
            }
          >
            Oppdrag
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
            {
              reviews.length
            }
          </Text>

          <Text
            style={
              styles.statLabel
            }
          >
            Reviews
          </Text>

        </View>

      </View>

      
{/* REVIEWS */}

<View
  style={{
    marginHorizontal: 24,
    marginBottom: 24,
  }}
>

  <Text
    style={{
      fontSize: 22,
      fontWeight: "800",
      color: "#111827",
      marginBottom: 16,
    }}
  >
    Reviews
  </Text>

  {reviews.length === 0 ? (

    <Text
      style={{
        color: "#6B7280",
      }}
    >
      Ingen reviews enda
    </Text>

  ) : (

    reviews.map(
      (review) => (

        <View
          key={review.id}
          style={{
            backgroundColor:
              "#FFFFFF",

            borderRadius: 24,

            padding: 18,

            marginBottom: 12,
          }}
        >

          <Text
            style={{
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            ⭐ {review.rating}
          </Text>

          <Text
            style={{
              color: "#374151",
              marginBottom: 10,
            }}
          >
            {review.text}
          </Text>

          <Text
            style={{
              color: "#6B7280",
              fontSize: 13,
            }}
          >
            - {review.fromName}
          </Text>

        </View>
      )
    )

  )}

</View>

    </ScrollView>
  );
}

const styles =
  StyleSheet.create({

    settingsContainer: {

  marginHorizontal: 24,

  backgroundColor: "#FFFFFF",

  borderRadius: 28,

  padding: 12,

  marginBottom: 24,
},

settingItem: {

  flexDirection: "row",

  alignItems: "center",

  paddingVertical: 18,

  paddingHorizontal: 12,
},

settingText: {

  marginLeft: 14,

  fontSize: 16,

  color: "#111827",

  fontWeight: "600",
},

logoutText: {

  marginLeft: 14,

  fontSize: 16,

  color: "#EF4444",

  fontWeight: "700",
},

    container: {

      flex: 1,

      backgroundColor:
        "#F8FAFC",
    },

    hero: {

      paddingTop:
        Platform.OS ===
        "android"

          ? 70

          : 90,

      paddingBottom: 120,

      borderBottomLeftRadius: 40,

      borderBottomRightRadius: 40,

      alignItems:
        "center",

      marginBottom: -70,
    },

    avatar: {

      width: 120,

      height: 120,

      borderRadius: 60,

      borderWidth: 4,

      borderColor:
        "#FFFFFF",
    },

    editAvatar: {

      width: 38,

      height: 38,

      borderRadius: 19,

      backgroundColor:
        "#111827",

      justifyContent:
        "center",

      alignItems:
        "center",

      position:
        "absolute",

      bottom: 0,

      right: 0,
    },

    verifiedBadge: {

      position:
        "absolute",

      top: 4,

      right: 4,

      width: 32,

      height: 32,

      borderRadius: 999,

      backgroundColor:
        "#2563EB",

      justifyContent:
        "center",

      alignItems:
        "center",

      borderWidth: 3,

      borderColor:
        "#FFFFFF",
    },

    name: {

      color:
        "#FFFFFF",

      fontSize: 34,

      fontWeight: "800",

      marginTop: 18,
    },

    bio: {

      color:
        "rgba(255,255,255,0.85)",

      marginTop: 8,

      fontSize: 16,

      paddingHorizontal: 30,

      textAlign:
        "center",
    },

    trustContainer: {

      marginHorizontal: 24,

      marginBottom: 28,
    },

    trustCard: {

      backgroundColor:
        "#FFFFFF",

      borderRadius: 28,

      padding: 20,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom: 16,

      elevation: 4,
    },

    trustIcon: {

      width: 58,

      height: 58,

      borderRadius: 20,

      backgroundColor:
        "#EFF6FF",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight: 16,
    },

    trustTitle: {

      fontSize: 17,

      fontWeight: "800",

      color:
        "#111827",

      marginBottom: 4,
    },

    trustSubtitle: {

      fontSize: 14,

      color:
        "#6B7280",
    },

    levelCard: {

      backgroundColor:
        "#111827",

      borderRadius: 28,

      padding: 22,
    },

    levelTop: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom: 18,
    },

    levelTitle: {

      fontSize: 18,

      fontWeight: "800",

      color:
        "#FFFFFF",
    },

    levelBadge: {

      fontSize: 15,

      fontWeight: "700",

      color:
        "#FFFFFF",
    },

    levelBar: {

      height: 12,

      borderRadius: 999,

      backgroundColor:
        "rgba(255,255,255,0.12)",

      overflow:
        "hidden",

      marginBottom: 12,
    },

    levelProgress: {

      width: "42%",

      height: "100%",

      borderRadius: 999,

      backgroundColor:
        "#22C55E",
    },

    levelText: {

      color:
        "rgba(255,255,255,0.78)",

      fontSize: 14,

      fontWeight: "600",
    },

    statsContainer: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      marginHorizontal: 24,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 28,

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

      fontWeight: "800",

      color:
        "#111827",
    },

    statLabel: {

      marginTop: 6,

      color:
        "#6B7280",

      fontSize: 14,
    },
  });