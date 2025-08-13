import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserModel from '../models/UserModel.js';
import userSchema from '../validitions/userSchema.js';
import { sanitizeInput } from '../sanitize/sanitize.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const getCookieOptions = (req) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const userAgent = req?.headers?.['user-agent'] || '';
  const isIOS = /iP(hone|od|ad)/.test(userAgent) || /Safari/.test(userAgent);

  console.log("🍪 User Agent:", userAgent);
  console.log("📱 isIOS:", isIOS, "🌍 isProduction:", isProduction);

  // אם זה iOS או Safari, נסה גישה שונה
  if (isIOS) {
    console.log("⚠️ Detected iOS/Safari - adjusting cookie settings");
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
      // נוסיף domain אם בפרודקשן
      ...(isProduction && process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN })
    };
  }

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/'
  };
};

export const signUp = async (req, res) => {
  console.log("📥 Incoming request body to /signup:", req.body);

  try {
    const sanitizedData = sanitizeInput(req.body);
    console.log("🧼 Sanitized data:", sanitizedData);

    const { error } = userSchema.validate(sanitizedData);
    if (error) {
      console.log("❌ Validation error:", error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const existing = await UserModel.findOneBy('email', sanitizedData.email);
    console.log("🔍 Existing user:", existing);

    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(sanitizedData.password, 10);
    console.log("🔑 Hashed password generated");

    const newUser = await UserModel.create({ ...sanitizedData, password: hashedPassword });
    console.log("✅ New user created:", newUser);

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const cookieOptions = getCookieOptions(req); // העבר את req!
    console.log("🍪 Setting cookie with options:", cookieOptions);

    res
      .cookie('token', token, cookieOptions)
      .status(201)
      .json({ 
        user: { 
          id: newUser.id, 
          role: newUser.role, 
          email: newUser.email 
        },
        token: token, // שלח גם בגוף התגובה כגיבוי
        success: true,
        debug: {
          userAgent: req.headers['user-agent'],
          cookieOptions
        }
      });

  } catch (err) {
    console.error("❌ Signup error caught:", err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = sanitizeInput(req.body);
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const user = await UserModel.findOneBy('email', email);
    if (!user) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const cookieOptions = getCookieOptions(req); // העבר את req!
    console.log("🍪 Login - Setting cookie with options:", cookieOptions);

    res
      .cookie('token', token, cookieOptions)
      .json({ 
        user: { 
          id: user.id, 
          role: user.role, 
          email: user.email 
        },
        token: token, // שלח גם בגוף התגובה כגיבוי
        success: true,
        debug: {
          userAgent: req.headers['user-agent'],
          cookieOptions
        }
      });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const logout = (req, res) => {
  const cookieOptions = getCookieOptions(req);
  delete cookieOptions.maxAge;
  
  res.clearCookie('token', cookieOptions);
  res.json({ message: 'Logged out', success: true });
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const { password, ...safeUser } = user;
    res.json({ user: safeUser });
    
  } catch (err) {
    console.error("❌ getCurrentUser error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};