import React, {
  useState,
  useRef,
  useEffect,
} from "react";

import { LinearGradient }
from "expo-linear-gradient";

import {
  View,
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
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

  const [showRegister, setShowRegister] =
    useState(false);

  const [registerName, setRegisterName] =
    useState("");

  const [registerPhone, setRegisterPhone] =
    useState("");

  const [registerEmail, setRegisterEmail] =
    useState("");

  const [registerPassword, setRegisterPassword] =
    useState("");

  const [
    showForgotPassword,
    setShowForgotPassword,
  ] = useState(false);

  const [resetEmail, setResetEmail] =
    useState("");

  const logoOpacity =
    useRef(
      new Animated.Value(0)
    ).current;

  const logoTranslate =
    useRef(
      new Animated.Value(30)
    ).current;

  useEffect(() => {

    Animated.parallel([

      Animated.timing(
        logoOpacity,
        {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }
      ),

      Animated.spring(
        logoTranslate,
        {
          toValue: 0,
          friction: 7,
          useNativeDriver: true,
        }
      ),

    ]).start();

  }, []);

  const handleAuthError =
    (e) => {

      console.log(e);

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
    };

  const login =
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
            lastSeen: Date.now(),
          }
        );

      } catch (e) {

        handleAuthError(e);

      }
    };

  const register =
    async () => {

      try {

        if (
          !registerName.trim() ||
          !registerPhone.trim() ||
          !registerEmail.trim() ||
          !registerPassword.trim()
        ) {

          return Alert.alert(
            "Fyll inn alle feltene"
          );
        }

        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            registerEmail.trim(),
            registerPassword
          );

        await setDoc(
          doc(
            db,
            "users",
            userCredential.user.uid
          ),

          {
            name:
              registerName.trim(),

            phone:
              registerPhone.trim(),

            email:
              registerEmail.trim(),

            rating: 5,

            reviewCount: 0,

            completedTasks: 0,

            verified: false,

            avatar:
              "https://i.pravatar.cc/300",

            online: true,

            lastSeen:
              Date.now(),
          }
        );

        setShowRegister(false);

        Alert.alert(
          "Bruker opprettet 😄"
        );

      } catch (e) {

        handleAuthError(e);

      }
    };

  const resetPassword =
    async () => {

      try {

        if (
          !resetEmail.trim()
        ) {

          return Alert.alert(
            "Skriv inn email"
          );
        }

        await sendPasswordResetEmail(
          auth,
          resetEmail.trim()
        );

        setShowForgotPassword(
          false
        );

        Alert.alert(
          "Email sendt 😄",
          "Sjekk innboksen og spam-mappen."
        );

      } catch (e) {

        console.log(e);

        Alert.alert(
          "Kunne ikke sende email"
        );
      }
    };

  return (

    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }

      keyboardVerticalOffset={
        Platform.OS === "ios"
          ? 0
          : 20
      }

      style={{
        flex: 1,
      }}
    >

      <ScrollView
        keyboardShouldPersistTaps="handled"

        style={{
          flex: 1,
        }}

        contentContainerStyle={{
          paddingBottom: 40,
        }}

        showsVerticalScrollIndicator={
          false
        }
      >

        <LinearGradient
          colors={[
            "#F8FAFC",
            "#EEF4FF",
            "#E0EAFF",
          ]}

          style={{
            height: 260,

            borderBottomLeftRadius: 40,

            borderBottomRightRadius: 40,
          }}
        />

        <View
          style={{
            position: "absolute",

            top: 90,

            left: -40,

            width: 180,

            height: 180,

            borderRadius: 999,

            backgroundColor:
              "rgba(37,99,235,0.08)",
          }}
        />

        <View
          style={{
            position: "absolute",

            top: 40,

            right: -60,

            width: 220,

            height: 220,

            borderRadius: 999,

            backgroundColor:
              "rgba(59,130,246,0.10)",
          }}
        />

        <View
          style={{
            marginTop: -120,

            paddingHorizontal: 24,

            alignItems:
              "center",
          }}
        >

          <Animated.View
            style={{
              alignItems:
                "center",

              marginBottom: 40,

              opacity:
                logoOpacity,

              transform: [
                {
                  translateY:
                    logoTranslate,
                },
              ],
            }}
          >

            <Image
              source={require("../../assets/logo.png")}
              style={{
                width: 110,

                height: 110,

                marginBottom: 22,
              }}

              resizeMode="contain"
            />

            <Text
              style={{
                fontSize: 42,

                fontWeight:
                  "800",

                color:
                  "#0F172A",

                marginBottom: 10,
              }}
            >
              Velkommen 👋
            </Text>

            <Text
              style={{
                fontSize: 17,

                color:
                  "#64748B",

                textAlign:
                  "center",

                lineHeight: 26,
              }}
            >
              Finn hjelp i nærheten{"\n"}
              eller hjelp andre 😄
            </Text>

          </Animated.View>

          <View
            style={{
              width: "100%",

              backgroundColor:
                "white",

              borderRadius: 34,

              padding: 24,

              shadowColor:
                "#000",

              shadowOpacity: 0.08,

              shadowRadius: 20,

              elevation: 10,
            }}
          >

            <TextInput
              placeholder="Email"

              placeholderTextColor="#9CA3AF"

              value={email}

              onChangeText={
                setEmail
              }

              autoCapitalize="none"

              keyboardType="email-address"

              style={{
                backgroundColor:
                  "#F1F5F9",

                color:
                  "#111827",

                height: 62,

                borderRadius: 18,

                paddingHorizontal: 18,

                marginBottom: 14,

                fontSize: 16,
              }}
            />

            <TextInput
              placeholder="Passord"

              placeholderTextColor="#9CA3AF"

              secureTextEntry

              value={password}

              onChangeText={
                setPassword
              }

              style={{
                backgroundColor:
                  "#F1F5F9",

                color:
                  "#111827",

                height: 62,

                borderRadius: 18,

                paddingHorizontal: 18,

                marginBottom: 24,

                fontSize: 16,
              }}
            />

            <TouchableOpacity
              onPress={login}

              activeOpacity={0.9}

              style={{
                backgroundColor:
                  "#2563EB",

                height: 66,

                borderRadius: 22,

                justifyContent:
                  "center",

                alignItems:
                  "center",

                marginBottom: 20,
              }}
            >

              <Text
                style={{
                  color:
                    "white",

                  fontSize: 18,

                  fontWeight:
                    "800",
                }}
              >
                Logg inn
              </Text>

            </TouchableOpacity>

            <View
              style={{
                alignItems:
                  "center",
              }}
            >

              <TouchableOpacity
                onPress={() =>
                  setShowRegister(
                    true
                  )
                }
              >

                <Text
                  style={{
                    color:
                      "#2563EB",

                    fontSize: 16,

                    fontWeight:
                      "700",
                  }}
                >
                  Registrer ny bruker
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setShowForgotPassword(
                    true
                  )
                }

                style={{
                  marginTop: 18,
                }}
              >

                <Text
                  style={{
                    color:
                      "#64748B",

                    fontSize: 15,

                    fontWeight:
                      "600",
                  }}
                >
                  Glemt passord?
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  );
}