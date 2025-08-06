
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserModel from '../models/UserModel.js';
import userSchema from '../validitions/userSchema.js';
import { sanitizeInput } from '../sanitize/sanitize.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const signUp = async (req, res) => {
   console.log("Incoming request body to /signup:", req.body);
  
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = userSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const existing = await UserModel.findOneBy('email', sanitizedData.email);
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(sanitizedData.password, 10);
    const newUser = await UserModel.create({ ...sanitizedData, password: hashedPassword });
   

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

 res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 * 7, 
  })
  .status(201)
  .json({ user: { id: newUser.id, role: newUser.role, email: newUser.email } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = sanitizeInput(req.body);
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const user = await UserModel.findOneBy('email', email);
    if (!user)return res.status(401).json({ message: "Email or password is incorrect" });


    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) return res.status(401).json({ message: "Email or password is incorrect" });



    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  
     res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 * 7, 
  })
  .json({ user: { id: user.id, role: user.role, email: user.email } });

  } catch (err) {
    console.error(err);
    console.log(err);
    
    res.status(500).json({ error: 'Server error' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out' });
};
// ב־AuthController שלך
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
    res.status(401).json({ error: "Unauthorized" });
  }
};

