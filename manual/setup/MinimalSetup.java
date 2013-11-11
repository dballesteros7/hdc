package setup;

import static play.test.Helpers.fakeApplication;
import static play.test.Helpers.fakeGlobal;
import static play.test.Helpers.start;
import models.User;
import models.Visualization;

import org.apache.commons.lang3.RandomStringUtils;
import org.bson.types.ObjectId;

import utils.Connection;
import utils.search.TextSearch;

/**
 * Minimal setup that is necessary to start a fresh Healthbank platform.
 */
public class MinimalSetup {

	public static void main(String[] args) throws Exception {
		System.out.println("Starting to create minimal setup for Healthbank platform.");

		// connecting
		System.out.print("Connecting to MongoDB...");
		start(fakeApplication(fakeGlobal()));
		Connection.connect();
		System.out.println("done.");
		System.out.print("Connecting to ElasticSearch...");
		TextSearch.connect();
		System.out.println("done.");

		// initializing
		System.out.print("Setting up MongoDB...");
		Connection.initialize();
		System.out.println("done.");
		System.out.print("Setting up ElasticSearch...");
		TextSearch.initialize();
		System.out.println("done.");

		// create developer id (used as a creator of the default visualization)
		ObjectId developerId = new ObjectId();

		// create default visualization
		System.out.print("Creating default visualization: \"" + Visualization.getDefaultVisualization()
				+ "\" in MongoDB...");
		Visualization recordList = new Visualization();
		recordList.creator = developerId;
		recordList.name = Visualization.getDefaultVisualization();
		recordList.description = "Default record list implementation. "
				+ "Lists your records and lets you choose for a particular record: "
				+ "(1) In which spaces it is shown, and (2) which circles it is shared with.";
		recordList.url = controllers.visualizations.routes.RecordList.load().url();
		String errorMessage = Visualization.add(recordList);
		if (errorMessage != null) {
			System.out.println("error.\n" + errorMessage + "\nAborting...");
			System.exit(1);
		}
		System.out.println("done.");

		// create developer account
		// developer account currently has record list visualization installed
		// TODO developer account is different from user account (cannot have spaces, records and circles)
		System.out.print("Creating Healthbank developer account...");
		User developer = new User();
		developer._id = developerId;
		developer.email = "developers@healthbank.ch";
		developer.name = "Healthbank Developers";
		developer.password = RandomStringUtils.randomAlphanumeric(20);
		errorMessage = User.add(developer);
		if (errorMessage != null) {
			System.out.println("error.\n" + errorMessage + "\nAborting...");
			System.exit(1);
		}
		System.out.println("done.");

		System.out.println("Shutting down...");
		Connection.close();
		TextSearch.close();
		System.out.println("Minimal setup complete.");
	}

}
