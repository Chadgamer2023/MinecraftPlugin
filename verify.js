client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'verify') {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const discordId = interaction.user.id;

        // Store verification code in the database
        await db.collection('verifications').insertOne({ discordId, code, linked: false });

        await interaction.reply(`Your verification code is \`${code}\`. Enter this code in Minecraft using /link <code>.`);
    }
});
