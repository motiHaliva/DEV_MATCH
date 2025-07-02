import BaseModel from "../models/BaseModel.js";
import requestSchema from "../validitions/requestsSchema.js";
import { sanitizeInput } from "../sanitize/sanitize.js";

// יצירת בקשה חדשה - יכול לבוא מלקוח, פרילנסר או מנהל פרויקט
export const createRequest = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = requestSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    sanitizedData.from_user_id = req.user.id;
    
    const userRole = req.user.role;

    // if (userRole !== 'client' && userRole !== 'freelancer') {
    //   return res.status(403).json({ error: "Not authorized to create requests" });
    // }
console.log("hoooooooo");

    const existingRequest = await BaseModel.runRawQuery(
      `SELECT id FROM requests 
       WHERE ((from_user_id = $1 AND to_user_id = $2) OR (from_user_id = $2 AND to_user_id = $1)) 
       AND project_id = $3 AND deleted_at IS NULL`,
      [sanitizedData.from_user_id, sanitizedData.to_user_id, sanitizedData.project_id]
    );
    
    if (existingRequest.length > 0) {
      return res.status(409).json({ error: "Request already exists between these users for this project" });
    }

    // קביעת סוג הבקשה לפי מי יוצר אותה
    let requestType = '';
    if (userRole === 'client') {
      requestType = 'client_to_freelancer';
    } else if (userRole === 'freelancer') {
      requestType = 'freelancer_to_client';
    }

    const newRequest = await BaseModel.runRawQuery(
      `INSERT INTO requests (from_user_id, to_user_id, project_id, status, request_type, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *`,
      [sanitizedData.from_user_id, sanitizedData.to_user_id, sanitizedData.project_id, 'pending', requestType]
    );
    
    res.status(201).json({
      ...newRequest[0],
      message: `Request created: ${requestType.replace('_', ' ')}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
// שליפת בקשה לפי מזהה עם פרטים מורחבים
export const getRequestById = async (req, res) => {
  try {
    const requestQuery = `
      SELECT 
        r.*,
        p.title as project_title,
        p.description as project_description,
        from_user.firstname as client_firstname,
        from_user.lastname as client_lastname,
        from_user.email as client_email,
        to_user.firstname as freelancer_firstname,
        to_user.lastname as freelancer_lastname,
        to_user.email as freelancer_email
      FROM requests r
      JOIN projects p ON r.project_id = p.id
      JOIN users from_user ON r.from_user_id = from_user.id
      JOIN users to_user ON r.to_user_id = to_user.id
      WHERE r.id = $1 AND r.deleted_at IS NULL
    `;
    
    const result = await BaseModel.runRawQuery(requestQuery, [req.params.id]);
    const request = result[0];
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
    console.log(err);
    
  }
};

// קבלת כל הבקשות עם פילטרים ופאגינציה
export const getAllRequests = async (req, res) => {
  try {
    const { status, project_id, page = 1, limit = 10 } = req.query;
    const values = [];
    let where = 'r.deleted_at IS NULL';

    if (status) {
      where += ` AND r.status = $${values.length + 1}`;
      values.push(status);
    }
    if (project_id) {
      where += ` AND r.project_id = $${values.length + 1}`;
      values.push(project_id);
    }

    const result = await BaseModel.paginateRaw({
      select: `
        r.*,
        p.title as project_title,
        from_user.firstname as client_firstname,
        from_user.lastname as client_lastname,
        to_user.firstname as freelancer_firstname,
        to_user.lastname as freelancer_lastname
      `,
      from: `
        requests r
        JOIN projects p ON r.project_id = p.id
        JOIN users from_user ON r.from_user_id = from_user.id
        JOIN users to_user ON r.to_user_id = to_user.id
      `,
      where,
      values,
      page,
      limit,
      orderBy: 'r.created_at DESC'
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getRequestsByFreelancer = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const freelancerId = req.params.freelancerId;
    const values = [freelancerId];
    let where = 'r.to_user_id = $1 AND r.deleted_at IS NULL';

    if (status) {
      where += ` AND r.status = $${values.length + 1}`;
      values.push(status);
    }

    const result = await BaseModel.paginateRaw({
      select: `
        r.*,
        p.title as project_title,
        p.description as project_description,
        from_user.firstname as client_firstname,
        from_user.lastname as client_lastname
      `,
      from: `
        requests r
        JOIN projects p ON r.project_id = p.id
        JOIN users from_user ON r.from_user_id = from_user.id
      `,
      where,
      values,
      page,
      limit,
      orderBy: 'r.created_at DESC'
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getRequestsByClient = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const clientId = req.params.clientId;
    const values = [clientId];
    let where = 'r.from_user_id = $1 AND r.deleted_at IS NULL';

    if (status) {
      where += ` AND r.status = $${values.length + 1}`;
      values.push(status);
    }

    const result = await BaseModel.paginateRaw({
      select: `
        r.*,
        p.title as project_title,
        p.description as project_description,
        to_user.firstname as freelancer_firstname,
        to_user.lastname as freelancer_lastname
      `,
      from: `
        requests r
        JOIN projects p ON r.project_id = p.id
        JOIN users to_user ON r.to_user_id = to_user.id
      `,
      where,
      values,
      page,
      limit,
      orderBy: 'r.created_at DESC'
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const values = [userId];
    let where = 'r.to_user_id = $1 AND r.deleted_at IS NULL';

    if (status) {
      where += ` AND r.status = $${values.length + 1}`;
      values.push(status);
    }

    const result = await BaseModel.paginateRaw({
      select: `
        r.*,
        p.title as project_title,
        p.description as project_description,
        from_user.firstname as sender_firstname,
        from_user.lastname as sender_lastname,
        from_user.email as sender_email,
        from_user.role as sender_role
      `,
      from: `
        requests r
        JOIN projects p ON r.project_id = p.id
        JOIN users from_user ON r.from_user_id = from_user.id
      `,
      where,
      values,
      page,
      limit,
      orderBy: 'r.created_at DESC'
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getMyCreatedRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const values = [userId];
    let where = 'r.from_user_id = $1 AND r.deleted_at IS NULL';

    if (status) {
      where += ` AND r.status = $${values.length + 1}`;
      values.push(status);
    }

    const result = await BaseModel.paginateRaw({
      select: `
        r.*,
        p.title as project_title,
        p.description as project_description,
        to_user.firstname as recipient_firstname,
        to_user.lastname as recipient_lastname,
        to_user.email as recipient_email,
        to_user.role as recipient_role
      `,
      from: `
        requests r
        JOIN projects p ON r.project_id = p.id
        JOIN users to_user ON r.to_user_id = to_user.id
      `,
      where,
      values,
      page,
      limit,
      orderBy: 'r.created_at DESC'
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// אישור בקשה - מאפשר גם לפרילנסר וגם ללקוח
export const acceptRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;
    
    // בדיקה שהבקשה שייכת למשתמש המחובר (to_user_id או from_user_id)
    const checkQuery = `
      SELECT * FROM requests 
      WHERE id = $1 AND (to_user_id = $2) AND deleted_at IS NULL
    `;
    const checkResult = await BaseModel.runRawQuery(checkQuery, [requestId, userId]);
    
    if (!checkResult.length) {
      return res.status(404).json({ error: "Request not found or not authorized" });
    }
    
    const request = checkResult[0];
    if (request.status !== 'pending') {
      return res.status(400).json({ error: "Request is not in pending status" });
    }
    
    // בדיקה אם המשתמש הוא הפרילנסר או הלקוח
    let acceptedBy = '';
    if (request.to_user_id === userId) {
      acceptedBy = 'freelancer';
    } else if (request.from_user_id === userId) {
      acceptedBy = 'client';
    }
    
    const updated = await BaseModel.runRawQuery(
      `UPDATE requests 
       SET status = 'matched', accepted_by = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [acceptedBy, requestId]
    );
    
    res.json({
      ...updated[0],
      message: `Request accepted by ${acceptedBy}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// דחיית בקשה - מאפשר גם לפרילנסר וגם ללקוח
export const rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;
    
    // בדיקה שהבקשה שייכת למשתמש המחובר (to_user_id או from_user_id)
    const checkQuery = `
      SELECT * FROM requests 
      WHERE id = $1 AND (to_user_id = $2 ) AND deleted_at IS NULL
    `;
    const checkResult = await BaseModel.runRawQuery(checkQuery, [requestId, userId]);
    
    if (!checkResult.length) {
      return res.status(404).json({ error: "Request not found or not authorized" });
    }
    
    const request = checkResult[0];
    if (request.status !== 'pending') {
      return res.status(400).json({ error: "Request is not in pending status" });
    }
    
    // בדיקה אם המשתמש הוא הפרילנסר או הלקוח
    let rejectedBy = '';
    if (request.to_user_id === userId) {
      rejectedBy = 'freelancer';
    } else if (request.from_user_id === userId) {
      rejectedBy = 'client';
    }
    
    const updated = await BaseModel.runRawQuery(
      `UPDATE requests 
       SET status = 'declined', rejected_by = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [rejectedBy, requestId]
    );
    
    res.json({
      ...updated[0],
      message: `Request rejected by ${rejectedBy}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// מחיקת בקשה (רק למי שיצר אותה)
export const deleteRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;
    
    // בדיקה שהבקשה שייכת למשתמש המחובר (from_user_id)
    const checkQuery = `
      SELECT * FROM requests 
      WHERE id = $1 AND from_user_id = $2 AND deleted_at IS NULL
    `;
    const checkResult = await BaseModel.runRawQuery(checkQuery, [requestId, userId]);
    
    if (!checkResult.length) {
      return res.status(404).json({ error: "Request not found or not authorized" });
    }
    
    const deleted = await BaseModel.runRawQuery(
      `UPDATE requests 
       SET deleted_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [requestId]
    );
    
    res.json({ message: "Request archived successfully (soft delete)", deleted: deleted[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// עדכון סטטוס בקשה (למנהלים)
export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;
    
    if (!['pending', 'matched', 'declined'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const updated = await BaseModel.runRawQuery(
      `UPDATE requests 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 AND deleted_at IS NULL 
       RETURNING *`,
      [status, requestId]
    );
    
    if (!updated.length) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};