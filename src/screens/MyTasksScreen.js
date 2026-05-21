import React from "react";
import { useContext } from "react";

import {
  View,
  Text,
  ScrollView,
} from "react-native";

import { TaskContext } from "../context/TaskContext";

import { auth } from "../firebaseConfig";

export default function MyTasksScreen() {
  const { tasks } = useContext(TaskContext);

  const myTasks = tasks.filter(
    (task) =>
      task.ownerId === auth.currentUser?.uid
  );
  const helpingTasks = tasks.filter(
  (task) =>
    task.helperId === auth.currentUser?.uid
);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#F4F6F8",
      }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: 60,
      }}
    >
      <Text
        style={{
          fontSize: 34,
          fontWeight: "bold",
          marginBottom: 30,
        }}
      >
        Mine oppdrag
      </Text>

        <Text
      style={{
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        }}
        >
        Publisert av meg
    </Text>
      {myTasks.map((task) => (
        <View
          key={task.id}
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 24,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 10,
            }}
          >
            {task.title}
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: "#6B7280",
            }}
          >
            {task.reward}
          </Text>
        </View>
      ))}
      <Text
  style={{
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 20,
  }}
>
  Jeg hjelper med
</Text>

{helpingTasks.map((task) => (
  <View
    key={task.id}
    style={{
      backgroundColor: "white",
      padding: 20,
      borderRadius: 24,
      marginBottom: 16,
    }}
  >
    <Text
      style={{
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
      }}
    >
      {task.title}
    </Text>

    <Text
      style={{
        fontSize: 16,
        color: "#6B7280",
      }}
    >
      {task.reward}
    </Text>
  </View>
))}
    </ScrollView>
  );
}