import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Button,
  ScrollView,
} from "react-native";
import theme from "../styles/theme";

const PRODUCTS_URL = "https://fakestoreapi.com/products";
const CATEGORIES_URL = "https://fakestoreapi.com/products/categories";

export default function ProductList({ navigation }) {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (category = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(PRODUCTS_URL);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
      if (category) setFiltered(data.filter((p) => p.category === category));
      else setFiltered(data);
    } catch (err) {
      setError(err.message || "Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(CATEGORIES_URL);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.warn("Categories fetch failed", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const onSelectCategory = (cat) => {
    setSelectedCategory(cat);
    if (!cat) {
      setFiltered(products);
      return;
    }
    setFiltered(products.filter((p) => p.category === cat));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.purple} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
        <Button title="Retry" onPress={() => fetchData(selectedCategory)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
      >
        <TouchableOpacity
          style={[styles.catBtn, selectedCategory === null && styles.catActive]}
          onPress={() => onSelectCategory(null)}
        >
          <Text>All</Text>
        </TouchableOpacity>
        {categories.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.catBtn, selectedCategory === c && styles.catActive]}
            onPress={() => onSelectCategory(c)}
          >
            <Text>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.lightBg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    alignItems: "center",
  },
  image: { width: 88, height: 88, marginRight: 12, borderRadius: 6 },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600" },
  price: { marginTop: 6, color: "#333" },
  categories: { padding: 10, backgroundColor: theme.colors.white },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  catActive: {
    backgroundColor: theme.colors.purple,
    borderColor: theme.colors.purple,
  },
});
