import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { AuthContext } from "../../context/AuthContext";
 
export default function PharmacistHome({ navigation }) {
  const { user, logout } = useContext(AuthContext);
 
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name} 👋</Text>
          <Text style={styles.role}>Pharmacist</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
 
      <Text style={styles.sectionTitle}>Quick Actions</Text>
 
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("AllPrescriptions")}>
        <Text style={styles.emoji}>💊</Text>
        <View>
          <Text style={styles.cardTitle}>All Prescriptions</Text>
          <Text style={styles.cardSubtitle}>View and process prescriptions</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  header: {
    backgroundColor: "#f59e0b", padding: 24, paddingTop: 50,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center"
  },
  greeting: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  role: { fontSize: 13, color: "#fef3c7", marginTop: 2 },
  logoutBtn: { backgroundColor: "rgba(255,255,255,0.2)", padding: 8, borderRadius: 8 },
  logoutText: { color: "#fff", fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", margin: 20, marginBottom: 12 },
  card: {
    backgroundColor: "#fff", marginHorizontal: 20, marginBottom: 12,
    borderRadius: 14, padding: 18, flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2
  },
  emoji: { fontSize: 30, marginRight: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#222" },
  cardSubtitle: { fontSize: 13, color: "#888", marginTop: 2 }
});
 