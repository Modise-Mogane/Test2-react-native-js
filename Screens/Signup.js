import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import theme from "../styles/theme";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

export default function Signup({ navigation }) {
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
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return false;
    }
    setError("");
    return true;
  };

  const onSignup = async () => {
    if (!validate()) return;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Signup error", err);
      const code = err.code || err.message || "";
      Alert.alert("Signup error", `${code}\n\n${err.message || ""}`);
      if (code.includes("auth/email-already-in-use"))
        setError("Email already in use.");
      else if (code.includes("auth/invalid-email"))
        setError("Invalid email address.");
      else if (code.includes("auth/weak-password")) setError("Weak password.");
      else setError("Signup failed. " + (err.message || ""));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join ShopEZ</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View>
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
          onPress={onSignup}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>Create account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Text>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}> Log in</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
    color: theme.colors.purple,
  },
  subtitle: { textAlign: "center", marginBottom: 18, color: "#444" },
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
