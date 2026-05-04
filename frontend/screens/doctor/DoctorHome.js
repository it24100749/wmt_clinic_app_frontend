import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { Feather } from "@expo/vector-icons";

const ActionCard = ({ title, subtitle, icon, color, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: color + "15" }]}>
      <Feather name={icon} size={28} color={color} />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
    <Feather name="chevron-right" size={20} color="#cbd5e1" />
  </TouchableOpacity>
);

export default function DoctorHome({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>Welcome Back,</Text>
              <Text style={styles.doctorName}>Dr. {user?.name}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <Feather name="log-out" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Role</Text>
              <Text style={styles.statValue}>Doctor</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Specialization</Text>
              <Text style={styles.statValue}>{user?.specialization || "General"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Main Management</Text>
          
          <ActionCard 
            title="My Schedule" 
            subtitle="Manage your available working hours" 
            icon="calendar" 
            color="#10b981" 
            onPress={() => navigation.navigate("DoctorSchedule")} 
          />
          
          <ActionCard 
            title="Appointments" 
            subtitle="Check and manage patient visits" 
            icon="clipboard" 
            color="#3b82f6" 
            onPress={() => navigation.navigate("DoctorAppointments")} 
          />

          <View style={styles.infoBox}>
            <Feather name="info" size={20} color="#64748b" />
            <Text style={styles.infoText}>
              EMR and Prescriptions can be managed directly from the "Appointments" section for each patient.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#059669" },
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#059669", 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    width: "100%"
  },
  welcomeText: { fontSize: 14, color: "#d1fae5", fontWeight: "500" },
  doctorName: { fontSize: 20, fontWeight: "bold", color: "#fff", marginTop: 2, maxWidth: "70%" },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { backgroundColor: "rgba(255,255,255,0.15)", padding: 10, borderRadius: 12 },
  logoutBtn: { backgroundColor: "rgba(255,255,255,0.15)", padding: 10, borderRadius: 12 },
  
  statsRow: { 
    flexDirection: "row", 
    backgroundColor: "rgba(255,255,255,0.1)", 
    marginTop: 25, 
    borderRadius: 15, 
    padding: 15,
    alignItems: "center"
  },
  statItem: { flex: 1 },
  statLabel: { fontSize: 11, color: "#d1fae5", textTransform: "uppercase", letterSpacing: 0.5 },
  statValue: { fontSize: 14, color: "#fff", fontWeight: "600", marginTop: 2 },
  statDivider: { width: 1, height: 25, backgroundColor: "rgba(255,255,255,0.2)", marginHorizontal: 15 },

  content: { padding: 25, marginTop: -20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1e293b", marginBottom: 15 },
  
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  iconContainer: { width: 56, height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: 15 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: "bold", color: "#1e293b" },
  cardSubtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  
  infoBox: { 
    flexDirection: "row", 
    backgroundColor: "#f1f5f9", 
    padding: 15, 
    borderRadius: 12, 
    marginTop: 10,
    alignItems: "center"
  },
  infoText: { flex: 1, fontSize: 12, color: "#64748b", marginLeft: 10, lineHeight: 18 }
});