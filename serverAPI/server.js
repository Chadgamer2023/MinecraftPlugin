const express = require('express');
const { CharacterAI } = require('node_characterai');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const characterAI = new CharacterAI();

let chat;

app.use(express.json());

// Start chat route
app.post('/start-chat', async (req, res) => {
  try {
    await characterAI.authenticateAsGuest();
    const characterId = "qMMaeEDIZiqfxzvY7jMawOoHP27L2x1PdAZpcivnH2Y"; // Replace with the desired character ID
    chat = await characterAI.createOrContinueChat(characterId);
    res.status(200).json({ message: "Chat started successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error starting chat.");
  }
});

// Send message and handle image generation
app.post('/send-message', async (req, res) => {
  try {
    const { message, imageUrl, imagePath } = req.body;

    // If the user wants to generate an image
    if (message.includes("generate")) {
      const generatedImage = await chat.generateImage("dolphins swimming in green water");
      res.json({ response: "Here is an image: " + generatedImage });
    }
    // If the user wants to upload an image via URL
    else if (imageUrl) {
      const response = await chat.uploadImage(imageUrl);
      res.json({ response: "Image uploaded successfully." });
    }
    // If the user uploads a local image (assuming imagePath is a local file)
    else if (imagePath) {
      const imageBuffer = fs.readFileSync(imagePath);
      const response = await chat.uploadImage(imageBuffer);
      res.json({ response: "Image uploaded successfully." });
    }
    // If the message is simple text
    else {
      const response = await chat.sendAndAwaitResponse(message, true);
      res.json({ response: response.text });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending message.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
