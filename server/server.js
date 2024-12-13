const express = require('express');
const app = express();
app.use(express.json());

app.post('/updateBalance', (req, res) => {
    const { uuid, balance } = req.body;

    // Update MongoDB with the new balance
    db.collection('players').updateOne({ minecraftUuid: uuid }, { $set: { balance } });

    res.send('Balance updated.');
});

app.post('/syncBalance', async (req, res) => {
    const { uuid, balance } = req.body;

    // Find the player in MongoDB and update their balance
    const player = await db.collection('players').findOne({ minecraftUuid: uuid });
    if (player) {
        await db.collection('players').updateOne({ minecraftUuid: uuid }, { $set: { balance } });
    }

    res.send('Balance synced.');
});

app.listen(3000, () => console.log('API running on port 3000'));
