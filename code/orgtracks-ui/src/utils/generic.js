/**
 * Converts an array of bytes to a Base64 encoded string.
 *
 * @param {Array} arr - The array of bytes to be converted.
 * @return {string} The Base64 encoded string.
 */
export function toBase64(arr) {
  return btoa(arr.reduce((data, byte) => data + String.fromCharCode(byte), ""));
}

/**
 * Converts an array to a base64-encoded image source.
 *
 * @param {Array} arr - The array to convert.
 * @return {string} The base64-encoded image source.
 */
export function toBase64Src(arr) {
  return `data:image/png;base64,${toBase64(arr)}`;
}
