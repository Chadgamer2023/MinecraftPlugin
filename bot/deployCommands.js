const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Play a game of Blackjack!')
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('The amount to bet')
                .setRequired(true)
        )
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Refreshing application commands...');

        // Replace 'your-client-id' and 'your-guild-id' with your bot's and server's IDs
        await rest.put(
            Routes.applicationGuildCommands('your-client-id', 'your-guild-id'),
            { body: commands },
        );

        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error(error);
    }
})();
