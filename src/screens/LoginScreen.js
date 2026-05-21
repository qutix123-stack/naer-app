import React, {
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebaseConfig";

export default function LoginScreen() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  // 🔥 HANDLE ERRORS
  const handleAuthError =
    (e) => {
      if (
        e.code ===
        "auth/invalid-email"
      ) {
        Alert.alert(
          "Skriv inn gyldig email"
        );

      } else if (
        e.code ===
        "auth/invalid-credential"
      ) {
        Alert.alert(
          "Feil email eller passord"
        );

      } else if (
        e.code ===
        "auth/email-already-in-use"
      ) {
        Alert.alert(
          "Email er allerede i bruk"
        );

      } else if (
        e.code ===
        "auth/weak-password"
      ) {
        Alert.alert(
          "Passord må være minst 6 tegn"
        );

      } else {
        Alert.alert(
          "Noe gikk galt"
        );
      }

      console.log(e);
    };

  // 🔥 LOGIN
  const login = async () => {
    try {
      if (
        !email.trim() ||
        !password.trim()
      ) {
        return Alert.alert(
          "Fyll inn email og passord"
        );
      }

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      await updateDoc(
        doc(
          db,
          "users",
          userCredential.user.uid
        ),

        {
          online: true,

          lastSeen:
            Date.now(),
        }
      );

      Alert.alert(
        "Innlogget 🔥"
      );

    } catch (e) {
      handleAuthError(
        e
      );
    }
  };

  // 🔥 REGISTER
  const register =
    async () => {
      try {
        if (
          !email.trim() ||
          !password.trim()
        ) {
          return Alert.alert(
            "Fyll inn email og passord"
          );
        }

        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );

        await setDoc(
          doc(
            db,
            "users",
            userCredential
              .user.uid
          ),

          {
            email:
              userCredential
                .user.email,

            rating: 5,

            completedTasks: 0,

            avatar:
              "https://i.pravatar.cc/300",

            online: true,

            lastSeen:
              Date.now(),
          }
        );

        Alert.alert(
          "Bruker opprettet 🔥"
        );

      } catch (e) {
        handleAuthError(
          e
        );
      }
    };

  return (
    <View
      style={{
        flex: 1,

        backgroundColor:
          "#F4F6F8",

        justifyContent:
          "center",

        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 40,

          fontWeight:
            "bold",

          marginBottom: 40,

          color:
            "#111827",

          textAlign:
            "center",
        }}
      >
        Nær
      </Text>

      {/* EMAIL */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={
          setEmail
        }
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        style={{
          backgroundColor:
            "white",

          padding: 18,

          borderRadius: 18,

          marginBottom: 15,

          fontSize: 16,
        }}
      />

      {/* PASSWORD */}
      <TextInput
        placeholder="Passord"
        value={password}
        onChangeText={
          setPassword
        }
        secureTextEntry
        autoCorrect={false}
        style={{
          backgroundColor:
            "white",

          padding: 18,

          borderRadius: 18,

          marginBottom: 25,

          fontSize: 16,
        }}
      />

      {/* LOGIN */}
      <TouchableOpacity
        onPress={login}
        style={{
          backgroundColor:
            "#2563EB",

          padding: 18,

          borderRadius: 20,

          alignItems:
            "center",

          marginBottom: 14,
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
          Logg inn
        </Text>
      </TouchableOpacity>

      {/* REGISTER */}
      <TouchableOpacity
        onPress={register}
        style={{
          backgroundColor:
            "#22C55E",

          padding: 18,

          borderRadius: 20,

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
          Registrer
        </Text>
      </TouchableOpacity>
    </View>
  );
}