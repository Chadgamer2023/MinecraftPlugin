const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB connection URI (replace with your own connection string)
const mongoURI = process.env.MONGO_URI;
const client = new MongoClient(mongoURI);

// API Endpoint
app.post('/update-balance', async (req, res) => {
    const { username, amount } = req.body;

    if (!username || typeof amount !== 'number') {
        return res.status(400).json({ success: false, message: "Invalid input data!" });
    }

    try {
        await client.connect();
        const database = client.db("PlayersSynced");
        const collection = database.collection("SyncedPlayers");

        // Find the player by username
        const player = await collection.findOne({ username });

        if (player) {
            const newBalance = player.balance + amount;

            if (newBalance < 0) {
                return res.status(400).json({ success: false, message: "Insufficient balance!" });
            }

            // Update the player's balance
            await collection.updateOne(
                { username },
                { $set: { balance: newBalance } }
            );

            res.json({ success: true, message: "Balance updated successfully!", balance: newBalance });
        } else {
            res.status(404).json({ success: false, message: "Player not found!" });
        }
    } catch (error) {
        console.error("Error updating balance:", error);
        res.status(500).json({ success: false, message: "Server error!" });
    } finally {
        await client.close();
    }
});

// Health Check Endpoint
app.get('/', (req, res) => {
    res.send("API is running successfully!");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
