
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserModel from '../models/UserModel.js';
import userSchema from '../validitions/userSchema.js';
import { sanitizeInput } from '../sanitize/sanitize.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const signUp = async (req, res) => {
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

    res.status(201).json({ token, user: { id: newUser.id, role: newUser.role, email: newUser.email } });
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
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, role: user.role, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const logout = (req, res) => {
  // ב־JWT פשוט נמחק את הטוקן בצד הלקוח
  res.json({ message: 'Logged out' });
};
