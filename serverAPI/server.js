const express = require('express');
const { CharacterAI } = require('node_characterai');

const app = express();
const port = 3000;

// Instantiate CharacterAI
const characterAI = new CharacterAI();

// Authentication (Guest Login)
let chat;

app.use(express.json());

// Route for authenticating and starting a chat
app.post('/start-chat', async (req, res) => {
  try {
    await characterAI.authenticateAsGuest();
    // Place the characterId here (you can change this to any character's ID)
    const characterId = "8_1NyR8w1dOXmI1uWaieQcd147hecbdIK7CeEAIrdJw";
    chat = await characterAI.createOrContinueChat(characterId);
    res.status(200).json({ message: "Chat started successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error starting chat.");
  }
});

// Route for sending messages
app.post('/send-message', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !chat) {
      return res.status(400).send("Message or chat not available.");
    }
    const response = await chat.sendAndAwaitResponse(message, true);
    res.json({ response: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending message.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
