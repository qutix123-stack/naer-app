import React from "react";
import { View } from "react-native";

export default function AppCard({
  children,
  style,
}) {
  return (
    <View
      style={[
        {
          backgroundColor: "#fff",
          borderRadius: 24,
          padding: 18,

          shadowColor: "#000",

          shadowOffset: {
            width: 0,
            height: 4,
          },

          shadowOpacity: 0.08,
          shadowRadius: 10,

          elevation: 4,
        },

        style,
      ]}
    >
      {children}
    </View>
  );
}