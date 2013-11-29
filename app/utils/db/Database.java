package utils.db;

import java.net.UnknownHostException;

import play.Play;

import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.MongoClient;

public class Database {

	private static MongoClient mongoClient; // mongo client is already a connection pool
	private static String database; // database currently in use

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
	 * Connects to the production database 'healthdata'.
	 */
	public static void connect() {
		openConnection();
		database = Play.application().configuration().getString("mongo.database");
	}

	/**
	 * Connects to the test database 'test'.
	 */
	public static void connectToTest() {
		openConnection();
		database = "test";
	}

	/**
	 * Closes all connections.
	 */
	public static void close() {
		mongoClient.close();
	}

	/**
	 * Sets up the collections and creates all indices.
	 */
	public static void initialize() {
		// TODO
	}

	/**
	 * Drops the database.
	 */
	public static void destroy() {
		getDB().dropDatabase();
	}

	/**
	 * Get a connection to the database in use.
	 */
	private static DB getDB() {
		return mongoClient.getDB(database);
	}

	/**
	 * Gets the specified collection.
	 */
	public static DBCollection getCollection(String collection) {
		return getDB().getCollection(collection);
	}

}