import React, {
  useState,
} from "react";

import {
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  View,
  Switch,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import {
  collection,
  addDoc,
} from "firebase/firestore";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import {
  auth,
  db,
} from "../firebaseConfig";

const storage =
  getStorage();

const categories = [
  { label: "🚚 Flytting", value: "Flytting" },
  { label: "🧹 Rengjøring", value: "Rengjøring" },
  { label: "💻 IT", value: "IT" },
  { label: "🛒 Handling", value: "Levering" },
  { label: "🌳 Hage", value: "Hage" },
  { label: "📦 Bæring", value: "Bæring" },
  { label: "🐶 Dyrepass", value: "Dyrepass" },
  { label: "🔧 Annet", value: "Annet" },
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

  const [urgent, setUrgent] =
    useState(false);

  // IMAGE PICKER

  const pickImage =
    async () => {

      try {

        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
          !permission.granted
        ) {

          Alert.alert(
            "Gi tilgang til bilder"
          );

          return;
        }

        const result =
  await ImagePicker.launchImageLibraryAsync(
    {
      mediaTypes:
        ["images"],

      allowsEditing:
        true,

      aspect: [4, 3],

      quality: 0.7,
    }
  );

        if (
          !result.canceled
        ) {

          setImage(
            result.assets[0].uri
          );
        }

      } catch (e) {

        console.log(e);

        Alert.alert(
          "Kunne ikke velge bilde"
        );
      }
    };

  // UPLOAD IMAGE

  const uploadImage =
    async (uri) => {

      try {

        const response =
          await fetch(uri);

        const blob =
          await response.blob();

        const filename =
          `task_${Date.now()}`;

        const storageRef =
          ref(
            storage,
            `tasks/${filename}`
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

        console.log(
          "UPLOAD ERROR:",
          e
        );

        return "";
      }
    };

  // CREATE TASK

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

          const rewardNumber =
            Number(reward);

              if (
              isNaN(rewardNumber) ||

                rewardNumber < 50 ||

                rewardNumber > 50000
            ) {

                setLoading(false);

                return Alert.alert(
                 "Belønning må være mellom 50 og 50000 kr"
                  );
              }
        }

        setLoading(true);

        let imageUrl = "";

        if (image) {

          imageUrl =
            await uploadImage(
              image
            );
        }

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

          setLoading(false);

          return;
        }

        const location =
          await Location.getCurrentPositionAsync(
            {
              accuracy:
                Location.Accuracy.High,
            }
          );

        const latitude =
          Number(
            location.coords.latitude
          );

        const longitude =
          Number(
            location.coords.longitude
          );

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

            reward:
              rewardNumber + " kr ",

            price:
              rewardNumber,

            urgent,

            rating: 5,

            image:
              imageUrl,

            latitude,

            longitude,

            category,

            accepted: false,

            completed: false,

            trackingActive: false,

            creatorName:
              auth.currentUser
                ?.displayName ||
              "Bruker",

            createdBy:
              auth.currentUser?.uid,

            ownerEmail:
              auth.currentUser?.email,

            status: "open",

            createdAt:
              Date.now(),
          }
        );

        // RESET

        setTitle("");
        setDescription("");
        setReward("");
        setImage(null);
        setCategory("Annet");
        setUrgent(false);

        Alert.alert(
          "Oppdrag publisert 🔥"
        );

        navigation.navigate(
          "Tabs",
          {
            screen: "Home",
          }
        );

      } catch (e) {

        console.log(
          "CREATE TASK ERROR:",
          e
        );

        Alert.alert(
          "Noe gikk galt"
        );

      } finally {

        setLoading(false);
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

        paddingBottom: 140,
      }}

      showsVerticalScrollIndicator={
        false
      }
    >

      <Text
        style={{
          fontSize: 38,

          fontWeight: "bold",

          color: "#111827",

          marginBottom: 30,
        }}
      >
        Opprett oppdrag
      </Text>

      {/* CATEGORY */}

      <Text
        style={{
          fontSize: 18,

          marginBottom: 14,

          color: "#374151",
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
          marginBottom: 24,
        }}
      >

        {categories.map(
          (item) => (

            <TouchableOpacity
              key={item.value}

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
                    : "#FFFFFF",

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
                      ? "#FFFFFF"
                      : "#111827",

                  fontWeight: "700",
                }}
              >
                {item.label}
              </Text>

            </TouchableOpacity>
          )
        )}

      </ScrollView>

      {/* TITLE */}

      <TextInput
        maxLength={40}

        value={title}

        onChangeText={setTitle}

        placeholder="Hva trenger du hjelp til?"

        placeholderTextColor="#9CA3AF"

        style={{
          backgroundColor:
            "#FFFFFF",

          padding: 22,

          borderRadius: 24,

          marginBottom: 20,

          fontSize: 18,
        }}
      />

      {/* DESCRIPTION */}

      <TextInput
        maxLength={180}

        value={description}

        onChangeText={setDescription}

        placeholder="Beskriv oppdraget..."

        placeholderTextColor="#9CA3AF"

        multiline

        style={{
          backgroundColor:
            "#FFFFFF",

          padding: 22,

          borderRadius: 24,

          marginBottom: 20,

          fontSize: 18,

          height: 160,

          textAlignVertical:
            "top",
        }}
      />

      {/* REWARD */}

      <TextInput

        maxLength={5}

        value={reward}

        onChangeText={setReward}

        placeholder="Belønning i kr"

        placeholderTextColor="#9CA3AF"

        keyboardType="numeric"

        style={{
          backgroundColor:
            "#FFFFFF",

          padding: 22,

          borderRadius: 24,

          marginBottom: 20,

          fontSize: 18,
        }}
      />

      {/* URGENT */}

      <View
        style={{
          backgroundColor:
            "#FFFFFF",

          padding: 22,

          borderRadius: 24,

          marginBottom: 20,

          flexDirection: "row",

          alignItems: "center",

          justifyContent:
            "space-between",
        }}
      >

        <View>

          <Text
            style={{
              fontSize: 18,

              fontWeight: "700",

              color: "#111827",
            }}
          >
            Haster
          </Text>

          <Text
            style={{
              color: "#6B7280",

              marginTop: 4,
            }}
          >
            Vis oppdraget høyere
          </Text>

        </View>

        <Switch
          value={urgent}

          onValueChange={
            setUrgent
          }
        />

      </View>

      {/* IMAGE BUTTON */}

      <TouchableOpacity
        onPress={pickImage}

        style={{
          backgroundColor:
            "#111827",

          padding: 20,

          borderRadius: 24,

          alignItems: "center",

          marginBottom: 20,
        }}
      >

        <Text
          style={{
            color: "#FFFFFF",

            fontSize: 17,

            fontWeight: "700",
          }}
        >
          {image
            ? "✓ Bilde valgt"
            : "📷 Last opp bilde"}
        </Text>

      </TouchableOpacity>

      {/* IMAGE */}

      {image && (

        <Image
          source={{
            uri: image,
          }}

          style={{
            width: "100%",

            height: 240,

            borderRadius: 24,

            marginBottom: 24,
          }}

          resizeMode="cover"
        />
      )}

      {/* BUTTON */}

      <TouchableOpacity
        disabled={loading}

        onPress={
          handleCreateTask
        }

        style={{
          backgroundColor:
            loading
              ? "#93C5FD"
              : "#2563EB",

          padding: 24,

          borderRadius: 28,

          alignItems: "center",

          marginTop: 10,
        }}
      >

        {loading ? (

          <ActivityIndicator
            color="white"
          />

        ) : (

          <Text
            style={{
              color: "#FFFFFF",

              fontSize: 22,

              fontWeight: "bold",
            }}
          >
            Publiser oppdrag
          </Text>
        )}

      </TouchableOpacity>

    </ScrollView>
  );
}