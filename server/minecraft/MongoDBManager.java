package com.example.blackjack;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

public class MongoManager {
    private MongoClient mongoClient;
    private MongoDatabase database;
    private MongoCollection<Document> playerCollection;

    public MongoManager(String host, int port, String dbName) {
        mongoClient = new MongoClient(host, port);
        database = mongoClient.getDatabase(dbName);
        playerCollection = database.getCollection("players");
    }

    public void updateBalance(String uuid, double balance) {
        Document query = new Document("uuid", uuid);
        Document update = new Document("$set", new Document("balance", balance));
        playerCollection.updateOne(query, update);
    }

    public double getBalance(String uuid) {
        Document player = playerCollection.find(new Document("uuid", uuid)).first();
        return player != null ? player.getDouble("balance") : 0.0;
    }
}
