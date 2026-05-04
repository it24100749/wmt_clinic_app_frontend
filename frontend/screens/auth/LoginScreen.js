import React, { useState, useContext } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Image, SafeAreaView, KeyboardAvoidingView, Platform
} from "react-native";
import { Feather } from "@expo/vector-icons";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
 
export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
 
  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill all fields");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      await login(res.data, res.data.token);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed. Check your connection.";
      Alert.alert("Login Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.topSection}>
          <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
          <Text style={styles.appName}>Medicare</Text>
          <Text style={styles.appTagline}>Clinic Centre Mobile App</Text>
        </View>
 
        <View style={styles.bottomSection}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>Log in to your account</Text>
 
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Patient ID / Email"
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
 
          <View style={styles.row}>
            <TouchableOpacity style={styles.checkboxRow}>
              <View style={styles.checkbox} />
              <Text style={styles.rowText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
 
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Login</Text>}
          </TouchableOpacity>
 
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef6ff" },
  topSection: { flex: 0.4, justifyContent: "center", alignItems: "center" },
  logo: { width: 80, height: 80, resizeMode: "contain", marginBottom: 10 },
  appName: { fontSize: 24, fontWeight: "bold", color: "#1e293b" },
  appTagline: { fontSize: 13, color: "#64748b", marginTop: 2 },
  
  bottomSection: {
    flex: 0.6, backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30,
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
  
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  checkboxRow: { flexDirection: "row", alignItems: "center" },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: "#e2e8f0", marginRight: 8 },
  rowText: { fontSize: 13, color: "#64748b" },
  forgotText: { fontSize: 13, color: "#1e40af", fontWeight: "600" },
  
  loginBtn: {
    backgroundColor: "#1d4ed8", padding: 16, borderRadius: 15, alignItems: "center",
    shadowColor: "#1d4ed8", shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
  },
  loginBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
  footerText: { fontSize: 14, color: "#64748b" },
  signUpText: { fontSize: 14, color: "#1d4ed8", fontWeight: "bold" }
});
 