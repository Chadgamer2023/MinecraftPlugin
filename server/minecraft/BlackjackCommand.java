package com.example.blackjack;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class BlackjackCommand implements CommandExecutor {

    private final Main plugin;

    public BlackjackCommand(Main plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("This command can only be used by players.");
            return true;
        }

        Player player = (Player) sender;
        if (args.length < 2 || !args[0].equalsIgnoreCase("start")) {
            player.sendMessage("Usage: /blackjack start [bet]");
            return true;
        }

        try {
            double bet = Double.parseDouble(args[1]);
            EconomyManager economy = new EconomyManager();

            if (!economy.withdraw(player, bet)) {
                player.sendMessage("You don't have enough balance to bet!");
                return true;
            }

            // Simulate a game of Blackjack (simplified for now)
            boolean playerWins = Math.random() > 0.5;

            if (playerWins) {
                double winnings = bet * 2;
                economy.deposit(player, winnings);
                player.sendMessage("Congratulations! You won " + winnings + "!");
            } else {
                player.sendMessage("You lost the game. Better luck next time!");
            }
        } catch (NumberFormatException e) {
            player.sendMessage("Please enter a valid bet amount.");
        }

        return true;
    }
}
