import { TouchableOpacity, Text } from "react-native";
import colors from "../theme/colors";

export default function AppButton({
  title,
  onPress,
  color = colors.primary,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: color,
        padding: 18,
        borderRadius: 18,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 18,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}