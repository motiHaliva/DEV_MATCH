// import ProjectModel from "../models/ProjectModel.js";
// import {projectSchema , updateProjectSchema} from "../validitions/projectSchema.js";
// import { sanitizeInput } from "../sanitize/sanitize.js";
// import BaseModel from "../models/BaseModel.js";

// // שליפת כל הפרויקטים עם פאגינציה, חיפוש וסינון
//  export const getAllProjects = async (req, res) => {
//   try {
    
//     const { type, search, is_open, page = 1, limit = 10, sort } = req.query;
//     let where = 'p.deleted_at IS NULL AND u.deleted_at IS NULL';
//     const values = [];

  
//     if (type && type.trim() !== '') {
//       where += ` AND p.project_type = $${values.length + 1}`;
//       values.push(type);
//       console.log("🔍 Added type filter:", type);
//     }

//     // סינון לפי סטטוס פתוח/סגור
//     if (is_open && is_open.trim() !== '') {
//       where += ` AND p.is_open = $${values.length + 1}`;
//       values.push(is_open === "true");
//       console.log("🔍 Added is_open filter:", is_open);
//     }

//     // חיפוש טקסט
//     if (search && search.trim() !== '') {
//       where += ` AND (
//         p.title ILIKE $${values.length + 1}
//         OR p.description ILIKE $${values.length + 1}
//         OR u.firstname ILIKE $${values.length + 1}
//         OR u.lastname ILIKE $${values.length + 1}
//       )`;
//       values.push(`%${search}%`);
//       console.log("🔍 Added search filter:", search);
//     }

  
//     let orderBy = 'p.created_at DESC'; 
//     if (sort && sort.trim() !== '') {
//       switch (sort) {
//         case 'created_asc':
//           orderBy = 'p.created_at ASC';
//           break;
//         case 'title_asc':
//           orderBy = 'p.title ASC';
//           break;
//         case 'title_desc':
//           orderBy = 'p.title DESC';
//           break;
//         default:
//           orderBy = 'p.created_at DESC';
//       }
//     }

//     const result = await BaseModel.paginateRaw({
//       select: `
//         p.*,
//         u.firstname AS client_firstname,
//         u.lastname AS client_lastname,
//         u.email AS client_email,
//         u.profile_image AS client_avatar
//       `,
//       from: `
//         projects p
//         JOIN users u ON p.client_id = u.id
//       `,
//       where,
//       values,
//       page: parseInt(page),
//       limit: parseInt(limit),
//       orderBy
//     });

//     console.log("🔍 Query result:", {
//       totalItems: result.pagination?.total,
//       currentPage: result.pagination?.page,
//       itemsReturned: result.data?.length,
//       sql: result.sql // אם BaseModel מחזיר את ה-SQL
//     });

//     res.json(result);
//   } catch (err) {
//     console.error("❌ Error fetching projects:", err);
//     console.error("❌ Stack trace:", err.stack);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// };

// export const getProjectById = async (req, res) => {
//   try {
//     const projectId = req.params.id;

//     // שליפת פרויקט עם פרטי הלקוח
//     const projectQuery = `
//       SELECT 
//         p.*,
//       u.firstname AS client_firstname,
//       u.lastname AS client_lastname,
//       u.email AS client_email
//       FROM projects p
//       JOIN users u ON p.client_id = u.id
//       WHERE p.id = $1 AND p.deleted_at IS NULL AND u.deleted_at IS NULL
//     `;
//     const projectResult = await BaseModel.runRawQuery(projectQuery, [projectId]);
//     const project = projectResult[0];

//     if (!project) {
//       return res.status(404).json({ error: "Project not found" });
//     }

//     // שליפת בקשות עם פרטי הפרילנסרים
//     const requestsQuery = `
//       SELECT 
//       r.id AS request_id,
//       r.status,
//       r.created_at,
//       u.id AS freelancer_id,
//       u.firstname AS freelancer_firstname,
//       u.lastname AS freelancer_lastname,
//       u.email AS freelancer_email
//       FROM requests r
//       JOIN users u ON r.to_user_id = u.id
//       LEFT JOIN freelancers f ON f.user_id = u.id
//       WHERE r.project_id = $1 AND r.deleted_at IS NULL
//       `;
//     const requests = await BaseModel.runRawQuery(requestsQuery, [projectId]);

//     res.json({
//       ...project,
//       requests,
//     });
//   } catch (err) {
//     console.error("❌ Error in getProjectById:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // יצירת פרויקט חדש
// export const createProject = async (req, res) => {
//   try {
//     const sanitizedData = sanitizeInput(req.body);
//     sanitizedData.client_id = req.user.id;
//     const { error } = projectSchema.validate(sanitizedData);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const newProject = await ProjectModel.create(sanitizedData);
//     res.status(201).json(newProject);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // עדכון פרויקט
// // תקן את הפונקציות deleteProject ו-updateProject:

// // מחיקת פרויקט
// export const deleteProject = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const userId = req.user.id;

//     console.log("Delete project - User ID:", userId, "Project ID:", projectId); // דיבוג

//     // שלוף את הפרויקט כדי לבדוק שהוא שייך למשתמש
//     const project = await ProjectModel.findById(projectId);
    
//     if (!project || project.deleted_at) {
//       return res.status(404).json({ error: "Project not found" });
//     }

//     console.log("Project owner (client_id):", project.client_id); // דיבוג

//     // בדוק שהמשתמש הוא בעל הפרויקט (או אדמין) - תקן ל-client_id
//     if (project.client_id !== userId && req.user.role !== 'admin') {
//       return res.status(403).json({ error: "Access denied - You can only delete your own projects" });
//     }

//     // מחק את הפרויקט
//     const deleted = await ProjectModel.delete(projectId);
    
//     if (!deleted) {
//       return res.status(404).json({ error: "Project not found or already deleted" });
//     }

//     res.json({ message: "Project deleted successfully", deleted });
//   } catch (err) {
//     console.error("Error deleting project:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // עדכון פרויקט
// export const updateProject = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const userId = req.user.id;

//     const project = await ProjectModel.findById(projectId);
//     if (!project || project.deleted_at) {
//       return res.status(404).json({ error: "Project not found" });
//     }

//     if (project.client_id !== userId && req.user.role !== 'admin') {
//       return res.status(403).json({ error: "Access denied - You can only update your own projects" });
//     }

  
//     const { error, value } = updateProjectSchema.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

    
//     const sanitizedData = sanitizeInput(value);
//     sanitizedData.updated_at = new Date();

//     const updatedProject = await ProjectModel.update(projectId, sanitizedData);
//     if (!updatedProject) return res.status(404).json({ error: "Project not found after update" });

//     res.json(updatedProject);
//   } catch (err) {
//     console.error("Error updating project:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// export const getProjectsByUserId = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const { page = 1, limit = 10, is_open } = req.query;

//     let where = 'client_id = $1 AND deleted_at IS NULL';
//     const values = [userId];

//     if (is_open !== undefined) {
//       where += ` AND is_open = $${ values.length + 1 }`;
//       values.push(is_open === "true");
//     }

//     const result = await BaseModel.paginate(
//       "projects",
//       where,
//       values,
//       page,
//       limit,
//       "created_at DESC"
//     );

//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // שליפת כל הפרויקטים של המשתמש המחובר (client_id) עם פאגינציה
// export const getMyProjects = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { page = 1, limit = 10, is_open } = req.query;

//     let where = 'client_id = $1 AND deleted_at IS NULL';
//     const values = [userId];

//     if (is_open !== undefined) {
//       where += ` AND is_open = $${ values.length + 1 }`;
//       values.push(is_open === "true");
//     }

//     const result = await BaseModel.paginate(
//       "projects",
//       where,
//       values,
//       page,
//       limit,
//       "created_at DESC"
//     );

//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ******* הוסף את הפונקציה הזאת בסוף הקובץ *******
// export const getClientProfile = async (req, res) => {
//   try {
//     const clientId = req.params.client_id; // 👈 שונה מ-id ל-client_id
//     const { page = 1, limit = 10 } = req.query;

//     console.log("getClientProfile called with clientId:", clientId); // דיבוג

//     // שליפת פרטי הקליינט
//     const clientQuery = `
//       SELECT 
//         id, firstname, lastname, email,phone, profile_image, created_at
//       FROM users
//       WHERE id = $1 AND deleted_at IS NULL
//     `;
    
//     const clientResult = await BaseModel.runRawQuery(clientQuery, [clientId]);
    
//     console.log("Client query result:", clientResult); 
    
//     if (!clientResult.length) {
//       console.log("No client found with ID:", clientId); // דיבוג
//       return res.status(404).json({ error: "Client not found" });
//     }
    
//     const client = clientResult[0];

//     // שליפת פרויקטים של הקליינט עם pagination
//     const projectsResult = await BaseModel.paginateRaw({
//       select: `
//         id, title, description, project_type, is_open, deadline, created_at
//       `,
//       from: `projects`,
//       where: 'client_id = $1 AND deleted_at IS NULL',
//       values: [clientId],
//       page,
//       limit,
//       orderBy: 'created_at DESC'
//     });

//     console.log("Projects result:", projectsResult); // דיבוג

//     res.json({
//       ...client,
//       projects: projectsResult
//     });

//   } catch (err) {
//     console.error("❌ Error fetching client profile:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };



import {projectSchema , updateProjectSchema} from "../validitions/projectSchema.js";
import ProjectModel from '../models/ProjectModel. js';
import BaseModel from '../models/BaseModel.js';
import { sanitizeInput } from '../sanitize/sanitize.js';



export const getMyClientProfile = async (req, res) => {
  try {
    const userId = req. user.id;

    // שליפת פרטי המשתמש
    const userQuery = `
      SELECT 
        u.id, u.firstname, u.lastname, u.email, u.phone, u.profile_image, 
        u. created_at, u.role
      FROM users u
      WHERE u.id = $1 AND u.deleted_at IS NULL
    `;

    const userResult = await BaseModel.runRawQuery(userQuery, [userId]);

    if (!userResult.length) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ שליפת הפרויקטים של ה-client
    const projectsQuery = `
      SELECT 
        p.id, p.title, p.description, p.deadline, p.is_open, 
        p.project_type, p.created_at, p.updated_at,
        COUNT(CASE WHEN r.status = 'pending' AND r.deleted_at IS NULL THEN 1 END) as pending_requests,
        COUNT(CASE WHEN r.status = 'matched' AND r.deleted_at IS NULL THEN 1 END) as matched_requests
      FROM projects p
      LEFT JOIN requests r ON r.project_id = p.id
      WHERE p. client_id = $1 AND p.deleted_at IS NULL
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    const projectsResult = await BaseModel. runRawQuery(projectsQuery, [userId]);

    // ✅ סטטיסטיקות
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT CASE WHEN p.is_open = true THEN p.id END) as open_projects,
        COUNT(DISTINCT CASE WHEN p.is_open = false THEN p. id END) as closed_projects,
        COUNT(DISTINCT r. id) as total_requests,
        COUNT(DISTINCT CASE WHEN r.status = 'matched' THEN r.id END) as matched_requests
      FROM projects p
      LEFT JOIN requests r ON r.project_id = p. id AND r.deleted_at IS NULL
      WHERE p.client_id = $1 AND p.deleted_at IS NULL
    `;

    const statsResult = await BaseModel.runRawQuery(statsQuery, [userId]);

    res.json({ 
      user: userResult[0],
      projects:  projectsResult,
      stats:  statsResult[0] || {
        total_projects: 0,
        open_projects: 0,
        closed_projects:  0,
        total_requests: 0,
        matched_requests: 0
      }
    });

  } catch (err) {
    console.error("❌ Error fetching client profile:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateMyClientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const sanitizedData = sanitizeInput(req.body);

    const { firstname, lastname, email, phone, profile_image } = sanitizedData;

    // ✅ ולידציה בסיסית
    if (!firstname || !lastname || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ בדיקת אימייל ייחודי
    const emailCheck = await BaseModel.runRawQuery(
      `SELECT id FROM users WHERE email = $1 AND id != $2 AND deleted_at IS NULL`,
      [email, userId]
    );

    if (emailCheck.length > 0) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // ✅ עדכון
    const updatedUser = await BaseModel.runRawQuery(
      `UPDATE users 
       SET firstname = $2, lastname = $3, email = $4, phone = $5, 
           profile_image = $6, updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL 
       RETURNING id, firstname, lastname, email, phone, profile_image, role, created_at`,
      [userId, firstname, lastname, email, phone || '', profile_image || null]
    );

    if (!updatedUser.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ 
      user: updatedUser[0],
      message: 'Profile updated successfully'
    });

  } catch (err) {
    console.error("❌ Error updating client profile:", err);
    
    // ✅ טיפול בשגיאות ספציפיות
    if (err.code === '23505') { // Unique constraint violation
      return res. status(409).json({ error: "Email already in use" });
    }
    
    res.status(500).json({ error: "Server error" });
  }
};

// ===================================
// ✅ PROJECT CRUD FUNCTIONS
// ===================================

export const getAllProjects = async (req, res) => {
  try {
    const {
      search,
      type,
      is_open,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    const filters = {};
    
    if (search) filters.search = search;
    if (type) filters.type = type;
    if (is_open !== undefined) filters.is_open = is_open;
    if (sort) filters.sort = sort;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereConditions = ['p.deleted_at IS NULL'];
    let queryParams = [];
    let paramCounter = 1;

    // Search
    if (search) {
      whereConditions.push(`(p.title ILIKE $${paramCounter} OR p.description ILIKE $${paramCounter})`);
      queryParams.push(`%${search}%`);
      paramCounter++;
    }

    // Filter by type
    if (type) {
      whereConditions.push(`p.project_type = $${paramCounter}`);
      queryParams.push(type);
      paramCounter++;
    }

    // Filter by is_open
    if (is_open !== undefined) {
      whereConditions.push(`p.is_open = $${paramCounter}`);
      queryParams.push(is_open === 'true');
      paramCounter++;
    }

    const whereClause = whereConditions. length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Sorting
    let orderBy = 'p.created_at DESC'; // Default:  newest first
    if (sort === 'created_asc') orderBy = 'p.created_at ASC';
    else if (sort === 'deadline_asc') orderBy = 'p.deadline ASC';
    else if (sort === 'deadline_desc') orderBy = 'p.deadline DESC';

    // Main query with user info
    const query = `
      SELECT 
        p.*,
        u.firstname as client_firstname,
        u.lastname as client_lastname,
        u.email as client_email,
        u.profile_image as client_profile_image
      FROM projects p
      LEFT JOIN users u ON p.client_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `;

    queryParams.push(parseInt(limit), offset);

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM projects p
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2); // Remove limit and offset

    const [projects, countResult] = await Promise.all([
      BaseModel.runRawQuery(query, queryParams),
      BaseModel.runRawQuery(countQuery, countParams)
    ]);

    const total = parseInt(countResult[0]?.total || 0);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      data: projects,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_count: total,
        per_page: parseInt(limit),
        has_next: parseInt(page) < totalPages,
        has_prev: parseInt(page) > 1
      }
    });

  } catch (err) {
    console.error("❌ Error fetching projects:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const projectId = req.params. id;

    const query = `
      SELECT 
        p.*,
        u.firstname as client_firstname,
        u.lastname as client_lastname,
        u.email as client_email,
        u.profile_image as client_profile_image
      FROM projects p
      LEFT JOIN users u ON p.client_id = u.id
      WHERE p. id = $1 AND p. deleted_at IS NULL
    `;

    const result = await BaseModel.runRawQuery(query, [projectId]);

    if (!result.length) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(result[0]);

  } catch (err) {
    console.error("❌ Error fetching project:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const createProject = async (req, res) => {
  try {
    const clientId = req.user.id;
    const sanitizedData = sanitizeInput(req.body);

    const { title, description, deadline, project_type, is_open = true } = sanitizedData;

    // Validation
    if (!title || ! description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const newProject = await BaseModel.runRawQuery(
      `INSERT INTO projects 
       (client_id, title, description, deadline, project_type, is_open, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [clientId, title, description, deadline || null, project_type || null, is_open]
    );

    res.status(201).json(newProject[0]);

  } catch (err) {
    console.error("❌ Error creating project:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const sanitizedData = sanitizeInput(req.body);

    // Check ownership
    const projectCheck = await BaseModel.runRawQuery(
      `SELECT client_id FROM projects WHERE id = $1 AND deleted_at IS NULL`,
      [projectId]
    );

    if (! projectCheck.length) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Authorization:  only owner or admin
    if (userRole !== 'admin' && projectCheck[0].client_id !== userId) {
      return res. status(403).json({ error: "Not authorized to update this project" });
    }

    const { title, description, deadline, project_type, is_open } = sanitizedData;

    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCounter++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCounter++}`);
      values.push(description);
    }
    if (deadline !== undefined) {
      updates.push(`deadline = $${paramCounter++}`);
      values.push(deadline);
    }
    if (project_type !== undefined) {
      updates.push(`project_type = $${paramCounter++}`);
      values.push(project_type);
    }
    if (is_open !== undefined) {
      updates.push(`is_open = $${paramCounter++}`);
      values.push(is_open);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.push(`updated_at = NOW()`);
    values.push(projectId);

    const query = `
      UPDATE projects 
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter} AND deleted_at IS NULL
      RETURNING *
    `;

    const updatedProject = await BaseModel.runRawQuery(query, values);

    if (!updatedProject. length) {
      return res. status(404).json({ error: "Project not found" });
    }

    res.json(updatedProject[0]);

  } catch (err) {
    console.error("❌ Error updating project:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check ownership
    const projectCheck = await BaseModel.runRawQuery(
      `SELECT client_id FROM projects WHERE id = $1 AND deleted_at IS NULL`,
      [projectId]
    );

    if (!projectCheck.length) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Authorization: only owner or admin
    if (userRole !== 'admin' && projectCheck[0].client_id !== userId) {
      return res. status(403).json({ error: "Not authorized to delete this project" });
    }

    // Soft delete
    const deleted = await BaseModel.runRawQuery(
      `UPDATE projects 
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [projectId]
    );

    if (!deleted. length) {
      return res. status(404).json({ error: "Project not found or already deleted" });
    }

    res.json({ 
      message: "Project deleted successfully",
      projectId: deleted[0].id 
    });

  } catch (err) {
    console.error("❌ Error deleting project:", err);
    res.status(500).json({ error: "Server error" });
  }
};