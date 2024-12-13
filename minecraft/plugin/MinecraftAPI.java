public class MinecraftAPI {
    private final String apiUrl = "http://localhost:3000";

    public void updateBalance(String uuid, double balance) {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(apiUrl + "/updateBalance"))
            .POST(HttpRequest.BodyPublishers.ofString(
                "{\"uuid\":\"" + uuid + "\",\"balance\":" + balance + "}"
            ))
            .header("Content-Type", "application/json")
            .build();
        HttpClient.newHttpClient().sendAsync(request, HttpResponse.BodyHandlers.discarding());
    }
}
