import BaseModel from "../models/BaseModel.js";
import requestSchema from "../validitions/requestsSchema.js";
import { sanitizeInput } from "../sanitize/sanitize.js";

/* =========================================================
   Helpers
========================================================= */

const buildExpandedRequestSelect = () => `
  r.*,
  p.title as project_title,
  p.description as project_description,

  from_user.firstname as from_user_firstname,
  from_user.lastname  as from_user_lastname,
  from_user.email     as from_user_email,
  from_user.phone     as from_user_phone,
  from_user.profile_image as from_user_profile_image,
  from_user.role      as from_user_role
`;

const buildExpandedRequestFrom = () => `
  requests r
  JOIN projects p ON r.project_id = p.id
  JOIN users from_user ON r.from_user_id = from_user.id
`;

const getExpandedRequestById = async (requestId) => {
  const q = `
    SELECT ${buildExpandedRequestSelect()}
    FROM ${buildExpandedRequestFrom()}
    WHERE r.id = $1 AND r.deleted_at IS NULL
  `;
  const rows = await BaseModel.runRawQuery(q, [requestId]);
  return rows[0] || null;
};

/* =========================================================
   CREATE REQUEST
========================================================= */
export const createRequest = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = requestSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    sanitizedData.from_user_id = req.user.id;
    const userRole = req.user.role;

    if (sanitizedData.to_user_id === sanitizedData.from_user_id) {
      return res.status(400).json({ error: "Cannot send request to yourself" });
    }

    const projectCheck = await BaseModel.runRawQuery(
      `SELECT is_open FROM projects WHERE id = $1`,
      [sanitizedData.project_id]
    );

    if (!projectCheck.length) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (!projectCheck[0].is_open) {
      return res.status(400).json({ error: "Project is closed" });
    }

    const existingRequest = await BaseModel.runRawQuery(
      `SELECT id FROM requests 
       WHERE ((from_user_id = $1 AND to_user_id = $2)
          OR (from_user_id = $2 AND to_user_id = $1))
       AND project_id = $3 
       AND deleted_at IS NULL`,
      [
        sanitizedData.from_user_id,
        sanitizedData.to_user_id,
        sanitizedData.project_id,
      ]
    );

    if (existingRequest.length > 0) {
      return res.status(409).json({
        error: "Request already exists between these users for this project",
      });
    }

    let requestType = "";
    if (userRole === "client") requestType = "client_to_freelancer";
    if (userRole === "freelancer") requestType = "freelancer_to_client";

    const newRequest = await BaseModel.runRawQuery(
      `INSERT INTO requests
       (from_user_id, to_user_id, project_id, status, request_type, created_at)
       VALUES ($1, $2, $3, 'pending', $4, NOW())
       RETURNING *`,
      [
        sanitizedData.from_user_id,
        sanitizedData.to_user_id,
        sanitizedData.project_id,
        requestType,
      ]
    );

    res.status(201).json(newRequest[0]);
  } catch (err) {
    console.error("createRequest error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================================================
   GET REQUEST BY ID (expanded)
========================================================= */
export const getRequestById = async (req, res) => {
  try {
    const request = await getExpandedRequestById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
  } catch (err) {
    console.error("getRequestById error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================================================
   GET ALL REQUESTS (admin) - pagination + filters
========================================================= */
export const getAllRequests = async (req, res) => {
  try {
    const { status, project_id, page = 1, limit = 10 } = req.query;

    const values = [];
    let where = "r.deleted_at IS NULL";

    if (status) {
      values.push(status);
      where += ` AND r.status = $${values.length}`;
    }
    if (project_id) {
      values.push(project_id);
      where += ` AND r.project_id = $${values.length}`;
    }

    const result = await BaseModel.paginateRaw({
      select: buildExpandedRequestSelect(),
      from: buildExpandedRequestFrom(),
      where,
      values,
      page,
      limit,
      orderBy: "r.created_at DESC",
    });

    res.json(result);
  } catch (err) {
    console.error("getAllRequests error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================================================
   GET REQUESTS BY FREELANCER
========================================================= */
export const getRequestsByFreelancer = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const freelancerId = req.params.freelancerId;

    const values = [freelancerId];
    let where = "r.to_user_id = $1 AND r.deleted_at IS NULL";

    if (status) {
      values.push(status);
      where += ` AND r.status = $${values.length}`;
    }

    const result = await BaseModel.paginateRaw({
      select: buildExpandedRequestSelect(),
      from: buildExpandedRequestFrom(),
      where,
      values,
      page,
      limit,
      orderBy: "r.created_at DESC",
    });

    res.json(result);
  } catch (err) {
    console.error("getRequestsByFreelancer error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================================================
   GET REQUESTS BY CLIENT
========================================================= */
export const getRequestsByClient = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const clientId = req.params.clientId;

    const values = [clientId];
    let where = "r.from_user_id = $1 AND r.deleted_at IS NULL";

    if (status) {
      values.push(status);
      where += ` AND r.status = $${values.length}`;
    }

    const result = await BaseModel.paginateRaw({
      select: buildExpandedRequestSelect(),
      from: buildExpandedRequestFrom(),
      where,
      values,
      page,
      limit,
      orderBy: "r.created_at DESC",
    });

    res.json(result);
  } catch (err) {
    console.error("getRequestsByClient error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================================================
   GET MY INCOMING REQUESTS
========================================================= */
export const getMyRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;

    const values = [userId];
    let where = "r.to_user_id = $1 AND r.deleted_at IS NULL";

    if (status) {
      values.push(status);
      where += ` AND r.status = $${values.length}`;
    }

    const result = await BaseModel.paginateRaw({
      select: buildExpandedRequestSelect(),
      from: buildExpandedRequestFrom(),
      where,
      values,
      page,
      limit,
      orderBy: "r.created_at DESC",
    });

    res.json(result);
  } catch (err) {
    console.error("getMyRequests error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================================================
   GET MY CREATED REQUESTS (outgoing)
   חשוב: כאן ה"from_user_*" צריך להיות הצד השני (to_user)
========================================================= */
export const getMyCreatedRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;

    const values = [userId];
    let where = "r.from_user_id = $1 AND r.deleted_at IS NULL";

    if (status) {
      values.push(status);
      where += ` AND r.status = $${values.length}`;
    }

    const result = await BaseModel.paginateRaw({
      select: `
        r.*,
        p.title as project_title,
        p.description as project_description,

        to_user.firstname as from_user_firstname,
        to_user.lastname  as from_user_lastname,
        to_user.email     as from_user_email,
        to_user.phone     as from_user_phone,
        to_user.profile_image as from_user_profile_image,
        to_user.role      as from_user_role
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
      orderBy: "r.created_at DESC",
    });

    res.json(result);
  } catch (err) {
    console.error("getMyCreatedRequests error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================================================
   ACCEPT REQUEST
   ✅ הסרנו updated_at כדי שלא יפיל DB
   ✅ מחזיר expanded כדי שלפרונט יהיו phone/email אחרי match
========================================================= */
export const acceptRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;

    const check = await BaseModel.runRawQuery(
      `SELECT * FROM requests
       WHERE id = $1
       AND (to_user_id = $2 OR from_user_id = $2)
       AND deleted_at IS NULL`,
      [requestId, userId]
    );

    if (!check.length) {
      return res.status(404).json({ error: "Request not found or not authorized" });
    }

    if (check[0].status !== "pending") {
      return res.status(400).json({ error: "Request is not pending" });
    }

    await BaseModel.runRawQuery(
      `UPDATE requests
       SET status = 'matched'
       WHERE id = $1`,
      [requestId]
    );

    const expanded = await getExpandedRequestById(requestId);
    res.json(expanded);
  } catch (err) {
    console.error("acceptRequest error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================================================
   REJECT REQUEST
========================================================= */
export const rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;

    const check = await BaseModel.runRawQuery(
      `SELECT * FROM requests
       WHERE id = $1
       AND (to_user_id = $2 OR from_user_id = $2)
       AND deleted_at IS NULL`,
      [requestId, userId]
    );

    if (!check.length) {
      return res.status(404).json({ error: "Request not found or not authorized" });
    }

    if (check[0].status !== "pending") {
      return res.status(400).json({ error: "Request is not pending" });
    }

    await BaseModel.runRawQuery(
      `UPDATE requests
       SET status = 'declined'
       WHERE id = $1`,
      [requestId]
    );

    const expanded = await getExpandedRequestById(requestId);
    res.json(expanded);
  } catch (err) {
    console.error("rejectRequest error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================================================
   DELETE REQUEST (soft delete) - only creator (or admin via middleware)
========================================================= */
export const deleteRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;

    const check = await BaseModel.runRawQuery(
      `SELECT * FROM requests 
       WHERE id = $1 AND from_user_id = $2 AND deleted_at IS NULL`,
      [requestId, userId]
    );

    if (!check.length) {
      return res.status(404).json({ error: "Request not found or not authorized" });
    }

    const deleted = await BaseModel.runRawQuery(
      `UPDATE requests 
       SET deleted_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [requestId]
    );

    res.json({ message: "Request archived successfully", deleted: deleted[0] });
  } catch (err) {
    console.error("deleteRequest error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================================================
   UPDATE REQUEST STATUS (admin)
========================================================= */
export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    if (!["pending", "matched", "declined"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await BaseModel.runRawQuery(
      `UPDATE requests 
       SET status = $1
       WHERE id = $2 AND deleted_at IS NULL`,
      [status, requestId]
    );

    const expanded = await getExpandedRequestById(requestId);
    if (!expanded) return res.status(404).json({ error: "Request not found" });

    res.json(expanded);
  } catch (err) {
    console.error("updateRequestStatus error:", err);
    res.status(500).json({ error: "Server error" });
  }
};