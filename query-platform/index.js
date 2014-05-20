var queryEngine = require('./query-engine.js');

// Import the visualization endpoint modules
// e.g. var fitbit = require('./endpoints/fitbit.js')
var fitbit = require('./endpoints/fitbit.js');

// Add the endpoints provided by the visualization modules
// e.g. fitbit.attach(queryEngine.app)
fitbit.attach(queryEngine.app);

// Start the server
queryEngine.start();
