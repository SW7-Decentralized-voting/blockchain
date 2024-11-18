/**
 * Closes the connection when not in watch mode
 * @param {object} root0 The object passed to the function as an argument
 * @param {boolean} root0.watch Boolean to determine if the test is in watch mode
 * @param {boolean} root0.watchAll Boolean to determine if the test is in watch all mode
 * @returns {Promise<void>}
 */
export default async function ({ watch, watchAll } = {}) {
	if (!watch && !watchAll) {
		await global.__MONGOD__.stop();
	}
}