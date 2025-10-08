import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import theme from "../styles/theme";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    setError("");
    return true;
  };

  const onLogin = async () => {
    if (!validate()) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const code = err.code || err.message || "";
      if (code.includes("auth/user-not-found"))
        setError("No user found with this email.");
      else if (code.includes("auth/wrong-password"))
        setError("Invalid password.");
      else if (code.includes("auth/invalid-email"))
        setError("Invalid email address.");
      else setError("Login failed. " + (err.message || ""));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.brand}>
        <Image source={require("../assets/icon.png")} style={styles.logo} />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Text>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.link}> Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
    backgroundColor: theme.colors.lightBg,
  },
  brand: { alignItems: "center", marginTop: 12 },
  logo: { width: 72, height: 72, borderRadius: 12, marginBottom: 8 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
    color: theme.colors.purple,
  },
  subtitle: { textAlign: "center", marginBottom: 18, color: "#444" },
  form: { paddingHorizontal: 6 },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.peach,
  },
  row: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  link: { color: theme.colors.pink },
  error: { color: theme.colors.gold, marginBottom: 8, textAlign: "center" },
  primaryBtn: {
    backgroundColor: theme.colors.purple,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryBtnText: { color: theme.colors.white, fontWeight: "700" },
});