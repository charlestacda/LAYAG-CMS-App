const express = require("express");
const cors = require("cors"); 
const admin = require("firebase-admin");
const app = express();

app.use(cors());


const serviceAccount = require("../layag_key.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lpu-app-database-e0c6c-default-rtdb.firebaseio.com"
});

// Endpoint to fetch user data securely
app.get("/api/users", async (req, res) => {
  try {
    // Fetch user data using Firebase Admin SDK
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users.map((userRecord) => ({
      email: userRecord.email,
      metadata: userRecord.metadata,
      // Add other properties as needed based on your actual user data
    }));

    res.status(200).json({ users }); // Send users as part of an object
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});