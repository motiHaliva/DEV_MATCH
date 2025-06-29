import ProjectModel from "../models/ProjectModel.js";
import projectSchema from "../validitions/projectSchema.js";
import { sanitizeInput } from "../sanitize/sanitize.js";
import BaseModel from "../models/BaseModel.js";


export const getAllProjects = async (req, res) => {
  try {
    const { type, search, is_open, page = 1, limit = 10 } = req.query;

    const values = [];
    let index = 1;
    let whereClause = `WHERE deleted_at IS NULL`;

    if (type) {
      whereClause += ` AND type = $${index}`;
      values.push(type);
      index++;
    }

    if (is_open !== undefined) {
      whereClause += ` AND is_open = $${index}`;
      values.push(is_open === "true"); 
      index++;
    }

    if (search) {
      whereClause += ` AND (
        title ILIKE $${index} OR
        description ILIKE $${index}
      )`;
      values.push(`%${search}%`);
      index++;
    }

    // ספירת סך הפרויקטים
    const countQuery = `SELECT COUNT(*) FROM projects ${whereClause}`;
    const countResult = await BaseModel.runRawQuery(countQuery, values);
    const totalCount = parseInt(countResult[0].count);

    // שאילתת נתונים עם פאגינציה
    const limitInt = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitInt;
    
    const dataQuery = `
      SELECT * FROM projects 
      ${whereClause} 
      ORDER BY id 
      LIMIT $${index} OFFSET $${index + 1}
    `;
    
    const projects = await BaseModel.runRawQuery(dataQuery, [...values, limitInt, offset]);

    res.json({
      totalCount,
      page: parseInt(page),
      pageSize: limitInt,
      totalPages: Math.ceil(totalCount / limitInt),
      data: projects,
    });
  } catch (err) {
    console.error("❌ Error fetching projects:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    // שליפת פרויקט עם פרטי הלקוח
    const projectQuery = `
      SELECT 
        p.*, 
        u.firstname AS client_firstname, 
        u.lastname AS client_lastname, 
        u.email AS client_email
      FROM projects p
      JOIN users u ON p.client_id = u.id
      WHERE p.id = $1 AND p.deleted_at IS NULL AND u.deleted_at IS NULL
    `;
    const projectResult = await BaseModel.runRawQuery(projectQuery, [projectId]);
    const project = projectResult[0];

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // שליפת בקשות עם פרטי הפרילנסרים
    const requestsQuery = `
      SELECT 
        r.id AS request_id,
        r.status,
        r.created_at,
        u.id AS freelancer_id,
        u.firstname AS freelancer_firstname,
        u.lastname AS freelancer_lastname,
        u.email AS freelancer_email
      FROM requests r
      JOIN users u ON r.to_user_id = u.id
      LEFT JOIN freelancers f ON f.user_id = u.id
      WHERE r.project_id = $1 AND r.deleted_at IS NULL
    `;
    const requests = await BaseModel.runRawQuery(requestsQuery, [projectId]);

    res.json({
      ...project,
      requests,
    });
  } catch (err) {
    console.error("❌ Error in getProjectById:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// יצירת פרויקט חדש
export const createProject = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    sanitizedData.client_id = req.user.id;
    const { error } = projectSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newProject = await ProjectModel.create(sanitizedData);
    res.status(201).json(newProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
// עדכון פרויקט
export const updateProject = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = projectSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    sanitizedData.updated_at = new Date();

    const updatedProject = await ProjectModel.update(req.params.id, sanitizedData);
    if (!updatedProject) return res.status(404).json({ error: "Project not found" });

    res.json(updatedProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// מחיקת פרויקט
export const deleteProject = async (req, res) => {
  try {
    const deleted = await ProjectModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Project not found or already deleted" });
    }

    res.json({ message: "Project was soft-deleted", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


export const getProjectsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const { page = 1, limit = 10, is_open } = req.query;

    const values = [userId];
    let index = 2;
    let whereClause = `WHERE client_id = $1 AND deleted_at IS NULL`;

    if (is_open !== undefined) {
      whereClause += ` AND is_open = $${index}`;
      values.push(is_open === "true");
      index++;
    }

    // שאילתת ספירה
    const countQuery = `SELECT COUNT(*) FROM projects ${whereClause}`;
    const countResult = await BaseModel.runRawQuery(countQuery, values);
    const totalCount = parseInt(countResult[0].count);

    const limitInt = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitInt;

    const dataQuery = `
      SELECT * FROM projects
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${index} OFFSET $${index + 1}
    `;
    const projects = await BaseModel.runRawQuery(dataQuery, [...values, limitInt, offset]);

    res.json({
      totalCount,
      page: parseInt(page),
      pageSize: limitInt,
      totalPages: Math.ceil(totalCount / limitInt),
      data: projects,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};



export const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, is_open } = req.query;
    
    const values = [userId];
    let index = 2;
    let whereClause = `WHERE client_id = $1 AND deleted_at IS NULL`;
    
    if (is_open !== undefined) {
      whereClause += ` AND is_open = $${index}`;
      values.push(is_open === "true");
      index++;
    }
    
    // ספירה
    const countQuery = `SELECT COUNT(*) FROM projects ${whereClause}`;
    const countResult = await BaseModel.runRawQuery(countQuery, values);
    const totalCount = parseInt(countResult[0].count);
    
    // נתונים
    const limitInt = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitInt;
    
    const dataQuery = `
      SELECT * FROM projects 
      ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT $${index} OFFSET $${index + 1}
    `;
    
    const projects = await BaseModel.runRawQuery(dataQuery, [...values, limitInt, offset]);
    
    res.json({
      totalCount,
      page: parseInt(page),
      pageSize: limitInt,
      totalPages: Math.ceil(totalCount / limitInt),
      data: projects,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};





