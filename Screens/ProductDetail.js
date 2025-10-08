import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import theme from "../styles/theme";
import { addToCart } from "../firebase/cart";
import { auth } from "../firebase/config";

export default function ProductDetail({ route, navigation }) {
  const { product } = route.params || {};
  const [adding, setAdding] = useState(false);

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>No product data.</Text>
      </View>
    );
  }

  const onAddToCart = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert("Not signed in", "Please sign in to add items to your cart.");
      return;
    }
    setAdding(true);
    try {
      await addToCart(userId, product, 1);
      Alert.alert(
        "Added to cart",
        `${product.title} has been added to your cart.`
      );
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      <Text style={styles.category}>Category: {product.category}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onAddToCart}
        activeOpacity={0.8}
        disabled={adding}
      >
        <Text style={styles.primaryBtnText}>
          {adding ? "Adding..." : "Add to Cart"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    alignItems: "center",
    backgroundColor: theme.colors.lightBg,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: 240, height: 240, marginBottom: 12, borderRadius: 8 },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: theme.colors.purple,
  },
  price: { fontSize: 16, color: "#333", marginBottom: 8 },
  category: { fontSize: 12, color: "#666", marginBottom: 12 },
  description: { marginBottom: 16, textAlign: "left" },
  primaryBtn: {
    backgroundColor: theme.colors.purple,
    padding: 14,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
});
