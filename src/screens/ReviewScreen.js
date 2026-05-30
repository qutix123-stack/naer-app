import React, {
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebaseConfig";

export default function ReviewScreen({
  route,
  navigation,
}) {

  const {
    taskId,
    taskTitle,
    toUserId,
    toUserName,
  } = route.params;

  const [rating, setRating] =
    useState(5);

  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // SUBMIT REVIEW

  const submitReview =
    async () => {

      try {

        setLoading(true);

        if (!toUserId) {

            Alert.alert(
              "Feil",
              "Fant ikke bruker å sende review til."
          );

        setLoading(false);

        return;
      }

        // SAVE REVIEW

        console.log(
          "toUserId:",
            toUserId
          );

        console.log(
          "toUserName:",
            toUserName
          );

        await addDoc(
          collection(
            db,
            "reviews"
          ),

          {
            taskId,

            taskTitle,

            to:
              toUserId,

            from:
              auth.currentUser
                ?.email,

            fromName:
              auth.currentUser
                ?.displayName ||

              "Bruker",

            rating,

            text:
              text.trim(),

            createdAt:
              serverTimestamp(),
          }
        );

        // UPDATE USER STATS

        const userQuery =
          doc(
            db,
            "users",

            toUserId
          );

        const userSnap =
          await getDoc(
            userQuery
          );

        if (
          userSnap.exists()
        ) {

          const data =
            userSnap.data();

          const currentReviews =
            data.reviewCount ||
            0;

          const currentRating =
            data.rating ||
            5;

          const total =
            currentRating *
            currentReviews;

          const newAverage =
            (
              (total +
                rating) /

              (
                currentReviews +
                1
              )
            ).toFixed(1);

          await setDoc(

            userQuery,

            {
              rating:
                Number(
                  newAverage
                ),

              reviewCount:
                currentReviews +
                1,
            },

            {
              merge: true,
            }
          );
        }

        Alert.alert(
          "Review sendt 😄"
        );

        navigation.navigate(
          "Tabs"
        );

      } catch (e) {

        console.log(e);

        Alert.alert(
          "Kunne ikke sende review"
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <View
      style={
        styles.container
      }
    >

      {/* HEADER */}

      <TouchableOpacity
        style={
          styles.backButton
        }

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

      {/* CONTENT */}

      <View
        style={
          styles.content
        }
      >

        <View
          style={
            styles.iconContainer
          }
        >

          <Ionicons
            name="star"
            size={48}
            color="#FBBF24"
          />

        </View>

        <Text
          style={
            styles.title
          }
        >
          Hvordan var opplevelsen?
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Gi en review til{" "}
          {toUserName ||
            "brukeren"}
        </Text>

        {/* STARS */}

        <View
          style={
            styles.starsRow
          }
        >

          {[1, 2, 3, 4, 5].map(
            (star) => (

              <TouchableOpacity
                key={star}

                onPress={() =>
                  setRating(
                    star
                  )
                }
              >

                <Ionicons
                  name={
                    star <=
                    rating

                      ? "star"

                      : "star-outline"
                  }

                  size={42}

                  color="#FBBF24"

                  style={{
                    marginHorizontal: 4,
                  }}
                />

              </TouchableOpacity>
            )
          )}

        </View>

        {/* INPUT */}

        <TextInput
          value={text}

          onChangeText={
            setText
          }

          placeholder=
            "Skriv en review 😄"

          placeholderTextColor="#9CA3AF"

          multiline

          style={
            styles.input
          }
        />

      </View>

      {/* BUTTON */}

      <TouchableOpacity
        activeOpacity={0.92}

        style={
          styles.button
        }

        disabled={
          loading
        }

        onPress={
          submitReview
        }
      >

        {loading ? (

          <ActivityIndicator
            color="#FFFFFF"
          />

        ) : (

          <Text
            style={
              styles.buttonText
            }
          >
            Send review
          </Text>
        )}

      </TouchableOpacity>

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor:
        "#F8FAFC",

      paddingTop:
        Platform.OS ===
        "android"

          ? 60

          : 80,
    },

    backButton: {

      marginLeft: 20,

      width: 44,

      height: 44,

      borderRadius: 14,

      backgroundColor:
        "#FFFFFF",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    content: {

      flex: 1,

      alignItems:
        "center",

      paddingHorizontal: 24,

      paddingTop: 40,
    },

    iconContainer: {

      width: 110,

      height: 110,

      borderRadius: 34,

      backgroundColor:
        "#FFFFFF",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginBottom: 30,
    },

    title: {

      fontSize: 32,

      fontWeight: "800",

      color:
        "#111827",

      textAlign:
        "center",

      marginBottom: 10,
    },

    subtitle: {

      fontSize: 16,

      color:
        "#6B7280",

      textAlign:
        "center",

      marginBottom: 40,
    },

    starsRow: {

      flexDirection:
        "row",

      marginBottom: 40,
    },

    input: {

      width: "100%",

      minHeight: 160,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 28,

      padding: 20,

      fontSize: 16,

      color:
        "#111827",

      textAlignVertical:
        "top",

      lineHeight: 26,
    },

    button: {

      marginHorizontal: 24,

      marginBottom:
        Platform.OS ===
        "ios"

          ? 40

          : 26,

      backgroundColor:
        "#2563EB",

      borderRadius: 24,

      paddingVertical: 20,

      alignItems:
        "center",

      shadowColor:
        "#2563EB",

      shadowOpacity: 0.24,

      shadowRadius: 10,

      elevation: 6,
    },

    buttonText: {

      color:
        "#FFFFFF",

      fontSize: 17,

      fontWeight: "800",
    },
  });