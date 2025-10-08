import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  getReactNativePersistence,
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBzZfiw-25AK2HL6dWmta3URB9fjquUTfY",
  authDomain: "modise-a91a8.firebaseapp.com",
  projectId: "modise-a91a8",
  databaseURL: "https://modise-a91a8-default-rtdb.firebaseio.com/",
  storageBucket: "modise-a91a8.firebasestorage.app",
  messagingSenderId: "609416764600",
  appId: "1:609416764600:web:18b640eab0b9482ca1a84d",
  measurementId: "G-KX15ZB6G8N",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
try {
  const persistence = getReactNativePersistence(ReactNativeAsyncStorage);
  setPersistence(auth, persistence).catch((e) =>
    console.warn("setPersistence failed", e)
  );
  setPersistence(auth, persistence)
    .then(() =>
      console.log("Firebase auth persistence configured using AsyncStorage")
    )
    .catch((e) => console.warn("setPersistence failed", e));
} catch (e) {
  console.warn("Failed to configure React Native persistence for auth", e);
}

export { auth };
export const db = getDatabase(app);