import mongoose from 'mongoose';

/**
 * Connect to a MongoDB database using the given URI and options
 * @param {string} uri the URI of the MongoDB database to connect to
 * @param {mongoose.ConnectOptions} options options to pass to the MongoDB driver
 * @returns {mongoose.Connection} the connection object (use .close() to close the connection)
 */
function connectToDb(uri, options = {}) {

	mongoose.connect(uri, options);

	const db = mongoose.connection;
	// eslint-disable-next-line no-console
	db.on('error', console.error.bind(console, 'MongoDB connection error'));

	return db;
}

export { connectToDb };