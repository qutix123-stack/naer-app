import {
  useEffect,
  useState,
  useContext,
} from "react";

import * as Location from "expo-location";

import {
  TaskContext,
} from "../context/TaskContext";

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";

const categories = [
  {
    key: "all",
    label: "Alle",
  },

  {
    key: "Flytting",
    label: "🚚 Flytting",
  },

  {
    key: "Rengjøring",
    label: "🧹 Rengjøring",
  },

  {
    key: "IT",
    label: "💻 IT",
  },

  {
    key: "Handling",
    label: "🛒 Handling",
  },

  {
    key: "Hage",
    label: "🌳 Hage",
  },

  {
    key: "Bæring",
    label: "📦 Bæring",
  },

  {
    key: "Dyrepass",
    label: "🐶 Dyrepass",
  },

  {
    key: "Annet",
    label: "🔧 Annet",
  },
];

const getDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) *
      Math.PI) /
    180;

  const dLon =
    ((lon2 - lon1) *
      Math.PI) /
    180;

  const a =
    Math.sin(
      dLat / 2
    ) *
      Math.sin(
        dLat / 2
      ) +
    Math.cos(
      (lat1 *
        Math.PI) /
        180
    ) *
      Math.cos(
        (lat2 *
          Math.PI) /
          180
      ) *
      Math.sin(
        dLon /
          2
      ) *
      Math.sin(
        dLon /
          2
      );

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(
        1 - a
      )
    );

  return R * c;
};

export default function HomeScreen({
  navigation,
}) {
  const {
    tasks,
    loading,
  } =
    useContext(
      TaskContext
    );

  const [location, setLocation] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  // 🔥 LIVE LOCATION
  useEffect(() => {
    let subscription;

    const getLocation =
      async () => {
        try {
          const { status } =
            await Location.requestForegroundPermissionsAsync();

          if (
            status !==
            "granted"
          ) {
            return;
          }

          const currentLocation =
            await Location.getCurrentPositionAsync(
              {
                accuracy:
                  Location.Accuracy.High,
              }
            );

          setLocation(
            currentLocation.coords
          );

          subscription =
            await Location.watchPositionAsync(
              {
                accuracy:
                  Location.Accuracy.High,

                timeInterval: 5000,

                distanceInterval: 10,
              },

              (
                newLocation
              ) => {
                setLocation(
                  newLocation.coords
                );
              }
            );
        } catch (e) {
          console.log(e);
        }
      };

    getLocation();

    return () => {
      if (
        subscription
      ) {
        subscription.remove();
      }
    };
  }, []);

  // 🔥 TIME AGO
  const getTimeAgo = (
    timestamp
  ) => {
    if (!timestamp)
      return "Nettopp";

    const now =
      Date.now();

    const time =
      timestamp?.seconds
        ? timestamp.seconds *
          1000
        : timestamp;

    const diff =
      now - time;

    const minutes =
      Math.floor(
        diff / 60000
      );

    if (
      minutes < 1
    )
      return "Nettopp";

    if (
      minutes < 60
    )
      return `${minutes} min siden`;

    const hours =
      Math.floor(
        minutes / 60
      );

    if (
      hours < 24
    )
      return `${hours} t siden`;

    const days =
      Math.floor(
        hours / 24
      );

    return `${days} dager siden`;
  };

  // 🔥 FILTER TASKS
  const filteredTasks =
    [...tasks]
      .filter(
        (task) =>
          !task.completed
      )
      .filter(
        (task) => {
          if (
            filter ===
            "all"
          ) {
            return true;
          }

          return (
            task.category ===
            filter
          );
        }
      )
      .filter(
        (task) =>
          task.title
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          task.description
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
      )
      .sort((a, b) => {
        if (
          !location ||
          a.latitude ==
            null ||
          a.longitude ==
            null ||
          b.latitude ==
            null ||
          b.longitude ==
            null
        ) {
          return 0;
        }

        const distA =
          getDistance(
            location.latitude,
            location.longitude,
            a.latitude,
            a.longitude
          );

        const distB =
          getDistance(
            location.latitude,
            location.longitude,
            b.latitude,
            b.longitude
          );

        return (
          distA - distB
        );
      });

  // 🔥 TASK CARD
  const renderTask =
    ({ item }) => (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            "TaskDetail",
            {
              task: item,
            }
          )
        }
        style={{
          backgroundColor:
            "white",

          borderRadius: 28,

          marginBottom: 20,

          overflow:
            "hidden",

          shadowColor:
            "#000",

          shadowOpacity: 0.08,

          shadowRadius: 10,

          elevation: 4,
        }}
      >
        {item.image ? (
          <Image
            source={{
              uri: item.image,
            }}
            style={{
              width:
                "100%",

              height: 220,
            }}
          />
        ) : null}

        <View
          style={{
            padding: 20,
          }}
        >
          {/* BADGES */}
          <View
            style={{
              flexDirection:
                "row",

              flexWrap:
                "wrap",

              marginBottom: 12,
            }}
          >
            {/* CATEGORY */}
            <View
              style={{
                backgroundColor:
                  "#EFF6FF",

                paddingHorizontal: 12,

                paddingVertical: 6,

                borderRadius: 99,

                marginRight: 10,

                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color:
                    "#2563EB",

                  fontWeight:
                    "bold",
                }}
              >
                {item.category ||
                  "Annet"}
              </Text>
            </View>

            {item.urgent && (
              <View
                style={{
                  backgroundColor:
                    "#FEE2E2",

                  paddingHorizontal: 12,

                  paddingVertical: 6,

                  borderRadius: 99,

                  marginRight: 10,

                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color:
                      "#DC2626",

                    fontWeight:
                      "bold",
                  }}
                >
                  🔥 Haster
                </Text>
              </View>
            )}

            {item.accepted && (
              <View
                style={{
                  backgroundColor:
                    "#DCFCE7",

                  paddingHorizontal: 12,

                  paddingVertical: 6,

                  borderRadius: 99,

                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color:
                      "#16A34A",

                    fontWeight:
                      "bold",
                  }}
                >
                  🟢 Pågår
                </Text>
              </View>
            )}
          </View>

          <Text
            style={{
              fontSize: 24,

              fontWeight:
                "bold",

              color:
                "#111827",

              marginBottom: 10,
            }}
          >
            {item.title}
          </Text>

          <Text
            numberOfLines={
              2
            }
            style={{
              color:
                "#6B7280",

              fontSize: 16,

              lineHeight: 24,

              marginBottom: 18,
            }}
          >
            {item.description}
          </Text>

          <View
            style={{
              flexDirection:
                "row",

              justifyContent:
                "space-between",

              alignItems:
                "center",
            }}
          >
            <View>
              <Text
                style={{
                  color:
                    "#22C55E",

                  fontSize: 22,

                  fontWeight:
                    "bold",
                }}
              >
                {item.reward}
              </Text>

              <Text
                style={{
                  color:
                    "#9CA3AF",

                  marginTop: 4,
                }}
              >
                {getTimeAgo(
                  item.createdAt
                )}
              </Text>
            </View>

            {location &&
            item.latitude !=
              null &&
            item.longitude !=
              null ? (
              <View
                style={{
                  backgroundColor:
                    "#EFF6FF",

                  paddingHorizontal: 14,

                  paddingVertical: 10,

                  borderRadius: 18,
                }}
              >
                <Text
                  style={{
                    color:
                      "#2563EB",

                    fontWeight:
                      "bold",
                  }}
                >
                  📍{" "}
                  {Math.round(
                    getDistance(
                      location.latitude,
                      location.longitude,
                      item.latitude,
                      item.longitude
                    ) * 1000
                  )}m
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );

  // 🔥 LOADING
  if (
    loading ||
    !location
  ) {
    return (
      <View
        style={{
          flex: 1,

          justifyContent:
            "center",

          alignItems:
            "center",

          backgroundColor:
            "#F4F6F8",
        }}
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text
          style={{
            marginTop: 20,

            fontSize: 18,

            color:
              "#6B7280",
          }}
        >
          Laster oppdrag...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,

        backgroundColor:
          "#F4F6F8",
      }}
    >
      <FlatList
        data={filteredTasks}
        keyExtractor={(
          item
        ) => item.id}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          padding: 20,

          paddingTop: 70,

          paddingBottom: 140,
        }}
        ListHeaderComponent={
          <>
            <Text
              style={{
                fontSize: 42,

                fontWeight:
                  "bold",

                color:
                  "#111827",
              }}
            >
              Oppdrag nær deg
            </Text>

            <Text
              style={{
                fontSize: 18,

                color:
                  "#6B7280",

                marginTop: 8,

                marginBottom: 25,
              }}
            >
              Finn hjelp eller tjen penger 🚀
            </Text>

            {/* SEARCH */}
            <TextInput
              placeholder="Søk etter oppdrag..."
              value={search}
              onChangeText={
                setSearch
              }
              style={{
                backgroundColor:
                  "white",

                padding: 18,

                borderRadius: 20,

                marginBottom: 18,

                fontSize: 16,
              }}
            />

            {/* CATEGORY FILTERS */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              style={{
                marginBottom: 25,
              }}
            >
              {categories.map(
                (
                  item
                ) => (
                  <TouchableOpacity
                    key={
                      item.key
                    }
                    onPress={() =>
                      setFilter(
                        item.key
                      )
                    }
                    style={{
                      backgroundColor:
                        filter ===
                        item.key
                          ? "#2563EB"
                          : "white",

                      paddingHorizontal: 18,

                      paddingVertical: 12,

                      borderRadius: 20,

                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          filter ===
                          item.key
                            ? "white"
                            : "#111827",

                        fontWeight:
                          "bold",
                      }}
                    >
                      {
                        item.label
                      }
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          </>
        }
        renderItem={
          renderTask
        }
      />

      {/* FLOAT BUTTON */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            "Opprett"
          )
        }
        style={{
          position:
            "absolute",

          right: 25,

          bottom: 110,

          backgroundColor:
            "#2563EB",

          width: 72,

          height: 72,

          borderRadius: 36,

          justifyContent:
            "center",

          alignItems:
            "center",

          shadowColor:
            "#000",

          shadowOpacity: 0.2,

          shadowRadius: 10,

          elevation: 8,
        }}
      >
        <Text
          style={{
            color:
              "white",

            fontSize: 42,

            marginTop: -2,
          }}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
}