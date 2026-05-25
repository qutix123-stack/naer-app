import React, {
  createContext,
  useEffect,
  useState,
  useRef,
} from "react";

import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  addDoc,
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

import sendPushNotification from "../sendPushNotification";

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

  // 🔥 WAIT FOR AUTH
  const unsubscribeAuth =
    auth.onAuthStateChanged(
      (user) => {

        // 🔥 NOT LOGGED IN YET
        if (!user) {

          console.log(
            "AUTH NOT READY"
          );

          setTasks([]);

          setLoading(false);

          return;
        }

        console.log(
          "AUTH READY:",
          user.uid
        );

        // 🔥 REALTIME TASKS
        const unsubscribeTasks =
          onSnapshot(
            collection(
              db,
              "tasks"
            ),

            (snapshot) => {

              const firestoreTasks =
                snapshot.docs.map(
                  (
                    document
                  ) => ({
                    id:
                      document.id,

                    ...document.data(),
                  })
                );

              console.log(
                "LOADED TASKS:",
                firestoreTasks.length
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
                "TASK ERROR:",
                error
              );

              setTasks([]);

              setLoading(
                false
              );
            }
          );

        // 🔥 CLEANUP TASKS
        return () => {
          unsubscribeTasks();
        };
      }
    );

  // 🔥 CLEANUP EVERYTHING
  return () => {

    unsubscribeAuth();

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

    // 🔥 ACTIVITY FEED
const addActivity =
  async (text) => {

    try {

      await addDoc(
        collection(
          db,
          "activity"
        ),

        {
          text,

          createdAt:
            serverTimestamp(),
        }
      );

      await addActivity(
  `🆕 ${task.creatorName} la ut "${task.title}"`
);

    } catch (e) {

      console.log(e);
    }
  };

  // 🔥 ADD TASK
  const addTask =
    async (
      task
    ) => {
      try {
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

        if (
          task.image
        ) {
          imageUrl =
            await uploadImage(
              task.image
            );
        }

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

            category:
              task.category ||
              "Annet",

            accepted:
              false,

            status:
              "open",

            acceptedBy:
              null,

            acceptedById:
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

            creatorName:
              task.creatorName ||
              "Bruker",

              creatorRating:
              task.creatorRating || 5,

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
      taskId,
      helperName
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
                Location.Accuracy.Balaced,
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

            status:
              "accepted",

            acceptedBy:
              helperName ||
              "Hjelper",

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

        await addActivity(
        `✅ Oppdrag fullført`
        );

        await addActivity(
        `🤝 ${helperName} aksepterte "${taskData?.title || "et oppdrag"}"`
        );

        // 🔥 SEND PUSH
        const taskDoc =
          await getDoc(
            doc(
              db,
              "tasks",
              taskId
            )
          );

        const taskData =
          taskDoc.data();

        if (
          taskData?.createdBy
        ) {
          const userDoc =
            await getDoc(
              doc(
                db,
                "users",
                taskData.createdBy
              )
            );

          const userData =
            userDoc.data();

          if (
            userData?.pushToken
          ) {
            await sendPushNotification(
              userData.pushToken,

              "🎉 Oppdrag akseptert",

              `${helperName} vil hjelpe deg`
            );
          }
        }

        // 🔥 LIVE TRACKING
        const subscription =
          await Location.watchPositionAsync(
            {
              accuracy:
                Location.Accuracy.Balanced,

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

            status:
              "completed",

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

        // 🔥 PUSH
        const taskDoc =
          await getDoc(
            doc(
              db,
              "tasks",
              taskId
            )
          );

        const taskData =
          taskDoc.data();

        if (
          taskData?.createdBy
        ) {
          const userDoc =
            await getDoc(
              doc(
                db,
                "users",
                taskData.createdBy
              )
            );

          const userData =
            userDoc.data();

          if (
            userData?.pushToken
          ) {
            await sendPushNotification(
              userData.pushToken,

              "✅ Oppdrag fullført",

              "Oppdraget ditt ble fullført"
            );
          }
        }
      } catch (e) {
        console.log(e);
      }
    };

  // 🔥 UPDATE TASK STATUS
  const updateTaskStatus =
    async (
      taskId,
      status
    ) => {
      try {
        await updateDoc(
          doc(
            db,
            "tasks",
            taskId
          ),

          {
            status,
          }
        );

        // 🔥 PUSH
        const taskDoc =
          await getDoc(
            doc(
              db,
              "tasks",
              taskId
            )
          );

        const taskData =
          taskDoc.data();

        if (
          taskData?.createdBy
        ) {
          const userDoc =
            await getDoc(
              doc(
                db,
                "users",
                taskData.createdBy
              )
            );

          const userData =
            userDoc.data();

          if (
            userData?.pushToken
          ) {
            await sendPushNotification(
              userData.pushToken,

              "📍 Oppdrag oppdatert",

              `Status: ${status}`
            );
          }
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

        updateTaskStatus,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}