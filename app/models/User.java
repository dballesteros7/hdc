package models;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.Set;

import org.bson.types.ObjectId;
import org.elasticsearch.ElasticSearchException;

import utils.Connection;
import utils.ModelConversion;
import utils.PasswordHash;
import utils.search.TextSearch;
import utils.search.TextSearch.Type;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.WriteResult;

public class User extends Model implements Comparable<User> {

	private static final String collection = "users";

	public String email; // must be unique
	public String name;
	public String password;
	public BasicDBObject visible; // records that are shared with this user (grouped by owner)
	public BasicDBList apps; // installed apps
	public BasicDBList visualizations; // installed visualizations

	@Override
	public int compareTo(User o) {
		return this.name.compareTo(o.name);
	}

	@Override
	public String toString() {
		return name;
	}

	public static String getCollection() {
		return collection;
	}

	public static ObjectId getId(String email) {
		DBObject query = new BasicDBObject("email", email);
		DBObject projection = new BasicDBObject("_id", 1);
		return (ObjectId) Connection.getCollection(collection).findOne(query, projection).get("_id");
	}

	public static String getName(ObjectId userId) {
		DBObject query = new BasicDBObject("_id", userId);
		DBObject projection = new BasicDBObject("name", 1);
		return (String) Connection.getCollection(collection).findOne(query, projection).get("name");
	}

	public static Map<ObjectId, Set<ObjectId>> getVisibleRecords(ObjectId userId) {
		Map<ObjectId, Set<ObjectId>> visibleRecords = new HashMap<ObjectId, Set<ObjectId>>();
		DBObject query = new BasicDBObject("_id", userId);
		DBObject projection = new BasicDBObject("visible", 1);
		BasicDBObject visible = (BasicDBObject) Connection.getCollection(collection).findOne(query, projection)
				.get("visible");
		for (String sharingUserId : visible.keySet()) {
			Set<ObjectId> recordIds = new HashSet<ObjectId>();
			BasicDBList sharedRecords = (BasicDBList) visible.get(sharingUserId);
			ListIterator<Object> iterator = sharedRecords.listIterator();
			while (iterator.hasNext()) {
				recordIds.add((ObjectId) iterator.next());
			}
			visibleRecords.put(new ObjectId(sharingUserId), recordIds);
		}
		return visibleRecords;
	}

	public static User find(ObjectId userId) throws IllegalArgumentException, IllegalAccessException,
			InstantiationException {
		DBObject query = new BasicDBObject("_id", userId);
		DBObject result = Connection.getCollection(collection).findOne(query);
		return ModelConversion.mapToModel(User.class, result.toMap());
	}

	public static List<User> findAll(int limit) throws IllegalArgumentException, IllegalAccessException,
			InstantiationException {
		List<User> userList = new ArrayList<User>();
		DBObject query = new BasicDBObject();
		DBCursor result = Connection.getCollection(collection).find(query).limit(limit);
		while (result.hasNext()) {
			userList.add(ModelConversion.mapToModel(User.class, result.next().toMap()));
		}
		Collections.sort(userList);
		return userList;
	}

	public static boolean authenticationValid(String email, String password) throws IllegalArgumentException,
			IllegalAccessException, InstantiationException, NoSuchAlgorithmException, InvalidKeySpecException {
		if (!userExists(email)) {
			return false;
		}
		String storedPassword = getPassword(email);
		return PasswordHash.validatePassword(password, storedPassword);
	}

	public static String add(User newUser) throws IllegalArgumentException, IllegalAccessException,
			NoSuchAlgorithmException, InvalidKeySpecException, InstantiationException, ElasticSearchException,
			IOException {
		if (userExists(newUser.email)) {
			return "A user with this email address already exists.";
		}
		newUser.password = PasswordHash.createHash(newUser.password);
		newUser.visible = new BasicDBObject();
		newUser.apps = new BasicDBList();
		newUser.visualizations = new BasicDBList();
		ObjectId defaultVisualizationId = Visualization.getId(Visualization.getDefaultVisualization());
		newUser.visualizations.add(defaultVisualizationId);
		DBObject insert = new BasicDBObject(ModelConversion.modelToMap(newUser));
		WriteResult result = Connection.getCollection(collection).insert(insert);
		newUser._id = (ObjectId) insert.get("_id");
		String errorMessage = result.getLastError().getErrorMessage();
		if (errorMessage != null) {
			return errorMessage;
		}

		// add to search index (concatenate email and name)
		TextSearch.addPublic(Type.USER, newUser._id, newUser.email + " " + newUser.name);
		return null;
	}

	public static String remove(ObjectId userId) {
		if (!userExists(userId)) {
			return "No user with this id exists.";
		}

		// remove from search index
		TextSearch.deletePublic(Type.USER, userId);

		// TODO remove all the user's messages, records, spaces, circles, apps (if published, ask whether to leave it in
		// the marketplace), ...
		DBObject query = new BasicDBObject("_id", userId);
		WriteResult result = Connection.getCollection(collection).remove(query);
		return result.getLastError().getErrorMessage();
	}

	private static boolean userExists(ObjectId userId) {
		DBObject query = new BasicDBObject("_id", userId);
		return (Connection.getCollection(collection).findOne(query) != null);
	}

	public static boolean userExists(String email) {
		DBObject query = new BasicDBObject("email", email);
		return (Connection.getCollection(collection).findOne(query) != null);
	}

	private static String getPassword(String email) {
		DBObject query = new BasicDBObject("email", email);
		DBObject projection = new BasicDBObject("password", 1);
		return (String) Connection.getCollection(collection).findOne(query, projection).get("password");
	}

	public static boolean isPerson(ObjectId userId) {
		// TODO security check before casting to person?
		// requirement for record owners?
		return true;
	}

	// Visualization methods
	public static boolean hasVisualization(ObjectId userId, ObjectId visualizationId) {
		DBObject query = new BasicDBObject("_id", userId);
		query.put("visualizations", visualizationId);
		DBObject projection = new BasicDBObject("_id", 1);
		return Connection.getCollection(collection).findOne(query, projection) != null;
	}

	public static Set<ObjectId> getVisualizations(ObjectId userId) {
		Set<ObjectId> installedVisualizationIds = new HashSet<ObjectId>();
		DBObject query = new BasicDBObject("_id", userId);
		DBObject projection = new BasicDBObject("visualizations", 1);
		DBObject result = Connection.getCollection(collection).findOne(query, projection);
		if (result != null) {
			BasicDBList visualizationIds = (BasicDBList) result.get("visualizations");
			for (Object visualizationId : visualizationIds) {
				installedVisualizationIds.add((ObjectId) visualizationId);
			}
		}
		return installedVisualizationIds;
	}

	public static List<Visualization> findVisualizations(ObjectId userId) throws IllegalArgumentException,
			IllegalAccessException, InstantiationException {
		Set<ObjectId> installedVisualizationIds = getVisualizations(userId);
		List<Visualization> installedVisualizations = new ArrayList<Visualization>();
		for (ObjectId visualizationId : installedVisualizationIds) {
			installedVisualizations.add(Visualization.find(visualizationId));
		}
		return installedVisualizations;
	}

	public static String addVisualization(ObjectId userId, ObjectId visualizationId) {
		DBObject query = new BasicDBObject("_id", userId);
		DBObject update = new BasicDBObject("$addToSet", new BasicDBObject("visualizations", visualizationId));
		WriteResult result = Connection.getCollection(collection).update(query, update);
		return result.getLastError().getErrorMessage();
	}

	public static String removeVisualization(ObjectId userId, ObjectId visualizationId) {
		DBObject query = new BasicDBObject("_id", userId);
		DBObject update = new BasicDBObject("$pull", new BasicDBObject("visualizations", visualizationId));
		WriteResult result = Connection.getCollection(collection).update(query, update);
		return result.getLastError().getErrorMessage();
	}

}
