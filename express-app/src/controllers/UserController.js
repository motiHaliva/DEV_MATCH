import UserModel from "../models/UserModel.js";
import userSchema from "../validitions/userSchema.js";
import { sanitizeInput } from "../sanitize/sanitize.js";
import BaseModel from "../models/BaseModel.js";

const sanitizeUserOutput = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};



export const getAllUsers = async (req, res) => {
  try {
    const { search, role, limit = 10, page = 1 } = req.query;

    let where = 'deleted_at IS NULL';
    const values = [];

    if (search) {
      where += ` AND (firstname ILIKE $${values.length + 1} OR lastname ILIKE $${values.length + 1} OR email ILIKE $${values.length + 1})`;
      values.push(`%${search}%`);
    }
    if (role) {
      where += ` AND role::text = $${values.length + 1}`;
      values.push(role);
    }

    const result = await BaseModel.paginate('users', where, values, page, limit, 'id');
    result.data = result.data.map(sanitizeUserOutput);

    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json(sanitizeUserOutput(user));
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const createUser = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = userSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const existing = await UserModel.findOneBy("email", sanitizedData.email);
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const newUser = await UserModel.create(sanitizedData);
    res.status(201).json(sanitizeUserOutput(newUser));
  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = userSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    sanitizedData.updated_at = new Date();
    const updatedUser = await UserModel.update(req.params.id, sanitizedData);
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json(sanitizeUserOutput(updatedUser));
  } catch (err) {
    console.error("❌ Error updating user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await UserModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "User not found or already deleted" });
    }

    res.json({ message: "User deleted successfully", deleted });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// === USER PROFILE ENDPOINTS ===

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(sanitizeUserOutput(user));
  } catch (err) {
    console.error("❌ Error fetching my profile:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const sanitizedData = sanitizeInput(req.body);
   
    // הסרת שדות שאסור לעדכן
    delete sanitizedData.id;
    delete sanitizedData.role;
    delete sanitizedData.created_at;
    delete sanitizedData.deleted_at;
    
    sanitizedData.updated_at = new Date();
    
    const updatedUser = await BaseModel.runRawQuery(
      `UPDATE users SET ${Object.keys(sanitizedData).map((key, index) => `${key} = $${index + 2}`).join(', ')} 
       WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
      [userId, ...Object.values(sanitizedData)]
    );
    
    if (!updatedUser.length) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(sanitizeUserOutput(updatedUser[0]));
  } catch (err) {
    console.error("❌ Error updating my profile:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// === PUBLIC PROFILE ENDPOINTS ===

export const getPublicUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const userResult = await BaseModel.runRawQuery(
      `SELECT id, firstname, lastname, email, role, profile_image, created_at 
       FROM users 
       WHERE id = $1 AND deleted_at IS NULL`,
      [userId]
    );
    
    const user = userResult[0];
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // אם זה קליינט - מחזירים עם נתונים נוספים
    if (user.role === 'client') {
      const clientQuery = `
        SELECT 
          u.id, u.firstname, u.lastname, u.email, u.role, u.profile_image, u.created_at,
          COUNT(DISTINCT p.id) as total_projects,
          COUNT(DISTINCT CASE WHEN p.is_open = true THEN p.id END) as open_projects,
          COUNT(DISTINCT CASE WHEN p.created_at > NOW() - INTERVAL '3 months' THEN p.id END) as recent_projects
        FROM users u
        LEFT JOIN projects p ON u.id = p.client_id AND p.deleted_at IS NULL
        WHERE u.id = $1 AND u.deleted_at IS NULL
        GROUP BY u.id, u.firstname, u.lastname, u.email, u.role, u.profile_image, u.created_at
      `;
      const result = await BaseModel.runRawQuery(clientQuery, [userId]);
      return res.json(result[0]);
    }

    // לכל השאר - פרופיל בסיסי
    res.json(user);

  } catch (err) {
    console.error("❌ Error fetching public user profile:", err);
    res.status(500).json({ error: "Server error" });
  }
};