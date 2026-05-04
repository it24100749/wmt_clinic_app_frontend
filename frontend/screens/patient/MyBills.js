import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import api from "../../services/api";
 
export default function MyBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null); // track which bill is currently paying
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
 
  const fetchBills = () => {
    api.get("/billing/my")
      .then((res) => setBills(res.data))
      .catch(() => Alert.alert("Error", "Could not load bills"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handlePayment = async (bill) => {
    Alert.alert(
      "Confirm Payment",
      `Are you sure you want to securely pay Rs. ${bill.totalAmount} via Stripe?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay Now",
          style: "default",
          onPress: async () => {
            setPaying(bill._id);
            try {
              // 1. Fetch Payment Intent client secret
              const { data } = await api.post(`/billing/${bill._id}/create-payment-intent`);
              
              if (!data.clientSecret) {
                Alert.alert("Error", "Could not initialize payment.");
                setPaying(null);
                return;
              }

              // 2. Initialize Payment Sheet
              const initResponse = await initPaymentSheet({
                merchantDisplayName: 'Medicare Clinic',
                paymentIntentClientSecret: data.clientSecret,
                defaultBillingDetails: {
                  name: 'Jane Doe',
                }
              });

              if (initResponse.error) {
                Alert.alert("Payment Error", initResponse.error.message);
                setPaying(null);
                return;
              }

              // 3. Present Payment Sheet
              const paymentResponse = await presentPaymentSheet();

              if (paymentResponse.error) {
                Alert.alert("Payment Cancelled", paymentResponse.error.message);
                setPaying(null);
                return;
              }

              // 4. Confirm backend
              await api.post(`/billing/${bill._id}/pay`);
              Alert.alert("Success", "Payment successful!");
              fetchBills();
            } catch (err) {
              Alert.alert("Payment Failed", err.response?.data?.message || "Something went wrong.");
            } finally {
              setPaying(null);
            }
          }
        }
      ]
    );
  };
 
  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#1a73e8" />;
 
  return (
    <View style={styles.container}>
      <FlatList
        data={bills}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No bills found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.title}>Bill</Text>
              <Text style={[styles.status, { color: item.status === "paid" ? "#10b981" : item.status === "failed" ? "#ef4444" : "#f59e0b" }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.info}>Consultation: Rs. {item.consultationFee}</Text>
            <Text style={styles.info}>Medication: Rs. {item.medicationTotal}</Text>
            <View style={styles.divider} />
            <Text style={styles.total}>Total: Rs. {item.totalAmount}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>

            {item.status === "paid" && item.transactionId && (
              <Text style={styles.txnText}>Txn ID: {item.transactionId}</Text>
            )}

            {item.status === "unpaid" && (
              <TouchableOpacity
                style={styles.payBtn}
                onPress={() => handlePayment(item)}
                disabled={paying === item._id}
              >
                {paying === item._id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.payBtnText}>Pay Securely</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16,
    marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  title: { fontSize: 16, fontWeight: "bold", color: "#222" },
  status: { fontSize: 13, fontWeight: "bold" },
  info: { fontSize: 13, color: "#666", marginTop: 3 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  total: { fontSize: 16, fontWeight: "bold", color: "#1a73e8" },
  date: { fontSize: 12, color: "#aaa", marginTop: 4 },
  txnText: { fontSize: 12, color: "#10b981", marginTop: 6, fontWeight: "600" },
  payBtn: { backgroundColor: "#1a73e8", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 12 },
  payBtnText: { color: "#fff", fontWeight: "bold" },
  empty: { textAlign: "center", color: "#aaa", marginTop: 60, fontSize: 15 }
});