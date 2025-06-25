import freelancerModel from "../models/FreelancerModel.js";
import freelancerSchema from "../validitions/freelancerSchema.js";
import { sanitizeInput } from "../sanitize/sanitize.js";

export const getAllFreelancers = async (req, res) => {
  try {
    const freelancers = await freelancerModel.findAll();
    res.json(freelancers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getFreelancerById = async (req, res) => {
  try {
    const freelancer = await freelancerModel.findById(req.params.id);
    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer not found" });
    }
    res.json(freelancer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const createFreelancer = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = freelancerSchema.validate(sanitizedData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const newFreelancer = await freelancerModel.create(sanitizedData);
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

    const freelancer = await freelancerModel.findById(req.params.id);
    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    const updated = await freelancerModel.update(req.params.id, sanitizedData);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteFreelancer = async (req, res) => {
  try {
    const deleted = await freelancerModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Freelancer not found or already deleted" });
    }

    res.json({ message: "Freelancer was soft-deleted", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
