import * as m from 'mongoose';

let connection, db;

/**
 * Connect to the MongoDB database using the URI defined in the global object
 * @returns {m.Mongoose} the database object
 * @throws an error if the connection fails
 */
export default async function connectDb() {
  connection =
		connection ||
		await m.connect(
			global.__MONGO_URI__
		);
  //db = db || connection.db(global.__MONGO_DB_NAME__)
  db = db || connection.connection.db; // Assign the database object

  return db; // Return the database object
}
