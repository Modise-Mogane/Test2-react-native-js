import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Button,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import theme from "../styles/theme";
import { listenToCart, updateCartItem, removeCartItem } from "../firebase/cart";
import { auth } from "../firebase/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "cart_cache_v1";

export default function Cart() {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setItems({});
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(`${STORAGE_KEY}_${userId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          setItems(parsed || {});
        }
      } catch (e) {
        console.warn("Failed to load cached cart", e);
      }
    })();

    const unsub = listenToCart(userId, (val) => {
      const newVal = val || {};
      setItems(newVal);
      setLoading(false);
      AsyncStorage.setItem(
        `${STORAGE_KEY}_${userId}`,
        JSON.stringify(newVal)
      ).catch((e) => console.warn("Failed to save cart cache", e));
    });
    return unsub;
  }, []);

  const data = Object.keys(items).map((key) => ({ id: key, ...items[key] }));

  const onIncrease = async (id, current) => {
    const userId = auth.currentUser?.uid;
    const next = { ...items, [id]: { ...items[id], quantity: current + 1 } };
    setItems(next);
    AsyncStorage.setItem(
      `${STORAGE_KEY}_${userId}`,
      JSON.stringify(next)
    ).catch((e) => console.warn("Failed to save cart cache", e));
    try {
      await updateCartItem(userId, id, current + 1);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to update quantity");
    }
  };

  const onDecrease = async (id, current) => {
    const userId = auth.currentUser?.uid;
    const newQty = current - 1;
    const next = { ...items };
    if (newQty <= 0) delete next[id];
    else next[id] = { ...next[id], quantity: newQty };
    setItems(next);
    AsyncStorage.setItem(
      `${STORAGE_KEY}_${userId}`,
      JSON.stringify(next)
    ).catch((e) => console.warn("Failed to save cart cache", e));
    try {
      await updateCartItem(userId, id, newQty);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to update quantity");
    }
  };

  const onRemove = async (id) => {
    const userId = auth.currentUser?.uid;
    const next = { ...items };
    delete next[id];
    setItems(next);
    AsyncStorage.setItem(
      `${STORAGE_KEY}_${userId}`,
      JSON.stringify(next)
    ).catch((e) => console.warn("Failed to save cart cache", e));
    try {
      await removeCartItem(userId, id);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to remove item");
    }
  };

  const total = data.reduce(
    (s, it) => s + (it.quantity || 0) * (it.product?.price || 0),
    0
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.purple} />
      </View>
    );

  if (data.length === 0)
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: theme.colors.peach, flex: 1 },
        ]}
      >
        <Text style={{ color: theme.colors.purple }}>Your cart is empty.</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.peach }}>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          const product = item.product || {};
          const imgSource =
            typeof product.image === "string"
              ? { uri: product.image }
              : product.image
              ? product.image
              : require("../assets/icon.png");
          const title = product.title || "Product";
          const price = product.price != null ? product.price : 0;

          return (
            <View style={styles.row}>
              <Image source={imgSource} style={styles.img} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text numberOfLines={2} style={styles.title}>
                  {title}
                </Text>
                <Text style={{ color: "#666" }}>${price.toFixed(2)}</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    onPress={() => onDecrease(item.id, item.quantity)}
                    style={styles.qtyBtn}
                  >
                    <Text style={{ fontSize: 18 }}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity || 0}</Text>
                  <TouchableOpacity
                    onPress={() => onIncrease(item.id, item.quantity)}
                    style={styles.qtyBtn}
                  >
                    <Text style={{ fontSize: 18 }}>+</Text>
                  </TouchableOpacity>
                  <View style={{ width: 12 }} />
                  <TouchableOpacity
                    onPress={() => onRemove(item.id)}
                    style={styles.removeBtn}
                  >
                    <Text
                      style={{ color: theme.colors.purple, fontWeight: "600" }}
                    >
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={{ fontWeight: "600", color: theme.colors.black }}>
                ${((item.quantity || 0) * price).toFixed(2)}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.totalRow}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: theme.colors.purple,
          }}
        >
          Total
        </Text>
        <Text
          style={{ fontSize: 18, fontWeight: "700", color: theme.colors.black }}
        >
          ${total.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  row: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  img: { width: 70, height: 70 },
  title: { fontWeight: "600", color: theme.colors.black },
  qtyBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  qtyText: { marginHorizontal: 12, fontWeight: "600" },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  removeBtn: { padding: 6 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
});
