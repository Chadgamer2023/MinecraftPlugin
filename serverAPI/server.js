const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/play-blackjack', (req, res) => {
    const { playerName, betAmount } = req.body;
    const playerWon = Math.random() > 0.5; // Random win/loss for testing
    res.json({
        playerWon: playerWon,
        amountWon: playerWon ? betAmount * 2 : 0
    });
});

app.listen(port, () => {
    console.log(`Discord Bot API running at http://localhost:${port}`);
});
