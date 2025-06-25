import UserModel from "../models/UserModel.js";
import userSchema from "../validitions/userSchema.js";
import { sanitizeInput } from "../sanitize/sanitize.js";

// פונקציה שמסירה שדות רגישים מהמשתמש
const sanitizeUserOutput = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll();
    const safeUsers = users.map(sanitizeUserOutput);
    res.json(safeUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(sanitizeUserOutput(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const createUser = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = userSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // בדיקה אם המשתמש כבר קיים
    const existing = await UserModel.findOneBy("email", sanitizedData.email);
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const newUser = await UserModel.create(sanitizedData);
    res.status(201).json(sanitizeUserOutput(newUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = userSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // הוספת updated_at ידנית (בגלל שאין טריגר)
    sanitizedData.updated_at = new Date();

    const updatedUser = await UserModel.update(req.params.id, sanitizedData);
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json(sanitizeUserOutput(updatedUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await UserModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "User not found or already deleted" });
    }

    res.json({ message: "User soft-deleted successfully", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

