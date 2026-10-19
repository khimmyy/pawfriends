import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { registerOwner as saveOwner } from "../database/database";

export default function LoginScreen() {
  const db = useSQLiteContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerOwner = async () => {
    try {
      if (!fullName || !email || !password) {
        Alert.alert("Missing fields", "Please fill in all fields.");
        return;
      }

      await saveOwner(db, {
        fullName,
        email,
        password,
      });

      Alert.alert("Success", "Owner registered successfully!");

      router.replace("/(tabs)/home");
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message.includes("UNIQUE constraint failed")
          ? "An owner with this email already exists."
          : "Unable to register the owner right now.";

      Alert.alert("Registration failed", message);
    }
  };

  const KeyboardAviodingComponent = () => {
  return (
    <KeyboardAvoidingView
     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
     style={styles.container}>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
         <View style={styles.container}>
            <Text style={styles.logo}>🐾</Text>
              <Text style={styles.title}>Welcome to PawFriends</Text>
              <Text style={styles.subtitle}>Create your owner account</Text>

              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
              />

              <TextInput
                style={styles.input}
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity style={styles.button} onPress={registerOwner}>
                <Text style={styles.buttonText}>Register Owner</Text>
              </TouchableOpacity>

            <Text style={styles.loginText}>Already have an account? Log in</Text>
          </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
   
  );
};
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    fontSize: 70,
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    color: "#06123B",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  button: {
    backgroundColor: "#2257E5",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginText: {
    textAlign: "center",
    marginTop: 20,
    color: "#2257E5",
    fontWeight: "600",
  },
});
