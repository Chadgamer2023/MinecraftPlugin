package com.example.blackjack;

import org.bukkit.plugin.java.JavaPlugin;

public class Main extends JavaPlugin {

    @Override
    public void onEnable() {
        // Initialize dependencies
        getLogger().info("Blackjack plugin enabled!");
        this.saveDefaultConfig();
        
        // Register commands
        this.getCommand("blackjack").setExecutor(new BlackjackCommand(this));
        
        // Register PlaceholderAPI if present
        if (getServer().getPluginManager().isPluginEnabled("PlaceholderAPI")) {
            new BlackjackPlaceholderExpansion(this).register();
        }
    }

    @Override
    public void onDisable() {
        getLogger().info("Blackjack plugin disabled!");
    }
}
