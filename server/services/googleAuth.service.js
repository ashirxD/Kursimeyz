const { OAuth2Client } = require('google-auth-library');

/**
 * Google Authentication Service
 * Handles verification of Google ID tokens
 */
class GoogleAuthService {
  constructor() {
    // Initialize OAuth2Client with Google Client ID
    // The client ID is used to verify the token's audience
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * Verify Google ID Token
   * @param {string} idToken - The ID token from Google Identity Services
   * @returns {Object} - Decoded token payload containing user info
   * @throws {Error} - If token verification fails
   * 
   * Security: Always verify the token on the backend
   * Never trust user data coming from the frontend
   */
  async verifyToken(idToken) {
    try {
      // Verify the ID token with Google's servers
      // This ensures the token was issued by Google and is valid
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        // Validate that the token's audience matches our Google Client ID
        // This prevents token substitution attacks
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      // Get the payload containing user information
      const payload = ticket.getPayload();

      // Security: Verify the issuer is Google
      if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') {
        throw new Error('Invalid token issuer');
      }

      // Security: Verify the token is not expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTime) {
        throw new Error('Token has expired');
      }

      // Return extracted user information
      return {
        googleId: payload.sub,      // Unique Google user ID
        email: payload.email,        // User's email address
        name: payload.name,          // User's full name
        picture: payload.picture,    // User's profile picture URL
        emailVerified: payload.email_verified, // Whether email is verified by Google
      };
    } catch (error) {
      console.error('Google token verification failed:', error.message);
      throw new Error('Invalid Google token');
    }
  }
}

// Export singleton instance
module.exports = new GoogleAuthService();
