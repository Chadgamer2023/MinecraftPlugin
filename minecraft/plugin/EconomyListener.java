@EventHandler
public void onPlayerBalanceChange(BalanceChangeEvent event) {
    Player player = event.getPlayer();
    double newBalance = event.getNewBalance();

    // Make an API call to sync balance with Discord
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("http://localhost:3000/syncBalance"))
        .POST(HttpRequest.BodyPublishers.ofString(
            "{\"uuid\":\"" + player.getUniqueId() + "\",\"balance\":" + newBalance + "}"
        ))
        .header("Content-Type", "application/json")
        .build();
    HttpClient.newHttpClient().sendAsync(request, HttpResponse.BodyHandlers.discarding());
}
