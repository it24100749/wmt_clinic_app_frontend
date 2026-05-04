import React, { useContext } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, Dimensions, StatusBar 
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { Feather, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const QuickAction = ({ title, icon, color, onPress }) => (
  <TouchableOpacity 
    style={[styles.actionCard, { borderLeftColor: color }]} 
    onPress={onPress}
  >
    <View style={[styles.iconCircle, { backgroundColor: color + "15" }]}>
      <MaterialCommunityIcons name={icon} size={28} color={color} />
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
);

const MenuItem = ({ title, subtitle, icon, color, onPress }) => (
  <TouchableOpacity style={styles.menuCard} onPress={onPress}>
    <View style={[styles.menuIconBox, { backgroundColor: color + "10" }]}>
      <MaterialCommunityIcons name={icon} size={26} color={color} />
    </View>
    <View style={styles.menuInfo}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <Feather name="chevron-right" size={20} color="#ccc" />
  </TouchableOpacity>
);

export default function PatientHome({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{user?.name} 👋</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Feather name="log-out" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          <QuickAction 
            title="Book Appt" 
            icon="calendar-plus" 
            color="#4f46e5" 
            onPress={() => navigation.navigate("BookAppointment")} 
          />
          <QuickAction 
            title="My Prescr" 
            icon="pill" 
            color="#0891b2" 
            onPress={() => navigation.navigate("MyPrescriptions")} 
          />
        </View>

        {/* Main Menu */}
        <Text style={styles.sectionTitle}>Services</Text>
        <MenuItem 
          title="My Appointments" 
          subtitle="Manage your upcoming visits" 
          icon="calendar-clock" 
          color="#8b5cf6" 
          onPress={() => navigation.navigate("MyAppointments")} 
        />
        <MenuItem 
          title="My Bills" 
          subtitle="View and pay your medical bills" 
          icon="credit-card-outline" 
          color="#f59e0b" 
          onPress={() => navigation.navigate("MyBills")} 
        />
        <MenuItem 
          title="Support & Feedback" 
          subtitle="Get help or share experience" 
          icon="help-circle-outline" 
          color="#10b981" 
          onPress={() => navigation.navigate("Support")} 
        />

        {/* Health Tip Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <FontAwesome5 name="lightbulb" size={24} color="#fff" />
          </View>
          <View style={styles.tipTextContent}>
            <Text style={styles.tipTitle}>Health Tip</Text>
            <Text style={styles.tipText}>Drink at least 8 glasses of water daily to stay hydrated and energized!</Text>
          </View>
        </View>
        
        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#1a73e8",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 10,
    shadowColor: "#1a73e8",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  greeting: { fontSize: 16, color: "#e0e7ff", fontWeight: "500" },
  userName: { fontSize: 24, fontWeight: "bold", color: "#fff", marginTop: 2 },
  logoutBtn: { 
    backgroundColor: "rgba(255,255,255,0.2)", 
    padding: 10, 
    borderRadius: 12 
  },
  
  content: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 15, marginTop: 10 },
  
  grid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  actionCard: {
    backgroundColor: "#fff",
    width: (width - 64) / 2,
    padding: 16,
    borderRadius: 20,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: { fontSize: 15, fontWeight: "bold", color: "#334155" },
  
  menuCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  menuIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuInfo: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: "bold", color: "#334155" },
  menuSubtitle: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  
  tipCard: {
    backgroundColor: "#4f46e5",
    borderRadius: 25,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    elevation: 5,
    shadowColor: "#4f46e5",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  tipIcon: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  tipTextContent: { flex: 1 },
  tipTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  tipText: { color: "#e0e7ff", fontSize: 13, marginTop: 4, lineHeight: 18 }
});