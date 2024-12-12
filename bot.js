const { Client, GatewayIntentBits } = require('discord.js');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB setup
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

// Discord.js client setup
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    await mongoClient.connect();
    db = mongoClient.db('minecraft_blackjack');
    console.log('Connected to MongoDB');
});

// Handle slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'blackjack') {
        const bet = interaction.options.getInteger('bet');
        const discordId = interaction.user.id;

        // Fetch player data
        const playerData = await db.collection('players').findOne({ discordId });
        if (!playerData) {
            return interaction.reply("You are not linked with a Minecraft account. Use `/verify` first.");
        }

        let balance = playerData.balance;

        if (balance < bet) {
            return interaction.reply("You don't have enough balance to place that bet!");
        }

        // Game logic
        const playerWins = Math.random() > 0.5;
        if (playerWins) {
            balance += bet;
            await db.collection('players').updateOne({ discordId }, { $set: { balance } });
            return interaction.reply(`You won! Your new balance is ${balance} coins.`);
        } else {
            balance -= bet;
            await db.collection('players').updateOne({ discordId }, { $set: { balance } });
            return interaction.reply(`You lost! Your new balance is ${balance} coins.`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
