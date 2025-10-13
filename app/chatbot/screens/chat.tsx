import React from "react";
import { View, StyleSheet } from "react-native";
import MedicalAssistantScreen from "@/app/chatbot/screens/MedicalAssistantScreen";
import Colors from "@/app/shared/constants/colors";

export default function ChatTabScreen() {
  return (
    <View style={styles.container}>
      <MedicalAssistantScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

