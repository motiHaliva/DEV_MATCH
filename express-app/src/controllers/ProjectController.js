import ProjectModel from "../models/ProjectModel.js";
import {projectSchema , updateProjectSchema} from "../validitions/projectSchema.js";
import { sanitizeInput } from "../sanitize/sanitize.js";
import BaseModel from "../models/BaseModel.js";

// שליפת כל הפרויקטים עם פאגינציה, חיפוש וסינון
 export const getAllProjects = async (req, res) => {
  try {
    
    const { type, search, is_open, page = 1, limit = 10, sort } = req.query;
    let where = 'p.deleted_at IS NULL AND u.deleted_at IS NULL';
    const values = [];

  
    if (type && type.trim() !== '') {
      where += ` AND p.project_type = $${values.length + 1}`;
      values.push(type);
      console.log("🔍 Added type filter:", type);
    }

    // סינון לפי סטטוס פתוח/סגור
    if (is_open && is_open.trim() !== '') {
      where += ` AND p.is_open = $${values.length + 1}`;
      values.push(is_open === "true");
      console.log("🔍 Added is_open filter:", is_open);
    }

    // חיפוש טקסט
    if (search && search.trim() !== '') {
      where += ` AND (
        p.title ILIKE $${values.length + 1}
        OR p.description ILIKE $${values.length + 1}
        OR u.firstname ILIKE $${values.length + 1}
        OR u.lastname ILIKE $${values.length + 1}
      )`;
      values.push(`%${search}%`);
      console.log("🔍 Added search filter:", search);
    }

  
    let orderBy = 'p.created_at DESC'; 
    if (sort && sort.trim() !== '') {
      switch (sort) {
        case 'created_asc':
          orderBy = 'p.created_at ASC';
          break;
        case 'title_asc':
          orderBy = 'p.title ASC';
          break;
        case 'title_desc':
          orderBy = 'p.title DESC';
          break;
        default:
          orderBy = 'p.created_at DESC';
      }
    }

    const result = await BaseModel.paginateRaw({
      select: `
        p.*,
        u.firstname AS client_firstname,
        u.lastname AS client_lastname,
        u.email AS client_email,
        u.profile_image AS client_avatar
      `,
      from: `
        projects p
        JOIN users u ON p.client_id = u.id
      `,
      where,
      values,
      page: parseInt(page),
      limit: parseInt(limit),
      orderBy
    });

    console.log("🔍 Query result:", {
      totalItems: result.pagination?.total,
      currentPage: result.pagination?.page,
      itemsReturned: result.data?.length,
      sql: result.sql // אם BaseModel מחזיר את ה-SQL
    });

    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching projects:", err);
    console.error("❌ Stack trace:", err.stack);
    res.status(500).json({ error: "Server error", details: err.message });
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
// תקן את הפונקציות deleteProject ו-updateProject:

// מחיקת פרויקט
export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    console.log("Delete project - User ID:", userId, "Project ID:", projectId); // דיבוג

    // שלוף את הפרויקט כדי לבדוק שהוא שייך למשתמש
    const project = await ProjectModel.findById(projectId);
    
    if (!project || project.deleted_at) {
      return res.status(404).json({ error: "Project not found" });
    }

    console.log("Project owner (client_id):", project.client_id); // דיבוג

    // בדוק שהמשתמש הוא בעל הפרויקט (או אדמין) - תקן ל-client_id
    if (project.client_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied - You can only delete your own projects" });
    }

    // מחק את הפרויקט
    const deleted = await ProjectModel.delete(projectId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Project not found or already deleted" });
    }

    res.json({ message: "Project deleted successfully", deleted });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// עדכון פרויקט
export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await ProjectModel.findById(projectId);
    if (!project || project.deleted_at) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.client_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied - You can only update your own projects" });
    }

  
    const { error, value } = updateProjectSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    
    const sanitizedData = sanitizeInput(value);
    sanitizedData.updated_at = new Date();

    const updatedProject = await ProjectModel.update(projectId, sanitizedData);
    if (!updatedProject) return res.status(404).json({ error: "Project not found after update" });

    res.json(updatedProject);
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getProjectsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const { page = 1, limit = 10, is_open } = req.query;

    let where = 'client_id = $1 AND deleted_at IS NULL';
    const values = [userId];

    if (is_open !== undefined) {
      where += ` AND is_open = $${ values.length + 1 }`;
      values.push(is_open === "true");
    }

    const result = await BaseModel.paginate(
      "projects",
      where,
      values,
      page,
      limit,
      "created_at DESC"
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// שליפת כל הפרויקטים של המשתמש המחובר (client_id) עם פאגינציה
export const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, is_open } = req.query;

    let where = 'client_id = $1 AND deleted_at IS NULL';
    const values = [userId];

    if (is_open !== undefined) {
      where += ` AND is_open = $${ values.length + 1 }`;
      values.push(is_open === "true");
    }

    const result = await BaseModel.paginate(
      "projects",
      where,
      values,
      page,
      limit,
      "created_at DESC"
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ******* הוסף את הפונקציה הזאת בסוף הקובץ *******
export const getClientProfile = async (req, res) => {
  try {
    const clientId = req.params.client_id; // 👈 שונה מ-id ל-client_id
    const { page = 1, limit = 10 } = req.query;

    console.log("getClientProfile called with clientId:", clientId); // דיבוג

    // שליפת פרטי הקליינט
    const clientQuery = `
      SELECT 
        id, firstname, lastname, email, profile_image, created_at
      FROM users
      WHERE id = $1 AND deleted_at IS NULL
    `;
    
    const clientResult = await BaseModel.runRawQuery(clientQuery, [clientId]);
    
    console.log("Client query result:", clientResult); // דיבוג
    
    if (!clientResult.length) {
      console.log("No client found with ID:", clientId); // דיבוג
      return res.status(404).json({ error: "Client not found" });
    }
    
    const client = clientResult[0];

    // שליפת פרויקטים של הקליינט עם pagination
    const projectsResult = await BaseModel.paginateRaw({
      select: `
        id, title, description, project_type, is_open, deadline, created_at
      `,
      from: `projects`,
      where: 'client_id = $1 AND deleted_at IS NULL',
      values: [clientId],
      page,
      limit,
      orderBy: 'created_at DESC'
    });

    console.log("Projects result:", projectsResult); // דיבוג

    res.json({
      ...client,
      projects: projectsResult
    });

  } catch (err) {
    console.error("❌ Error fetching client profile:", err);
    res.status(500).json({ error: "Server error" });
  }
};