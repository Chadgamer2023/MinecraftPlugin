const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const timeout = require('connect-timeout');

const app = express();
const PORT = process.env.PORT || 25565;

// Middleware
app.use(bodyParser.json());
app.use(timeout('60s')); // Set timeout for requests (60 seconds)

// MongoDB connection setup
const mongoURI = process.env.MONGO_URI;
const client = new MongoClient(mongoURI, { useUnifiedTopology: true });
let database, collection;

// Initialize MongoDB connection once
async function initializeDB() {
    try {
        await client.connect();
        database = client.db("PlayersSynced");
        collection = database.collection("SyncedPlayers");
        console.log("MongoDB connected.");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
}
initializeDB();

// API Endpoint: Update Balance
app.post('/update-balance', async (req, res) => {
    const { username, balance } = req.body;

    console.log("Request to update balance:", { username, balance });

    if (!username || typeof balance !== 'number') {
        return res.status(400).json({ success: false, message: "Invalid input!" });
    }

    try {
        // Fetch player balance
        const player = await collection.findOne({ username });

        if (!player) {
            return res.status(404).json({ success: false, message: "Player not found!" });
        }

        // Calculate new balance
        const newBalance = player.balance + balance;
        if (newBalance < 0) {
            return res.status(400).json({ success: false, message: "Insufficient balance!" });
        }

        // Update balance in the database
        await collection.updateOne({ username }, { $set: { balance: newBalance } });

        console.log("Database updated with new balance:", newBalance);

        // Retry mechanism for plugin sync
        let syncSuccess = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const pluginResponse = await axios.post(
                    'https://lavalinkrepo.onrender.com/update-balance',
                    { username, balance: newBalance },
                    { timeout: 10000 }
                );
                if (pluginResponse.data.success) {
                    syncSuccess = true;
                    break;
                }
            } catch (err) {
                console.error(`Plugin sync failed (attempt ${attempt}):`, err.message);
            }
        }

        if (!syncSuccess) {
            return res.status(500).json({
                success: false,
                message: "Balance updated, but failed to sync with Minecraft plugin after retries.",
            });
        }

        return res.json({
            success: true,
            message: "Balance updated and synced successfully!",
            balance: newBalance,
        });

    } catch (error) {
        console.error("Error updating balance:", error.message);
        return res.status(500).json({ success: false, message: "Server error!" });
    }
});

// Health Check Endpoint
app.get('/', (req, res) => {
    res.send("API is running successfully!");
});

// Timeout Middleware Handler
app.use((req, res, next) => {
    if (req.timedout) {
        return res.status(504).json({ success: false, message: "Request timeout!" });
    }
    next();
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
