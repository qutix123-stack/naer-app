import React, {
  createContext,
  useEffect,
  useState,
  useRef,
} from "react";

import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import {
  db,
  storage,
  auth,
} from "../firebaseConfig";

import * as Location from "expo-location";

export const TaskContext =
  createContext();

export function TaskProvider({
  children,
}) {
  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // 🔥 TRACKING SUBSCRIPTIONS
  const trackingSubscriptions =
    useRef({});

  // 🔥 REALTIME TASKS
  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "tasks"
        ),

        (snapshot) => {
          const firestoreTasks =
            snapshot.docs.map(
              (document) => ({
                id: document.id,
                ...document.data(),
              })
            );

          setTasks(
            firestoreTasks
          );

          setLoading(
            false
          );
        },

        (error) => {
          console.log(
            error
          );

          setLoading(
            false
          );
        }
      );

    return () => {
      unsubscribe();

      // 🔥 CLEANUP TRACKERS
      Object.values(
        trackingSubscriptions.current
      ).forEach(
        (
          subscription
        ) => {
          if (
            subscription
          ) {
            subscription.remove();
          }
        }
      );
    };
  }, []);

  // 🔥 IMAGE UPLOAD
  const uploadImage =
    async (
      imageUri
    ) => {
      try {
        if (!imageUri)
          return "";

        const response =
          await fetch(
            imageUri
          );

        const blob =
          await response.blob();

        const filename = `task_${Date.now()}`;

        const storageRef =
          ref(
            storage,
            `tasks/${filename}`
          );

        await uploadBytes(
          storageRef,
          blob,
          {
            contentType:
              "image/jpeg",
          }
        );

        const downloadURL =
          await getDownloadURL(
            storageRef
          );

        return downloadURL;
      } catch (e) {
        console.log(e);

        return "";
      }
    };

  // 🔥 ADD TASK
  const addTask =
    async (
      task
    ) => {
      try {
        // 🔥 VALIDATION
        if (
          !task.title?.trim()
        ) {
          console.log(
            "Mangler tittel"
          );

          return;
        }

        if (
          !task.reward?.trim()
        ) {
          console.log(
            "Mangler reward"
          );

          return;
        }

        let imageUrl =
          "";

        // 🔥 IMAGE
        if (
          task.image
        ) {
          imageUrl =
            await uploadImage(
              task.image
            );
        }

        // 🔥 SAVE TASK
        await addDoc(
          collection(
            db,
            "tasks"
          ),

          {
            title:
              task.title.trim(),

            description:
              task.description?.trim() ||
              "",

            reward:
              task.reward,

            image:
              imageUrl,

            latitude:
              task.latitude ??
              null,

            longitude:
              task.longitude ??
              null,

            urgent:
              task.urgent ||
              false,

            accepted:
              false,

            acceptedBy:
              null,

            helperLatitude:
              null,

            helperLongitude:
              null,

            trackingActive:
              false,

            completed:
              false,

            createdBy:
              auth
                .currentUser
                ?.uid ||

              null,

            ownerEmail:
              auth
                .currentUser
                ?.email ||

              "Unknown",

            createdAt:
              serverTimestamp(),
          }
        );
      } catch (e) {
        console.log(e);
      }
    };

  // 🔥 ACCEPT TASK
  const acceptTask =
    async (
      taskId
    ) => {
      try {
        if (
          !taskId
        )
          return;

        // 🔥 STOP OLD TRACKER
        if (
          trackingSubscriptions
            .current[
            taskId
          ]
        ) {
          trackingSubscriptions.current[
            taskId
          ].remove();
        }

        // 🔥 LOCATION PERMISSION
        const {
          status,
        } =
          await Location.requestForegroundPermissionsAsync();

        if (
          status !==
          "granted"
        ) {
          console.log(
            "Location denied"
          );

          return;
        }

        // 🔥 GET LOCATION
        const location =
          await Location.getCurrentPositionAsync(
            {
              accuracy:
                Location.Accuracy.High,
            }
          );

        // 🔥 UPDATE TASK
        await updateDoc(
          doc(
            db,
            "tasks",
            taskId
          ),

          {
            accepted:
              true,

            acceptedBy:
              auth
                .currentUser
                ?.email ||

              "Unknown",

            acceptedById:
              auth
                .currentUser
                ?.uid ||

              null,

            helperLatitude:
              location
                .coords
                .latitude,

            helperLongitude:
              location
                .coords
                .longitude,

            trackingActive:
              true,

            acceptedAt:
              serverTimestamp(),
          }
        );

        // 🔥 LIVE TRACKING
        const subscription =
          await Location.watchPositionAsync(
            {
              accuracy:
                Location.Accuracy.High,

              timeInterval: 5000,

              distanceInterval: 5,
            },

            async (
              newLocation
            ) => {
              try {
                await updateDoc(
                  doc(
                    db,
                    "tasks",
                    taskId
                  ),

                  {
                    helperLatitude:
                      newLocation
                        .coords
                        .latitude,

                    helperLongitude:
                      newLocation
                        .coords
                        .longitude,
                  }
                );
              } catch (e) {
                console.log(
                  e
                );
              }
            }
          );

        // 🔥 SAVE TRACKER
        trackingSubscriptions.current[
          taskId
        ] = subscription;
      } catch (e) {
        console.log(e);
      }
    };

  // 🔥 COMPLETE TASK
  const completeTask =
    async (
      taskId
    ) => {
      try {
        await updateDoc(
          doc(
            db,
            "tasks",
            taskId
          ),

          {
            completed:
              true,

            trackingActive:
              false,

            completedAt:
              serverTimestamp(),
          }
        );

        // 🔥 STOP TRACKING
        if (
          trackingSubscriptions
            .current[
            taskId
          ]
        ) {
          trackingSubscriptions.current[
            taskId
          ].remove();

          delete trackingSubscriptions
            .current[
            taskId
          ];
        }
      } catch (e) {
        console.log(e);
      }
    };

  return (
    <TaskContext.Provider
      value={{
        tasks,

        loading,

        addTask,

        acceptTask,

        completeTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}