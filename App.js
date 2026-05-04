import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";

import { AuthProvider, AuthContext } from "./context/AuthContext";

// Auth screens
import LoginScreen from "./screens/auth/LoginScreen";
import RegisterScreen from "./screens/auth/RegisterScreen";

// Patient screens
import PatientHome from "./screens/patient/PatientHome";
import BookAppointment from "./screens/patient/BookAppointment";
import MyAppointments from "./screens/patient/MyAppointments";
import MyPrescriptions from "./screens/patient/MyPrescriptions";
import MyBills from "./screens/patient/MyBills";
import Support from "./screens/patient/Support";

// Doctor screens
import DoctorHome from "./screens/doctor/DoctorHome";
import DoctorSchedule from "./screens/doctor/DoctorSchedule";
import DoctorAppointments from "./screens/doctor/DoctorAppointments";
import CreateEMR from "./screens/doctor/CreateEMR";
import CreatePrescription from "./screens/doctor/CreatePrescription";
import MedicalHistory from "./screens/doctor/MedicalHistory";

// Admin screens
import AdminHome from "./screens/admin/AdminHome";
import AllUsers from "./screens/admin/AllUsers";
import CreateUser from "./screens/admin/CreateUser";
import AdminAppointments from "./screens/admin/AdminAppointments";
import AdminBilling from "./screens/admin/AdminBilling";
import AdminTickets from "./screens/admin/AdminTickets";
import AdminFeedback from "./screens/admin/AdminFeedback";
import AdminSchedules from "./screens/admin/AdminSchedules";

// Pharmacist screens
import PharmacistHome from "./screens/pharmacist/PharmacistHome";
import AllPrescriptions from "./screens/pharmacist/AllPrescriptions";
import DispensePrescription from "./screens/pharmacist/DispensePrescription";

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: "#fff" }, headerTintColor: "#333" }}>
      {!user ? (
        // Auth Screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      ) : user.role === "patient" ? (
        // Patient Screens
        <>
          <Stack.Screen name="PatientHome" component={PatientHome} options={{ headerShown: false }} />
          <Stack.Screen name="BookAppointment" component={BookAppointment} options={{ title: "Book Appointment" }} />
          <Stack.Screen name="MyAppointments" component={MyAppointments} options={{ title: "My Appointments" }} />
          <Stack.Screen name="MyPrescriptions" component={MyPrescriptions} options={{ title: "My Prescriptions" }} />
          <Stack.Screen name="MyBills" component={MyBills} options={{ title: "My Bills" }} />
          <Stack.Screen name="Support" component={Support} options={{ title: "Support" }} />
        </>
      ) : user.role === "doctor" ? (
        // Doctor Screens
        <>
          <Stack.Screen name="DoctorHome" component={DoctorHome} options={{ headerShown: false }} />
          <Stack.Screen name="DoctorSchedule" component={DoctorSchedule} options={{ title: "My Schedule" }} />
          <Stack.Screen name="DoctorAppointments" component={DoctorAppointments} options={{ title: "Appointments" }} />
          <Stack.Screen name="CreateEMR" component={CreateEMR} options={{ title: "Create EMR" }} />
          <Stack.Screen name="CreatePrescription" component={CreatePrescription} options={{ title: "Write Prescription" }} />
          <Stack.Screen name="MedicalHistory" component={MedicalHistory} options={{ title: "Medical History" }} />
        </>
      ) : user.role === "admin" ? (
        // Admin Screens
        <>
          <Stack.Screen name="AdminHome" component={AdminHome} options={{ headerShown: false }} />
          <Stack.Screen name="AllUsers" component={AllUsers} options={{ title: "All Users" }} />
          <Stack.Screen name="CreateUser" component={CreateUser} options={{ title: "Add New User" }} />
          <Stack.Screen name="AdminSchedules" component={AdminSchedules} options={{ title: "Manage Schedules" }} />
          <Stack.Screen name="AdminAppointments" component={AdminAppointments} options={{ title: "Appointments" }} />
          <Stack.Screen name="AdminBilling" component={AdminBilling} options={{ title: "Billing" }} />
          <Stack.Screen name="AdminTickets" component={AdminTickets} options={{ title: "Support Tickets" }} />
          <Stack.Screen name="AdminFeedback" component={AdminFeedback} options={{ title: "Patient Feedback" }} />
        </>
      ) : (
        // Pharmacist Screens
        <>
          <Stack.Screen name="PharmacistHome" component={PharmacistHome} options={{ headerShown: false }} />
          <Stack.Screen name="AllPrescriptions" component={AllPrescriptions} options={{ title: "All Prescriptions" }} />
          <Stack.Screen name="DispensePrescription" component={DispensePrescription} options={{ title: "Dispense" }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </StripeProvider>
  );
}