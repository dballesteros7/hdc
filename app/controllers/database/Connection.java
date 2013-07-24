package controllers.database;

import java.net.UnknownHostException;

import play.Play;

import com.mongodb.DB;
import com.mongodb.MongoClient;

public class Connection {

	// mongo client is already a connection pool
	private static MongoClient mongoClient;
	// database currently in use
	private static String database;

	/**
	 * Open mongo client.
	 */
	private static void openConnection() {
		String host = Play.application().configuration().getString("mongo.host");
		int port = Play.application().configuration().getInt("mongo.port");
		try {
			mongoClient = new MongoClient(host, port);
		} catch (UnknownHostException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	/**
	 * Connects to the main database 'healthbank'.
	 */
	public static void connect() {
		openConnection();
		database = Play.application().configuration().getString("mongo.database");
	}

	/**
	 * Connects to the test database 'test'.
	 */
	public static void connectTest() {
		openConnection();
		database = "test";
	}

	/**
	 * Get a connection to the database in use.
	 */
	public static DB getDB() {
		return mongoClient.getDB(database);
	}

	/**
	 * Closes all connections.
	 */
	public static void close() {
		mongoClient.close();
	}

}
