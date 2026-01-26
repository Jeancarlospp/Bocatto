import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Google OAuth 2.0 Strategy Configuration
 * Only for CLIENT authentication (not admins)
 */
const configurePassport = () => {
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({ id: id });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Only configure Google OAuth if credentials are provided
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('⚠️  Google OAuth no configurado (faltan GOOGLE_CLIENT_ID y/o GOOGLE_CLIENT_SECRET)');
    return;
  }

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user info from Google profile
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'Usuario';
          const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || 'Google';
          const profilePicture = profile.photos?.[0]?.value;

          if (!email) {
            return done(new Error('No se pudo obtener el email de Google'), null);
          }

          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: googleId });

          if (user) {
            // User exists with Google ID - update last login
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }

          // Check if user exists with same email (registered traditionally)
          user = await User.findOne({ email: email });

          if (user) {
            // User registered with email/password - link Google account
            // Only allow linking for clients, not admins
            if (user.role === 'admin') {
              return done(new Error('Los administradores no pueden usar Google OAuth. Use credenciales de administrador.'), null);
            }

            // Link Google account to existing user
            user.googleId = googleId;
            user.lastLogin = new Date();
            if (profilePicture && !user.profilePicture) {
              user.profilePicture = profilePicture;
            }
            await user.save();
            return done(null, user);
          }

          // Create new user with Google OAuth
          const newUser = await User.create({
            googleId: googleId,
            email: email,
            firstName: firstName,
            lastName: lastName,
            role: 'client', // Always client for OAuth
            isActive: true,
            loyaltyPoints: 0,
            profilePicture: profilePicture,
            lastLogin: new Date()
          });

          return done(null, newUser);

        } catch (error) {
          console.error('Google OAuth Error:', error);
          return done(error, null);
        }
      }
    )
  );
};

export default configurePassport;
