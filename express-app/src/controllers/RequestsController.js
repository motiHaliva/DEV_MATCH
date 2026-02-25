import BaseModel from "../models/BaseModel.js";
import requestSchema from "../validitions/requestsSchema.js";
import { sanitizeInput } from "../sanitize/sanitize.js";

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

    // מניעת self request
    if (sanitizedData.to_user_id === sanitizedData.from_user_id) {
      return res.status(400).json({ error: "Cannot send request to yourself" });
    }

    // בדיקה שהפרויקט קיים ופתוח
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

    // מניעת כפילויות דו כיווניות
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
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================================================
   GET MY INCOMING REQUESTS
   (אני מקבל בקשות → הצד השני הוא from_user)
========================================================= */
export const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await BaseModel.paginateRaw({
      select: `
        r.*,
        p.title as project_title,
        p.description as project_description,

        from_user.firstname as from_user_firstname,
        from_user.lastname as from_user_lastname,
        from_user.email as from_user_email,
        from_user.phone as from_user_phone,
        from_user.profile_image as from_user_profile_image,
        from_user.role as from_user_role
      `,
      from: `
        requests r
        JOIN projects p ON r.project_id = p.id
        JOIN users from_user ON r.from_user_id = from_user.id
      `,
      where: `r.to_user_id = $1 AND r.deleted_at IS NULL`,
      values: [userId],
      orderBy: "r.created_at DESC",
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================================================
   GET MY CREATED REQUESTS
   (אני שלחתי בקשות → הצד השני הוא to_user)
========================================================= */
export const getMyCreatedRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await BaseModel.paginateRaw({
      select: `
        r.*,
        p.title as project_title,
        p.description as project_description,

        to_user.firstname as from_user_firstname,
        to_user.lastname as from_user_lastname,
        to_user.email as from_user_email,
        to_user.phone as from_user_phone,
        to_user.profile_image as from_user_profile_image,
        to_user.role as from_user_role
      `,
      from: `
        requests r
        JOIN projects p ON r.project_id = p.id
        JOIN users to_user ON r.to_user_id = to_user.id
      `,
      where: `r.from_user_id = $1 AND r.deleted_at IS NULL`,
      values: [userId],
      orderBy: "r.created_at DESC",
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================================================
   ACCEPT REQUEST
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

    if (!check.length)
      return res.status(404).json({ error: "Request not found or not authorized" });

    if (check[0].status !== "pending")
      return res.status(400).json({ error: "Request is not pending" });

    const updated = await BaseModel.runRawQuery(
      `UPDATE requests
       SET status = 'matched', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [requestId]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
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

    if (!check.length)
      return res.status(404).json({ error: "Request not found or not authorized" });

    if (check[0].status !== "pending")
      return res.status(400).json({ error: "Request is not pending" });

    const updated = await BaseModel.runRawQuery(
      `UPDATE requests
       SET status = 'declined', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [requestId]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};