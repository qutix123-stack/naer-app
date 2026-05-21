import { View, Text } from "react-native";

export default function HelperScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 30 }}>
        Jeg kan hjelpe 💚
      </Text>
    </View>
  );
}