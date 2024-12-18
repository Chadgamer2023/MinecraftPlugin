const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const NodeCache = require('node-cache');
const axios = require('axios');
const timeout = require('connect-timeout');

const app = express();
const PORT = process.env.PORT || 25565;

// Cache Setup (5-minute TTL by default)
const playerCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Middleware
app.use(bodyParser.json());
app.use(timeout('60s'));

// MongoDB Setup
const mongoURI = process.env.MONGO_URI;
const client = new MongoClient(mongoURI, { useUnifiedTopology: true });
let database, collection;

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

// Function: Update Cache and Database
async function updateBalance(username, newBalance) {
    try {
        // Update cache first
        playerCache.set(username, { balance: newBalance });

        // Update MongoDB
        await collection.updateOne({ username }, { $set: { balance: newBalance } }, { upsert: true });
        console.log(`Cache and database updated for ${username}: ${newBalance}`);
    } catch (error) {
        console.error("Failed to update balance:", error.message);
        throw error;
    }
}

// API Endpoint: Update Balance
app.post('/update-balance', async (req, res) => {
    const { username, balance } = req.body;

    if (!username || typeof balance !== 'number') {
        return res.status(400).json({ success: false, message: "Invalid input!" });
    }

    try {
        // Fetch current balance from cache or database
        let playerData = playerCache.get(username);

        if (!playerData) {
            playerData = await collection.findOne({ username });
            if (playerData) playerCache.set(username, playerData);
        }

        const currentBalance = playerData ? playerData.balance : 0;
        const newBalance = currentBalance + balance;

        if (newBalance < 0) {
            return res.status(400).json({ success: false, message: "Insufficient balance!" });
        }

        // Update both cache and database
        await updateBalance(username, newBalance);

        // Notify plugin (Retry mechanism)
        let pluginSynced = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const pluginResponse = await axios.post('https://lavalinkrepo.onrender.com/update-balance', {
                    username,
                    balance: newBalance,
                });
                if (pluginResponse.data.success) {
                    pluginSynced = true;
                    break;
                }
            } catch (err) {
                console.error(`Plugin sync failed (attempt ${attempt}):`, err.message);
            }
        }

        if (!pluginSynced) {
            console.warn("Balance updated but failed to notify Minecraft plugin.");
        }

        res.json({
            success: true,
            message: "Balance updated successfully!",
            balance: newBalance,
        });
    } catch (error) {
        console.error("Error updating balance:", error.message);
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

// Health Check Endpoint
app.get('/', (req, res) => {
    res.send("API is running successfully!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
