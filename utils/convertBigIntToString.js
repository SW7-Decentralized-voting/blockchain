/**
 * Converts BigInt to string for JSON serialization
 * @param {BigInt|Array|Object} obj Object to convert to string (if BigInt)
 * @returns {String|Array|Object} Object with BigInts converted to strings
 */
function convertBigIntToString(obj) {
    if (typeof obj === 'bigint') {
        return obj.toString();
    } else if (Array.isArray(obj)) {
        return obj.map(convertBigIntToString);
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, convertBigIntToString(value)])
        );
    } else {
        return obj;
    }
}

export default convertBigIntToString;