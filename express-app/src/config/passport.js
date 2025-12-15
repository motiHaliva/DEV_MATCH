import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserModel from '../models/UserModel.js';

const GOOGLE_CLIENT_ID = process. env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process. env.GOOGLE_CALLBACK_URL || 'https://dev-match-oqi4.vercel.app/auth/google/callback';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️ Google OAuth credentials not configured');
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const firstname = profile.name.givenName || profile.displayName;
        const lastname = profile.name.familyName || '';
        const profile_image = profile.photos[0]?.value || null;

        // ✅ חפש משתמש קיים לפי אימייל
        let user = await UserModel.findOneBy('email', email);

        if (user) {
          // ✅ משתמש קיים - עדכן google_id אם חסר
          if (!user.google_id) {
            await UserModel.update(user.id, { google_id: googleId });
            user. google_id = googleId;
          }
          
          console.log('✅ Existing user logged in via Google:', user. email);
          return done(null, user);
        }

        // ❌ משתמש לא קיים - דחה
        console.log('❌ User not found for email:', email);
        return done(null, false, { 
          message: 'No account found.  Please sign up first with email and password.' 
        });

      } catch (error) {
        console.error('❌ Google OAuth error:', error);
        return done(error, false);
      }
    }
  )
);

// Serialize/Deserialize (לא ממש צריך עם JWT, אבל passport דורש)
passport.serializeUser((user, done) => {
  done(null, user. id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel. findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;