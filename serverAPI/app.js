const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;  // You can change this to any port you prefer

// MongoDB connection URI
const uri = process.env.MONGO_URI; // Replace with your MongoDB URI
const client = new MongoClient(uri);

app.use(bodyParser.json());  // To parse JSON bodies

// Endpoint to check the player's balance
app.post('/check-balance', async (req, res) => {
    const { username, amount } = req.body;

    try {
        await client.connect();
        const database = client.db("PlayersSynced");
        const collection = database.collection("SyncedPlayers");

        // Find the player by username
        const player = await collection.findOne({ username });

        if (player) {
            const balance = player.balance;

            if (balance >= amount) {
                res.json({ success: true, message: "Player has enough balance!" });
            } else {
                res.json({ success: false, message: "Insufficient balance!" });
            }
        } else {
            res.status(404).json({ success: false, message: "Player not found!" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error!" });
    } finally {
        await client.close();
    }
});


// Endpoint to deduct balance (after the game action)
app.post('/deduct-balance', async (req, res) => {
    const { username, amount } = req.body;

    try {
        await client.connect();
        const database = client.db("PlayersSynced");
        const collection = database.collection("SyncedPlayers");

        const player = await collection.findOne({ username });

        if (player) {
            const balance = player.balance;

            if (balance >= amount) {
                // Deduct the balance
                await collection.updateOne(
                    { username },
                    { $inc: { balance: -amount } }
                );

                res.json({ success: true, message: "Balance deducted successfully!" });
            } else {
                res.json({ success: false, message: "Insufficient balance!" });
            }
        } else {
            res.status(404).json({ success: false, message: "Player not found!" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error!" });
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
