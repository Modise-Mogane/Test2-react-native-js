import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import theme from "../styles/theme";

export default function Home({ user, navigation }) {
  const [carousel, setCarousel] = useState([]);
  const scrollRef = useRef(null);
  const width = Dimensions.get("window").width - 40; 
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let mounted = true;
    fetch("https://fakestoreapi.com/products?limit=5")
      .then((r) => r.json())
      .then((data) => {
        if (mounted && Array.isArray(data)) setCarousel(data);
      })
      .catch(() => {
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!scrollRef.current || carousel.length === 0) return;
      const next = (idx + 1) % carousel.length;
      setIdx(next);
      scrollRef.current.scrollTo({ x: next * width, animated: true });
    }, 3500);
    return () => clearInterval(timer);
  }, [idx, carousel, width]);

  const onLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Sign out error", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ShopEZ</Text>
      <Text style={styles.warm}>
        Good to see you{user?.email ? ` — ${user.email}` : ""}! Find something
        you love today.
      </Text>

      <View style={styles.carouselWrap}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          ref={scrollRef}
        >
          {(carousel.length
            ? carousel
            : [{ image: require("../assets/icon.png") }]
          ).map((p, i) => (
            <View key={i} style={[styles.slide, { width }]}>
              <Image
                source={
                  typeof p.image === "string" ? { uri: p.image } : p.image
                }
                style={styles.slideImg}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.navigate("Products")}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>Shop Products</Text>
      </TouchableOpacity>
      <View style={{ height: 12 }} />
      <TouchableOpacity
        style={styles.outlineBtn}
        onPress={onLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.outlineBtnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    paddingTop: 36,
    backgroundColor: theme.colors.lightBg,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
    color: theme.colors.purple,
  },
  warm: { marginBottom: 12, color: "#444", textAlign: "center" },
  carouselWrap: { width: "100%", marginBottom: 16, alignItems: "center" },
  slide: { justifyContent: "center", alignItems: "center", height: 180 },
  slideImg: { width: "90%", height: "100%", maxHeight: 180 },
  email: { marginBottom: 20, color: theme.colors.black },
  primaryBtn: {
    backgroundColor: theme.colors.purple,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "60%",
  },
  primaryBtnText: { color: theme.colors.white, fontWeight: "700" },
  outlineBtn: {
    borderWidth: 1,
    borderColor: theme.colors.purple,
    padding: 12,
    borderRadius: 8,
    width: "60%",
    alignItems: "center",
  },
  outlineBtnText: { color: theme.colors.purple, fontWeight: "700" },
});
