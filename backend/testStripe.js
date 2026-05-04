require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function test() {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 110000,
      currency: "lkr",
      automatic_payment_methods: { enabled: true },
    });
    console.log("Created PaymentIntent:", paymentIntent.id);
    console.log("Client Secret:", paymentIntent.client_secret);

    // Try to retrieve it
    const retrieved = await stripe.paymentIntents.retrieve(paymentIntent.id);
    console.log("Successfully retrieved:", retrieved.id);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
