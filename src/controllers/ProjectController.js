import ProjectModel from "../models/ProjectModel.js";
import projectSchema from "../validitions/projectSchema.js";
import { sanitizeInput } from "../sanitize/sanitize.js";

// שליפת כל הפרויקטים
export const getAllProjects = async (req, res) => {
  try {
    const projects = await ProjectModel.findAll();
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// שליפת פרויקט לפי ID
export const getProjectById = async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// יצירת פרויקט חדש
export const createProject = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = projectSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newProject = await ProjectModel.create(sanitizedData);
    res.status(201).json(newProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// עדכון פרויקט
export const updateProject = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = projectSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // אם בעתיד תוסיף updated_at, כאן תעדכן אותו ידנית
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

