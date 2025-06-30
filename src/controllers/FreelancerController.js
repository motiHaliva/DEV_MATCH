import FreelancerModel from "../models/FreelancerModel.js";
import freelancerSchema from "../validitions//freelancerSchema.js";
import { sanitizeInput } from "../sanitize/sanitize.js";
import BaseModel from "../models/BaseModel.js";



export const getAllFreelancers = async (req, res) => {
  try {
    const {
      search,
      is_available,
      min_experience,
      max_experience,
      page = 1,
      limit = 10,
      sort,
    } = req.query;

    const values = [];
    let index = 1;
    let whereClause = `WHERE users.deleted_at IS NULL`;

    if (search) {
      whereClause += ` AND (
        users.firstname ILIKE $${index} OR
        users.lastname ILIKE $${index} OR
        users.email ILIKE $${index}
      )`;
      values.push(`%${search}%`);
      index++;
    }

    if (is_available !== undefined) {
      whereClause += ` AND freelancers.is_available = $${index}`;
      values.push(is_available === "true");
      index++;
    }

    if (min_experience) {
      whereClause += ` AND freelancers.experience_years >= $${index}`;
      values.push(parseInt(min_experience));
      index++;
    }

    if (max_experience) {
      whereClause += ` AND freelancers.experience_years <= $${index}`;
      values.push(parseInt(max_experience));
      index++;
    }

    // מיון
    let orderByClause = `ORDER BY freelancers.id`;
    switch (sort) {
      case "rating_desc":
        orderByClause = `ORDER BY freelancers.rating DESC NULLS LAST`;
        break;
      case "rating_asc":
        orderByClause = `ORDER BY freelancers.rating ASC NULLS LAST`;
        break;
      case "experience_desc":
        orderByClause = `ORDER BY freelancers.experience_years DESC`;
        break;
      case "experience_asc":
        orderByClause = `ORDER BY freelancers.experience_years ASC`;
        break;
    }

    // ספירת סך הפרילנסרים
    const countQuery = `
      SELECT COUNT(*) 
      FROM freelancers
      JOIN users ON freelancers.user_id = users.id
      ${whereClause}
    `;
    const countResult = await BaseModel.runRawQuery(countQuery, values);
    const totalCount = parseInt(countResult[0].count);

    // פאגינציה
    const limitInt = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitInt;

    const dataQuery = `
      SELECT freelancers.*, users.firstname, users.lastname, users.email
      FROM freelancers
      JOIN users ON freelancers.user_id = users.id
      ${whereClause}
      ${orderByClause}
      LIMIT $${index} OFFSET $${index + 1}
    `;

    const freelancers = await BaseModel.runRawQuery(dataQuery, [...values, limitInt, offset]);

    res.json({
      totalCount,
      page: parseInt(page),
      pageSize: limitInt,
      totalPages: Math.ceil(totalCount / limitInt),
      data: freelancers,
    });
  } catch (err) {
    console.error("❌ Error fetching freelancers:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const createFreelancer = async (req, res) => {
  try {
    const userId = req.user.id;
     const sanitizedData = sanitizeInput(req.body);
     sanitizedData.user_id = userId;
    const { error } = freelancerSchema.validate(sanitizedData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const newFreelancer = await FreelancerModel.create(sanitizedData);
    res.status(201).json(newFreelancer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
    console.log(err);
    
  }
};

export const updateFreelancer = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    
    const { error } = freelancerSchema.validate(sanitizedData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const freelancer = await FreelancerModel.findById(req.params.id);
    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    const updated = await FreelancerModel.update(req.params.id, sanitizedData);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteFreelancer = async (req, res) => {
  try {
    const deleted = await FreelancerModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Freelancer not found or already deleted" });
    }

    res.json({ message: "Freelancer was soft-deleted", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};



export const getPublicFreelancerProfile = async (req, res) => {
  try {
    const query = `
      SELECT 
        f.id AS freelancer_id,
        f.headline,
        f.bio,
        f.experience_years,
        f.location,
        f.is_available,
        u.firstname,
        u.lastname
      FROM freelancers f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = $1 AND u.deleted_at IS NULL;
    `;

    const result = await BaseModel.runRawQuery(query, [req.params.id]);
    const freelancer = result[0];

    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    res.json(freelancer);
  } catch (err) {
    console.error("❌ Error fetching public freelancer profile:", err);
    res.status(500).json({ error: "Server error" });
  }
};



export const getMyFreelancerProfile = async (req, res) => {
  try {
    const userId = req.user.id; 
    const query = `
      SELECT 
        f.*,
        u.firstname,
        u.lastname,
        u.email
      FROM freelancers f
      JOIN users u ON f.user_id = u.id
      WHERE f.user_id = $1 AND u.deleted_at IS NULL;
    `;

    const result = await BaseModel.runRawQuery(query, [userId]);
    const freelancer = result[0];

    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    res.json(freelancer);
  } catch (err) {
    console.error("❌ Error fetching freelancer profile:", err);
    res.status(500).json({ error: "Server error" });
  }
};
export const updateMyFreelancerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const sanitizedData = sanitizeInput(req.body);
    const { error } = freelancerSchema.validate(sanitizedData);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // מציאת הפרילנסר על פי user_id
    const freelancerQuery = `SELECT id FROM freelancers WHERE user_id = $1`;
    const freelancerResult = await BaseModel.runRawQuery(freelancerQuery, [userId]);
    
    if (!freelancerResult.length) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }
    
    const freelancerId = freelancerResult[0].id;
    const updated = await FreelancerModel.update(freelancerId, sanitizedData);
    
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};



