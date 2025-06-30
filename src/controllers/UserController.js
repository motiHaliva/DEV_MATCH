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
    const {
      search,
      role,
      limit = 10,
      page = 1,
    } = req.query;

    const values = [];
    let index = 1;

    let whereClause = `WHERE deleted_at IS NULL`;

    if (search) {
      whereClause += ` AND (
        firstname ILIKE $${index} OR
        lastname ILIKE $${index} OR
        email ILIKE $${index}
      )`;
      values.push(`%${search}%`);
      index++;
    }

    if (role) {
      whereClause += ` AND role::text = $${index}`;
      values.push(role);
      index++;
    }

    const countQuery = `
      SELECT COUNT(*) FROM users
      ${whereClause}
    `;
    const countResult = await BaseModel.runRawQuery(countQuery, values);
    const totalCount = parseInt(countResult[0].count);

    const limitInt = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitInt;

    const dataQuery = `
      SELECT * FROM users
      ${whereClause}
      ORDER BY id
      LIMIT $${index} OFFSET $${index + 1}
    `;

    const users = await BaseModel.runRawQuery(dataQuery, [...values, limitInt, offset]);
    const safeUsers = users.map(sanitizeUserOutput);

    res.json({
      totalCount,
      page: parseInt(page),
      pageSize: limitInt,
      totalPages: Math.ceil(totalCount / limitInt),
      data: safeUsers,
    });
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
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let query;
    if (userRole === 'client') {
      query = `
        SELECT 
          u.*
        FROM users u
        LEFT JOIN projects p ON u.id = p.client_id AND p.deleted_at IS NULL
        WHERE u.id = $1 AND u.deleted_at IS NULL
        GROUP BY u.id
      `;
    } else {
      // למשתמשים רגילים או פרילנסרים ללא נתונים נוספים
      query = `
        SELECT * FROM users 
        WHERE id = $1 AND deleted_at IS NULL
      `;
    }
    
    const result = await BaseModel.runRawQuery(query, [userId]);
    const user = result[0];
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
export const getPublicUserProfile = async (req, res) => {
  try {
    // קודם נבדוק את התפקיד של המשתמש, לפי ה־id שלו
    const userId = req.params.id;

    // שלב ראשון - נשיג את המשתמש עצמו עם התפקיד
    const userResult = await BaseModel.runRawQuery(
      `SELECT id, firstname, lastname, email, role, created_at 
       FROM users 
       WHERE id = $1 AND deleted_at IS NULL`,
      [userId]
    );
    const user = userResult[0];
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }


    if (user.role === 'client') {
      const clientQuery = `
        SELECT 
          u.id,
          u.firstname,
          u.lastname,
          u.email,
          u.role,
          u.created_at,
          COUNT(DISTINCT p.id) as total_projects,
          COUNT(DISTINCT CASE WHEN p.is_open = true THEN p.id END) as open_projects,
          COUNT(DISTINCT CASE WHEN p.created_at > NOW() - INTERVAL '3 months' THEN p.id END) as recent_projects
        FROM users u
        LEFT JOIN projects p ON u.id = p.client_id AND p.deleted_at IS NULL
        WHERE u.id = $1 AND u.deleted_at IS NULL
        GROUP BY u.id, u.firstname, u.lastname, u.email, u.role, u.created_at
      `;
      const result = await BaseModel.runRawQuery(clientQuery, [userId]);
      return res.json(result[0]);
    } 
    
    if (user.role === 'freelancer') {
      // לפרילנסר נחזיר מידע פרטי ונתונים נוספים מהטבלה freelancers
      const freelancerQuery = `
        SELECT 
          u.id,
          u.firstname,
          u.lastname,
          u.email,
          u.role,
          u.created_at,
          f.headline,
          f.bio,
          f.experience_years,
          f.is_available,
          f.location
        FROM users u
        JOIN freelancers f ON u.id = f.user_id
        WHERE u.id = $1 AND u.deleted_at IS NULL AND f.deleted_at IS NULL
      `;
      const result = await BaseModel.runRawQuery(freelancerQuery, [userId]);
      if (!result.length) {
        return res.status(404).json({ error: "Freelancer profile not found" });
      }
      return res.json(result[0]);
    }

    return res.json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const sanitizedData = sanitizeInput(req.body);
   
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
    
    const { password, ...safeUser } = updatedUser[0];
    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

