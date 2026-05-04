import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, SafeAreaView, Image
} from "react-native";
import { Feather } from "@expo/vector-icons";
import api from "../../services/api";
 
export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
 
  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert("Error", "Please fill all fields");
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      Alert.alert("Success", "Account created! Please login.");
      navigation.navigate("Login");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
          <Text style={styles.appName}>Medicare</Text>
        </View>
 
        <View style={styles.bottomSection}>
          <Text style={styles.welcomeTitle}>Create Account</Text>
          <Text style={styles.welcomeSubtitle}>Join our clinic community today</Text>
 
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />
          </View>
 
          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
 
          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
 
          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerBtnText}>Register</Text>}
          </TouchableOpacity>
 
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef6ff" },
  scrollContainer: { flexGrow: 1 },
  topSection: { height: 200, justifyContent: "center", alignItems: "center" },
  logo: { width: 70, height: 70, resizeMode: "contain", marginBottom: 8 },
  appName: { fontSize: 22, fontWeight: "bold", color: "#1e293b" },
  
  bottomSection: {
    flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 30, elevation: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10
  },
  welcomeTitle: { fontSize: 26, fontWeight: "bold", color: "#1e293b", textAlign: "center" },
  welcomeSubtitle: { fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 30, marginTop: 5 },
  
  inputContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 15, paddingHorizontal: 15, marginBottom: 15
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 15, color: "#1e293b" },
  
  registerBtn: {
    backgroundColor: "#1d4ed8", padding: 16, borderRadius: 15, alignItems: "center", marginTop: 10,
    shadowColor: "#1d4ed8", shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
  },
  registerBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 30, marginBottom: 20 },
  footerText: { fontSize: 14, color: "#64748b" },
  loginText: { fontSize: 14, color: "#1d4ed8", fontWeight: "bold" }
});
 