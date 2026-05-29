import React, {
  useState,
} from "react";

import * as ImagePicker from "expo-image-picker";

import * as Location from "expo-location";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  LinearGradient,
} from "expo-linear-gradient";

import {
  addDoc,
  collection,
  serverTimestamp,
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

export default function CreateTaskScreen({
  navigation,
}) {

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [price, setPrice] =
    useState("");

  const [category, setCategory] =
    useState("Småjobber");

  const [image, setImage] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const categories = [

    "Flytting",

    "Transport",

    "Småjobber",

    "Rengjøring",

    "IT",

    "Barnepass",

    "Hage",

    "Bygg",

    "Annet",
  ];

  // PICK IMAGE

  const pickImage =
    async () => {

      try {

        const permission =
  await ImagePicker.requestMediaLibraryPermissionsAsync();

if (!permission.granted) {

  Alert.alert(
    "Tillatelse kreves",
    "Gi appen tilgang til bilder."
  );

  return;
}

const result =
  await ImagePicker.launchImageLibraryAsync({

    mediaTypes:
      ImagePicker.MediaTypeOptions.Images,

    allowsEditing:
      true,

    quality: 0.7,
  });

        if (
          !result.canceled
        ) {

          setImage(
            result.assets[0]
              .uri
          );
        }

      } catch (e) {

        console.log(e);
      }
    };

  // CREATE TASK

  const createTask =
    async () => {

      if (
        !title ||
        !description ||
        !price
      ) {

        Alert.alert(
          "Fyll ut alle felt 😄"
        );

        return;
      }

      try {

        setLoading(true);

        // LOCATION

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (
          status !==
          "granted"
        ) {

          Alert.alert(
            "Lokasjon kreves"
          );

          return;
        }

        const location =
          await Location.getCurrentPositionAsync(
            {}
          );

        let imageUrl =
          null;

        // UPLOAD IMAGE

        if (image) {

          const response =
            await fetch(
              image
            );

          const blob =
            await response.blob();

          const filename =
            `tasks/${Date.now()}`;

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
        }

        // SAVE TASK

        await addDoc(
          collection(
            db,
            "tasks"
          ),

          {
            title:
              title.trim(),

            description:
              description.trim(),

            price:
              Number(price),

            category,

            image:
              imageUrl,

            latitude:
              location.coords
                .latitude,

            longitude:
              location.coords
                .longitude,

            ownerId:
              auth.currentUser
                ?.uid,

            creatorName:

              auth.currentUser
                ?.displayName ||

              "Bruker",

            creatorEmail:

              auth.currentUser
                ?.email ||

              "",

            accepted:
              false,

            completed:
              false,

            createdAt:
              serverTimestamp(),
          }
        );

        Alert.alert(
          "Oppdrag opprettet 😮🔥"
        );

        navigation.goBack();

      } catch (e) {

        console.log(e);

        Alert.alert(
          "Noe gikk galt"
        );

      } finally {

        setLoading(false);
      }
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
        ]}

        style={
          styles.hero
        }
      >

        <Text
          style={
            styles.heroTitle
          }
        >
          Opprett oppdrag
        </Text>

        <Text
          style={
            styles.heroSubtitle
          }
        >
          Finn hjelp i nærheten 😄
        </Text>

      </LinearGradient>

      {/* CONTENT */}

      <View
        style={
          styles.content
        }
      >

        {/* IMAGE */}

        <TouchableOpacity
          activeOpacity={0.9}

          style={
            styles.imagePicker
          }

          onPress={
            pickImage
          }
        >

          {image ? (

            <Image
              source={{
                uri:
                  image,
              }}

              style={
                styles.previewImage
              }
            />

          ) : (

            <View
              style={
                styles.imagePlaceholder
              }
            >

              <Ionicons
                name="image-outline"
                size={40}
                color="#9CA3AF"
              />

              <Text
                style={
                  styles.imageText
                }
              >
                Legg til bilde
              </Text>

            </View>
          )}

        </TouchableOpacity>

        {/* TITLE */}

        <View
          style={
            styles.inputCard
          }
        >

          <Text
            style={
              styles.label
            }
          >
            Tittel
          </Text>

          <TextInput
            value={title}

            onChangeText={
              setTitle
            }

            placeholder="Hva trenger du hjelp med?"

            placeholderTextColor="#9CA3AF"

            style={
              styles.input
            }
          />

        </View>

        {/* DESCRIPTION */}

        <View
          style={
            styles.inputCard
          }
        >

          <Text
            style={
              styles.label
            }
          >
            Beskrivelse
          </Text>

          <TextInput
            value={
              description
            }

            onChangeText={
              setDescription
            }

            placeholder="Forklar oppdraget..."

            placeholderTextColor="#9CA3AF"

            multiline

            style={
              styles.textarea
            }
          />

        </View>

        {/* PRICE */}

        <View
          style={
            styles.inputCard
          }
        >

          <Text
            style={
              styles.label
            }
          >
            Pris
          </Text>

          <TextInput
            value={price}

            onChangeText={
              setPrice
            }

            placeholder="500"

            placeholderTextColor="#9CA3AF"

            keyboardType="numeric"

            style={
              styles.input
            }
          />

        </View>

        {/* CATEGORY */}

        <Text
          style={
            styles.categoryTitle
          }
        >
          Kategori
        </Text>

        <ScrollView
          horizontal

          showsHorizontalScrollIndicator={
            false
          }

          style={{
            marginBottom: 24,
          }}
        >

          {categories.map(
            (item) => (

              <TouchableOpacity
                key={item}

                activeOpacity={0.9}

                style={[
                  styles.categoryButton,

                  category ===
                    item && {

                    backgroundColor:
                      "#2563EB",
                  },
                ]}

                onPress={() =>
                  setCategory(
                    item
                  )
                }
              >

                <Text
                  style={[
                    styles.categoryText,

                    category ===
                      item && {

                      color:
                        "#FFFFFF",
                    },
                  ]}
                >

                  {item ===
                    "Flytting" &&
                    "🚚 "}

                  {item ===
                    "Transport" &&
                    "🚗 "}

                  {item ===
                    "Småjobber" &&
                    "⚡ "}

                  {item ===
                    "Rengjøring" &&
                    "✨ "}

                  {item ===
                    "IT" &&
                    "💻 "}

                  {item ===
                    "Barnepass" &&
                    "👶 "}

                  {item ===
                    "Hage" &&
                    "🌿 "}

                  {item ===
                    "Bygg" &&
                    "🛠️ "}

                  {item ===
                    "Annet" &&
                    "📦 "}

                  {item}

                </Text>

              </TouchableOpacity>
            )
          )}

        </ScrollView>

        {/* BUTTON */}

        <TouchableOpacity
          activeOpacity={0.92}

          style={
            styles.button
          }

          disabled={loading}

          onPress={
            createTask
          }
        >

          {loading ? (

            <ActivityIndicator
              color="#FFFFFF"
            />

          ) : (

            <>
              <Ionicons
                name="flash"
                size={20}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.buttonText
                }
              >
                Opprett oppdrag
              </Text>
            </>
          )}

        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}

const styles =
  StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor:
        "#F6F7FB",
    },

    hero: {

      paddingTop:
        Platform.OS ===
        "android"

          ? 70

          : 90,

      paddingBottom: 50,

      paddingHorizontal: 24,

      borderBottomLeftRadius: 34,

      borderBottomRightRadius: 34,
    },

    heroTitle: {

      fontSize: 34,

      fontWeight: "800",

      color:
        "#FFFFFF",

      marginBottom: 10,
    },

    heroSubtitle: {

      fontSize: 16,

      color:
        "rgba(255,255,255,0.9)",
    },

    content: {

      padding: 22,
    },

    imagePicker: {

      height: 220,

      borderRadius: 28,

      backgroundColor:
        "#FFFFFF",

      marginBottom: 22,

      overflow:
        "hidden",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    previewImage: {

      width: "100%",

      height: "100%",
    },

    imagePlaceholder: {

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    imageText: {

      marginTop: 10,

      color:
        "#6B7280",

      fontWeight: "600",
    },

    inputCard: {

      backgroundColor:
        "#FFFFFF",

      borderRadius: 24,

      padding: 18,

      marginBottom: 18,
    },

    label: {

      fontSize: 14,

      color:
        "#6B7280",

      marginBottom: 10,

      fontWeight: "700",
    },

    input: {

      fontSize: 16,

      color:
        "#111827",
    },

    textarea: {

      minHeight: 120,

      textAlignVertical:
        "top",

      fontSize: 16,

      color:
        "#111827",
    },

    categoryTitle: {

      fontSize: 18,

      fontWeight: "800",

      color:
        "#111827",

      marginBottom: 14,
    },

    categoryButton: {

      backgroundColor:
        "#FFFFFF",

      paddingHorizontal: 18,

      paddingVertical: 12,

      borderRadius: 999,

      marginRight: 12,
    },

    categoryText: {

      fontWeight: "700",

      color:
        "#111827",
    },

    button: {

      backgroundColor:
        "#2563EB",

      height: 62,

      borderRadius: 24,

      justifyContent:
        "center",

      alignItems:
        "center",

      flexDirection:
        "row",

      marginTop: 20,
    },

    buttonText: {

      color:
        "#FFFFFF",

      fontSize: 17,

      fontWeight: "800",

      marginLeft: 10,
    },
  });