const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const timeout = require('connect-timeout'); // To avoid hanging requests

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(timeout('10s')); // Set timeout for requests (10 seconds)

// MongoDB connection URI (ensure you have set this in your environment variables)
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017'; // Add a fallback for local testing
const client = new MongoClient(mongoURI);

// API Endpoint: Update Balance
app.post('/update-balance', async (req, res) => {
    const { username, balance } = req.body;

    console.log("Request received to update balance:", { username, balance });

    // Input Validation
    if (!username || typeof balance !== 'number') {
        console.log("Invalid input data");
        return res.status(400).json({ success: false, message: "Invalid input data! Username and numeric balance are required." });
    }

    try {
        console.log("Connecting to MongoDB...");
        await client.connect();
        const database = client.db("PlayersSynced");
        const collection = database.collection("SyncedPlayers");
        console.log("Connected to MongoDB.");

        // Find the player by username
        const player = await collection.findOne({ username });
        console.log("Player fetched from database:", player);

        if (!player) {
            console.log("Player not found:", username);
            return res.status(404).json({ success: false, message: "Player not found!" });
        }

        // Calculate the new balance
        const newBalance = player.balance + balance;

        if (newBalance < 0) {
            console.log("Insufficient balance for user:", username);
            return res.status(400).json({ success: false, message: "Insufficient balance!" });
        }

        // Update the player's balance in the database
        await collection.updateOne(
            { username },
            { $set: { balance: newBalance } }
        );
        console.log("Database updated with new balance:", newBalance);

        // Notify the external Minecraft plugin
        let pluginResponse;
        try {
            console.log("Notifying Minecraft plugin...");
            pluginResponse = await axios.post('https://lavalinkrepo.onrender.com/update-balance', {
                username,
                balance: newBalance,
            }, { timeout: 5000 }); // Timeout for external API (5 seconds)
            console.log("Plugin response:", pluginResponse.data);
        } catch (pluginError) {
            console.error("Failed to sync with Minecraft plugin:", pluginError.message);
            return res.status(500).json({
                success: false,
                message: "Balance updated, but failed to sync with Minecraft plugin.",
            });
        }

        // Return success response
        if (pluginResponse.data && pluginResponse.data.success) {
            return res.json({
                success: true,
                message: "Balance updated successfully and synced with Minecraft!",
                balance: newBalance,
            });
        } else {
            console.error("Minecraft plugin returned failure:", pluginResponse.data.message);
            return res.status(500).json({
                success: false,
                message: "Balance updated, but Minecraft plugin failed to confirm.",
            });
        }

    } catch (error) {
        console.error("Server error:", error.message);
        return res.status(500).json({ success: false, message: "Server error! Please try again later." });
    } finally {
        console.log("Closing MongoDB connection.");
        await client.close();
    }
});

// Health Check Endpoint
app.get('/', (req, res) => {
    res.send("API is running successfully!");
});

// Timeout Middleware Handler (for hanging requests)
app.use((req, res, next) => {
    if (req.timedout) {
        console.error("Request timed out");
        return res.status(504).json({ success: false, message: "Request timeout!" });
    }
    next();
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
