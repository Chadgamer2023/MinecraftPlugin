require('dotenv').config(); // Load environment variables from .env
const { Client, GatewayIntentBits } = require('discord.js');
const { MongoClient } = require('mongodb');

// Read token and MongoDB URI from environment variables
const botToken = process.env.DISCORD_BOT_TOKEN;
const mongoUri = process.env.MONGO_URI;

if (!botToken || !mongoUri) {
    console.error('Error: Missing environment variables. Please set DISCORD_BOT_TOKEN and MONGO_URI in the .env file.');
    process.exit(1);
}

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const mongoClient = new MongoClient(mongoUri);

bot.on('ready', () => {
    console.log(`${bot.user.tag} is online!`);
});

bot.on('messageCreate', async (message) => {
    if (message.content.startsWith('/link')) {
        const args = message.content.split(' ');
        if (args.length !== 2) {
            message.reply('Usage: /link <code>');
            return;
        }

        const code = args[1];
        try {
            await mongoClient.connect();
            const db = mongoClient.db('PlayersSynced');
            const collection = db.collection('SyncedPlayers');

            const user = await collection.findOne({ code: code });

            if (user) {
                await collection.updateOne({ code: code }, { $set: { discordId: message.author.id } });
                message.reply(`Success! Your Discord account has been linked to Minecraft username: ${user.username}`);
            } else {
                message.reply('Invalid code. Please make sure you typed it correctly.');
            }
        } catch (error) {
            console.error(error);
            message.reply('An error occurred while linking your account.');
        } finally {
            await mongoClient.close();
        }
    }
});

bot.login(botToken);
