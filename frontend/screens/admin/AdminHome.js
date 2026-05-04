import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const MenuItem = ({ title, subtitle, icon, color, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={[styles.iconBox, { backgroundColor: color + "10" }]}>
      <MaterialCommunityIcons name={icon} size={28} color={color} />
    </View>
    <View style={styles.info}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
    <Feather name="chevron-right" size={20} color="#cbd5e1" />
  </TouchableOpacity>
);

export default function AdminHome({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.userName}>{user?.name} 👋</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Feather name="log-out" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>System Management</Text>
        
        <MenuItem 
          title="All Users" 
          subtitle="Manage registrations and roles" 
          icon="account-group-outline" 
          color="#7c3aed" 
          onPress={() => navigation.navigate("AllUsers")} 
        />
        
        <MenuItem 
          title="Manage Schedules" 
          subtitle="Assign doctor shifts and dates" 
          icon="calendar-clock" 
          color="#ec4899" 
          onPress={() => navigation.navigate("AdminSchedules")} 
        />
        
        <MenuItem 
          title="All Appointments" 
          subtitle="View and update booking status" 
          icon="clipboard-list-outline" 
          color="#3b82f6" 
          onPress={() => navigation.navigate("AdminAppointments")} 
        />
        
        <MenuItem 
          title="Billing & Payments" 
          subtitle="View invoices and track fees" 
          icon="wallet-outline" 
          color="#10b981" 
          onPress={() => navigation.navigate("AdminBilling")} 
        />

        <Text style={styles.sectionTitle}>Support & Feedback</Text>

        <MenuItem 
          title="Support Tickets" 
          subtitle="Resolve user issues and replies" 
          icon="ticket-outline" 
          color="#f59e0b" 
          onPress={() => navigation.navigate("AdminTickets")} 
        />
        
        <MenuItem 
          title="Patient Feedback" 
          subtitle="Read general experience ratings" 
          icon="message-draw" 
          color="#6366f1" 
          onPress={() => navigation.navigate("AdminFeedback")} 
        />
        
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#7c3aed",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 8,
    shadowColor: "#7c3aed",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { fontSize: 16, color: "#ddd6fe", fontWeight: "500" },
  userName: { fontSize: 24, fontWeight: "bold", color: "#fff", marginTop: 2 },
  logoutBtn: { 
    backgroundColor: "rgba(255,255,255,0.2)", 
    padding: 10, 
    borderRadius: 12 
  },
  content: { padding: 24 },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#1e293b", 
    marginBottom: 16, 
    marginTop: 8 
  },
  card: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 24,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9"
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  info: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#334155" },
  cardSubtitle: { fontSize: 12, color: "#94a3b8", marginTop: 2 }
});