async function test() {
  try {
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@clinic.com", password: "admin123" })
    });
    const loginData = await loginRes.json();
    console.log("Login successful, token:", loginData.token);

    const usersRes = await fetch("http://localhost:5000/api/auth/users", {
      headers: { Authorization: `Bearer ${loginData.token}` }
    });
    const usersData = await usersRes.json();
    console.log("Users fetched successfully:", usersData.length);
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
