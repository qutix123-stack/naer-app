import React from "react";

import {
  View,
} from "react-native";

export default function AppCard({
  children,
  style,
}) {

  return (

    <View
      style={[
        {
          backgroundColor:
            "#FFFFFF",

          borderRadius: 24,

          padding: 18,
        },

        style,
      ]}
    >
      {children}
    </View>
  );
}