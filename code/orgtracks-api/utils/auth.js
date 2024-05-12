const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

/**
 * Decodes a Google Sign Intoken and retrieves its payload.
 *
 * @param {string} credential - The token to be decoded.
 * @return {object} The payload of the decoded token.
 */
exports.decodeGoogleToken = async (credential) => {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.OAUTH_CLIENT_ID
    });

    return ticket.getPayload();
}

/**
 * Generates a local token.
 * 
 * @param {object} payload - The payload to be signed.
 * @returns {string} - The generated token.
 */
exports.generateLocalToken = (payload) => {
    // Generate token using the payload and JWT secret with a 1-day expiration
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    return token;
}

/**
 * Decodes a local token using the JWT_SECRET environment variable.
 *
 * @param {string} token - The local token to be decoded.
 * @return {object} The decoded token.
 */
exports.decodeLocalToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
}