app.post('/update-balance', async (req, res) => {
  const { username, amount } = req.body;

  try {
    await client.connect();
    const database = client.db("PlayersSynced");
    const collection = database.collection("SyncedPlayers");

    const player = await collection.findOne({ username });

    if (player) {
      const newBalance = player.balance + amount;

      if (newBalance < 0) {
        return res.json({ success: false, message: "Insufficient balance!" });
      }

      await collection.updateOne(
        { username },
        { $set: { balance: newBalance } }
      );

      res.json({ success: true, message: "Balance updated successfully!" });
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
