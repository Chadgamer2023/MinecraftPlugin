package com.example.currencyconnect;

import org.bukkit.ChatColor;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

public class CurrencyConnect extends JavaPlugin implements Listener {

    // Store the authentication codes
    private final Map<String, Integer> authCodes = new HashMap<>();
    private final Random random = new Random();

    @Override
    public void onEnable() {
        getLogger().info("CurrencyConnect has been enabled!");
        getServer().getPluginManager().registerEvents(this, this);
    }

    @Override
    public void onDisable() {
        getLogger().info("CurrencyConnect has been disabled!");
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        String playerName = event.getPlayer().getName();

        // Generate a unique 6-digit authentication code
        int authCode = generateUniqueAuthCode(playerName);

        // Send the code to the player
        event.getPlayer().sendMessage(ChatColor.GREEN + "Welcome to the server, " + playerName + "!");
        event.getPlayer().sendMessage(ChatColor.YELLOW + "Your authentication code is: " + ChatColor.AQUA + authCode);
        event.getPlayer().sendMessage(ChatColor.GRAY + "Use this code to link your account on Discord.");
    }

    /**
     * Generates a unique 6-digit authentication code for a player.
     *
     * @param playerName the player's name
     * @return the unique code
     */
    private int generateUniqueAuthCode(String playerName) {
        // Generate a random 6-digit code
        int code = 100000 + random.nextInt(900000);

        // Ensure the code is unique for the player
        while (authCodes.containsValue(code)) {
            code = 100000 + random.nextInt(900000);
        }

        // Store the code associated with the player's name
        authCodes.put(playerName, code);
        return code;
    }

    /**
     * Optional: Method to retrieve a player's auth code if needed.
     *
     * @param playerName the player's name
     * @return the stored code, or -1 if not found
     */
    public int getAuthCode(String playerName) {
        return authCodes.getOrDefault(playerName, -1);
    }
}
