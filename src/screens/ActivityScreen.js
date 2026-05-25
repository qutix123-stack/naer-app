import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
} from "react-native";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import { db }
from "../firebaseConfig";

export default function ActivityScreen() {

  const [activity, setActivity] =
    useState([]);

  useEffect(() => {

    const q = query(
      collection(
        db,
        "activity"
      ),

      orderBy(
        "createdAt",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(
        q,

        (snapshot) => {

          setActivity(
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            )
          );
        }
      );

    return unsubscribe;

  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          "#F8FAFC",
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: "700",
          marginBottom: 20,
        }}
      >
        Aktivitet
      </Text>

      <FlatList
        data={activity}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor:
                "white",

              padding: 18,

              borderRadius: 18,

              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 16,
              }}
            >
              {item.text}
            </Text>
          </View>
        )}
      />
    </View>
  );
}