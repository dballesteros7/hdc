package registration;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static play.test.Helpers.callAction;
import static play.test.Helpers.fakeApplication;
import static play.test.Helpers.fakeGlobal;
import static play.test.Helpers.fakeRequest;
import static play.test.Helpers.session;
import static play.test.Helpers.start;
import static play.test.Helpers.status;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import play.mvc.Result;
import utils.LoadData;
import utils.TestConnection;

import com.google.common.collect.ImmutableMap;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;

public class RegistrationTest {

	@Before
	public void setUp() {
		start(fakeApplication(fakeGlobal()));
		TestConnection.connectToTest();
		LoadData.load();
	}

	@After
	public void tearDown() {
		TestConnection.close();
	}

	@Test
	public void register() {
		String newEmail = "new@example.com";
		DBCollection users = TestConnection.getCollection("users");
		DBObject query = new BasicDBObject("email", newEmail);
		assertNull(users.findOne(query));
		long oldSize = users.count();
		Result result = callAction(
				controllers.routes.ref.Application.register(),
				fakeRequest().withFormUrlEncodedBody(
						ImmutableMap.of("email", newEmail, "firstName", "First", "lastName", "Last", "password",
								"secret")));
		assertEquals(303, status(result));
		assertEquals(newEmail, session(result).get("email"));
		assertEquals(oldSize + 1, users.count());
	}

	@Test
	public void registerSameEmail() {
		DBCollection users = TestConnection.getCollection("users");
		long oldSize = users.count();
		assertTrue(oldSize > 0);
		String existingEmail = (String) users.findOne().get("email");
		Result result = callAction(
				controllers.routes.ref.Application.register(),
				fakeRequest().withFormUrlEncodedBody(
						ImmutableMap.of("email", existingEmail, "firstName", "First", "lastName", "Last", "password",
								"password")));
		assertEquals(400, status(result));
		assertEquals(oldSize, users.count());
	}

	@Test
	public void registerIncompleteForm() {
		String newEmail = "new@example.com";
		DBCollection users = TestConnection.getCollection("users");
		DBObject query = new BasicDBObject("email", newEmail);
		assertNull(users.findOne(query));
		long oldSize = users.count();
		Result result = callAction(
				controllers.routes.ref.Application.register(),
				fakeRequest().withFormUrlEncodedBody(
						ImmutableMap.of("email", newEmail, "firstName", "First", "lastName", "", "password",
								"secret")));
		assertEquals(400, status(result));
		assertEquals(oldSize, users.count());
	}
}