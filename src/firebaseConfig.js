import { initializeApp } from "firebase/app";

import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getFirestore,
} from "firebase/firestore";

import {
  getStorage,
} from "firebase/storage";

// FIREBASE CONFIG

const firebaseConfig = {

  apiKey:
    "AIzaSyCHIeTsYia5PUYmRqpOvgCUpOUM3vKuGxc",

  authDomain:
    "naer-app.firebaseapp.com",

  projectId:
    "naer-app",

  storageBucket:
    "naer-app.firebasestorage.app",

  messagingSenderId:
    "42501186216",

  appId:
    "1:42501186216:web:76ccc1abf0782dff5c189d",
};

// INIT APP

const app =
  initializeApp(
    firebaseConfig
  );

// AUTH

export const auth =
  initializeAuth(app, {

    persistence:
      getReactNativePersistence(
        AsyncStorage
      ),
  });

// FIRESTORE

export const db =
  getFirestore(app);

// STORAGE

export const storage =
  getStorage(app);