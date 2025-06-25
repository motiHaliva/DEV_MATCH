import RequestsModel from "../models/RequestsModel.js";
import requestSchema from "../validitions/requestsSchema.js";
import { sanitizeInput } from "../sanitize/sanitize.js";



// יצירת בקשה חדשה
export const createRequest = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = requestSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newRequest = await RequestsModel.create(sanitizedData);
    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// שליפת בקשה לפי מזהה
export const getRequestById = async (req, res) => {
  try {
    const request = await RequestsModel.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// מחיקת בקשה
export const deleteRequest = async (req, res) => {
  try {
    const deleted = await RequestsModel.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Request not found" });

    res.json({ message: "Request archived successfully (soft delete)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }}

// קבלת בקשות לפי פרילנסר (to_user_id)
export const getRequestsByFreelancer = async (req, res) => {
  try {
    const requests = await RequestsModel.findManyBy("to_user_id", req.params.freelancerId);
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// קבלת בקשות לפי לקוח (from_user_id)
export const getRequestsByClient = async (req, res) => {
  try {
    const requests = await RequestsModel.findManyBy("from_user_id", req.params.clientId);
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// אישור בקשה
export const acceptRequest = async (req, res) => {
  try {
    const updated = await RequestsModel.update(req.params.id, {
      status: "matched",
      updated_at: new Date()
    });
    if (!updated) return res.status(404).json({ error: "Request not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// דחיית בקשה
export const rejectRequest = async (req, res) => {
  try {
    const updated = await RequestsModel.update(req.params.id, {
      status: "declined",
      updated_at: new Date()
    });
    if (!updated) return res.status(404).json({ error: "Request not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
