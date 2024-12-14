const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Store player balances and sync codes (in-memory or replace with MongoDB)
let playerBalances = {};
let pendingSyncs = {}; // Store the pending 6-digit sync codes

// Endpoint to receive balance and code from Minecraft plugin
app.post('/sync-balance', (req, res) => {
    const { playerName, balance, code } = req.body;

    // Store the player's balance and sync code
    playerBalances[playerName] = balance;
    pendingSyncs[code] = playerName;

    console.log(`Balance for ${playerName} synced with code: ${code}`);
    res.json({ success: true, playerName, balance, code });
});

// Endpoint to handle the /sync command in Discord
app.post('/sync-command', (req, res) => {
    const { playerName, code } = req.body;

    // Check if the code exists in pendingSyncs
    if (pendingSyncs[code] === playerName) {
        const balance = playerBalances[playerName];
        res.json({
            success: true,
            message: `Balance synced for ${playerName}: ${balance}`,
            balance: balance,
        });

        // Remove the code after syncing
        delete pendingSyncs[code];
    } else {
        res.json({ success: false, message: 'Invalid or expired code.' });
    }
});

app.listen(port, () => {
    console.log(`Discord bot API running at http://localhost:${port}`);
});
