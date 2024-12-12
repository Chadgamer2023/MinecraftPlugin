module.exports = {
  apps: [
    {
      name: "api-server",   // Name for the API server process
      script: "./server.js", // Path to your API server file
      instances: 1,         // Run one instance
      autorestart: true,    // Restart if it crashes
      watch: false,         // Disable watching files (not necessary for Render)
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "discord-bot",   // Name for the Discord bot process
      script: "./bot.js",     // Path to your Discord bot file
      instances: 1,           // Run one instance
      autorestart: true,      // Restart if it crashes
      watch: false,           // Disable watching files (not necessary for Render)
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
