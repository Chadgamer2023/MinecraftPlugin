public class LinkCommand implements CommandExecutor {
    private final MongoService mongoService;

    public LinkCommand(MongoService mongoService) {
        this.mongoService = mongoService;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length != 1) {
            sender.sendMessage("Usage: /link <verification_code>");
            return false;
        }

        Player player = (Player) sender;
        String code = args[0];
        String uuid = player.getUniqueId().toString();

        // Verify the code and link the account
        boolean verified = mongoService.verifyCode(code, uuid);
        if (verified) {
            player.sendMessage("Your Discord account has been successfully linked!");
        } else {
            player.sendMessage("Invalid or expired verification code.");
        }

        return true;
    }
}
