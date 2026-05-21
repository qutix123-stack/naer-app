import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

export default function HelpScreen({
  navigation,
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F4F6F8",
        padding: 20,
        paddingTop: 80,
      }}
    >
      <Text
        style={{
          fontSize: 34,
          fontWeight: "bold",
          marginBottom: 40,
          color: "#111827",
        }}
      >
        Hva trenger du hjelp til? 🙋
      </Text>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            "Opprett"
          )
        }
        style={{
          backgroundColor: "white",
          padding: 25,
          borderRadius: 24,
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          🛒 Handle hjelp
        </Text>

        <Text
          style={{
            marginTop: 10,
            fontSize: 16,
            color: "#6B7280",
          }}
        >
          Få hjelp med handling
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            "Opprett"
          )
        }
        style={{
          backgroundColor: "white",
          padding: 25,
          borderRadius: 24,
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          🧹 Husarbeid
        </Text>

        <Text
          style={{
            marginTop: 10,
            fontSize: 16,
            color: "#6B7280",
          }}
        >
          Rydding, vask og småjobber
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            "Opprett"
          )
        }
        style={{
          backgroundColor: "white",
          padding: 25,
          borderRadius: 24,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          🚚 Flytting
        </Text>

        <Text
          style={{
            marginTop: 10,
            fontSize: 16,
            color: "#6B7280",
          }}
        >
          Få hjelp med bæring og flytting
        </Text>
      </TouchableOpacity>
    </View>
  );
}