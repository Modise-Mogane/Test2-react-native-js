import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import Login from "./Screens/Login";
import Signup from "./Screens/Signup";
import Home from "./Screens/Home";
import ProductList from "./Screens/ProductList";
import ProductDetail from "./Screens/ProductDetail";
import Cart from "./Screens/Cart";
import { View, ActivityIndicator, Text } from "react-native";
import theme from "./styles/theme";
import { listenToCart } from "./firebase/cart";


const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }
    const unsub = listenToCart(user.uid, (val) => {
      const count = Object.values(val || {}).reduce(
        (s, it) => s + (it.quantity || 0),
        0
      );
      setCartCount(count);
    });
    return unsub;
  }, [user]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.white },
          headerTintColor: theme.colors.purple,
          headerTitleStyle: { color: theme.colors.purple },
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="Home"
              options={({ navigation }) => ({
                title: "ShopEZ Home",
                headerRight: () => (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      onPress={() => navigation.navigate("Cart")}
                      style={{ color: theme.colors.purple, marginRight: 8 }}
                    >
                      Cart
                    </Text>
                    {cartCount > 0 && (
                      <View
                        style={{
                          backgroundColor: theme.colors.pink,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 12,
                          marginRight: 12,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.colors.white,
                            fontWeight: "700",
                          }}
                        >
                          {cartCount}
                        </Text>
                      </View>
                    )}
                  </View>
                ),
              })}
            >
              {(props) => <Home {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen
              name="Cart"
              component={Cart}
              options={{ title: "Your Cart" }}
            />
            <Stack.Screen
              name="Products"
              component={ProductList}
              options={({ navigation }) => ({
                title: "ShopEZ Products",
                headerRight: () => (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      onPress={() => navigation.navigate("Cart")}
                      style={{ color: theme.colors.purple, marginRight: 8 }}
                    >
                      Cart
                    </Text>
                    {cartCount > 0 && (
                      <View
                        style={{
                          backgroundColor: theme.colors.pink,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 12,
                          marginRight: 12,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.colors.white,
                            fontWeight: "700",
                          }}
                        >
                          {cartCount}
                        </Text>
                      </View>
                    )}
                  </View>
                ),
              })}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetail}
              options={({ navigation }) => ({
                title: "Product Details",
                headerRight: () => (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      onPress={() => navigation.navigate("Cart")}
                      style={{ color: theme.colors.purple, marginRight: 8 }}
                    >
                      Cart
                    </Text>
                    {cartCount > 0 && (
                      <View
                        style={{
                          backgroundColor: theme.colors.pink,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 12,
                          marginRight: 12,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.colors.white,
                            fontWeight: "700",
                          }}
                        >
                          {cartCount}
                        </Text>
                      </View>
                    )}
                  </View>
                ),
              })}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={Login}
              options={{ title: "Sign In" }}
            />
            <Stack.Screen
              name="Signup"
              component={Signup}
              options={{ title: "Create Account" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
