import React, {
  useState,
  useContext,
} from "react";

import { TaskContext } from "../context/TaskContext";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import * as Location from "expo-location";

import { auth } from "../firebaseConfig";

const categories = [
  {
    label: "🚚 Flytting",
    value: "Flytting",
  },

  {
    label: "🧹 Rengjøring",
    value: "Rengjøring",
  },

  {
    label: "💻 IT",
    value: "IT",
  },

  {
    label: "🛒 Handling",
    value: "Handling",
  },

  {
    label: "🌳 Hage",
    value: "Hage",
  },

  {
    label: "📦 Bæring",
    value: "Bæring",
  },

  {
    label: "🐶 Dyrepass",
    value: "Dyrepass",
  },

  {
    label: "🔧 Annet",
    value: "Annet",
  },
];

export default function CreateTaskScreen({
  navigation,
}) {
  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [reward, setReward] =
    useState("");

  const [image, setImage] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [category, setCategory] =
    useState("Annet");

  const { addTask } =
    useContext(TaskContext);

  // 🔥 IMAGE PICKER
  const pickImage =
    async () => {
      try {
        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes:
                ImagePicker.MediaType.Images,

              allowsEditing: true,

              aspect: [4, 3],

              quality: 0.4,
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
      } catch (e) {
        console.log(e);

        Alert.alert(
          "Kunne ikke velge bilde"
        );
      }
    };

  // 🔥 CREATE TASK
  const handleCreateTask =
    async () => {
      try {
        if (
          !title.trim()
        ) {
          return Alert.alert(
            "Mangler tittel"
          );
        }

        if (
          !reward.trim()
        ) {
          return Alert.alert(
            "Mangler belønning"
          );
        }

        setLoading(
          true
        );

        let latitude =
          null;

        let longitude =
          null;

        // 🔥 LOCATION
        try {
          const {
            status,
          } =
            await Location.requestForegroundPermissionsAsync();

          if (
            status ===
            "granted"
          ) {
            const location =
              await Location.getCurrentPositionAsync(
                {
                  accuracy:
                    Location.Accuracy.High,
                }
              );

            latitude =
              location
                .coords
                .latitude;

            longitude =
              location
                .coords
                .longitude;
          }
        } catch (e) {
          console.log(e);
        }

        // 🔥 CREATE TASK
        await addTask({
          title,

          description,

          reward:
            reward +
            " kr",

          urgent: true,

          image:
            image || "",

          latitude,

          longitude,

          category,

          creatorName:
            auth
              .currentUser
              ?.displayName ||

            "Bruker",
        });

        // 🔥 RESET
        setTitle("");

        setDescription(
          ""
        );

        setReward("");

        setImage(
          null
        );

        setCategory(
          "Annet"
        );

        Alert.alert(
          "Oppdrag publisert 🔥"
        );

        navigation.navigate(
          "Hjem"
        );
      } catch (e) {
        console.log(e);

        Alert.alert(
          "Noe gikk galt"
        );
      } finally {
        setLoading(
          false
        );
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
        padding: 20,

        paddingTop: 60,

        paddingBottom: 60,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* IMAGE */}
      <TouchableOpacity
        onPress={
          pickImage
        }
        activeOpacity={
          0.8
        }
        style={{
          backgroundColor:
            "white",

          padding: 20,

          borderRadius: 24,

          alignItems:
            "center",

          marginBottom: 24,
        }}
      >
        {image ? (
          <Image
            source={{
              uri: image,
            }}
            style={{
              width:
                "100%",

              height: 220,

              borderRadius: 20,
            }}
          />
        ) : (
          <Text
            style={{
              fontSize: 18,

              color:
                "#2563EB",

              fontWeight:
                "bold",
            }}
          >
            📸 Legg til bilde
          </Text>
        )}
      </TouchableOpacity>

      {/* TITLE */}
      <Text
        style={{
          fontSize: 34,

          fontWeight:
            "bold",

          marginBottom: 30,

          color:
            "#111827",
        }}
      >
        Opprett oppdrag
      </Text>

      {/* CATEGORY */}
      <Text
        style={{
          fontSize: 18,

          marginBottom: 14,

          color:
            "#374151",
        }}
      >
        Kategori
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        style={{
          marginBottom: 28,
        }}
      >
        {categories.map(
          (
            item
          ) => (
            <TouchableOpacity
              key={
                item.value
              }
              onPress={() =>
                setCategory(
                  item.value
                )
              }
              style={{
                backgroundColor:
                  category ===
                  item.value
                    ? "#2563EB"
                    : "white",

                paddingHorizontal: 18,

                paddingVertical: 14,

                borderRadius: 20,

                marginRight: 12,
              }}
            >
              <Text
                style={{
                  color:
                    category ===
                    item.value
                      ? "white"
                      : "#111827",

                  fontWeight:
                    "bold",
                }}
              >
                {
                  item.label
                }
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {/* TITLE */}
      <Text
        style={{
          fontSize: 18,

          marginBottom: 10,

          color:
            "#374151",
        }}
      >
        Tittel
      </Text>

      <TextInput
        value={title}
        onChangeText={
          setTitle
        }
        placeholder="Hva trenger du hjelp til?"
        maxLength={
          60
        }
        style={{
          backgroundColor:
            "white",

          padding: 20,

          borderRadius: 20,

          marginBottom: 25,

          fontSize: 18,
        }}
      />

      {/* DESCRIPTION */}
      <Text
        style={{
          fontSize: 18,

          marginBottom: 10,

          color:
            "#374151",
        }}
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
        placeholder="Beskriv oppdraget..."
        multiline
        maxLength={
          500
        }
        style={{
          backgroundColor:
            "white",

          padding: 20,

          borderRadius: 20,

          marginBottom: 25,

          fontSize: 18,

          height: 140,

          textAlignVertical:
            "top",
        }}
      />

      {/* REWARD */}
      <Text
        style={{
          fontSize: 18,

          marginBottom: 10,

          color:
            "#374151",
        }}
      >
        Belønning
      </Text>

      <TextInput
        value={reward}
        onChangeText={
          setReward
        }
        placeholder="150"
        keyboardType="numeric"
        maxLength={
          6
        }
        style={{
          backgroundColor:
            "white",

          padding: 20,

          borderRadius: 20,

          marginBottom: 40,

          fontSize: 18,
        }}
      />

      {/* BUTTON */}
      <TouchableOpacity
        disabled={
          loading
        }
        onPress={
          handleCreateTask
        }
        style={{
          backgroundColor:
            loading
              ? "#93C5FD"
              : "#2563EB",

          padding: 24,

          borderRadius: 24,

          alignItems:
            "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text
            style={{
              color:
                "white",

              fontSize: 22,

              fontWeight:
                "bold",
            }}
          >
            Publiser oppdrag
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}