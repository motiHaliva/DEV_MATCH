import BaseModel from '../models/BaseModel.js';
import SkillModel from '../models/SkillModel.js';
import UserSkillModel from '../models/UserSkillModel.js';
import {sanitizeInput} from '../sanitize/sanitize.js';  
import userSkillSchema from '../validitions/userSkillSchema.js';

export const getAll = async (req, res) => {
  try {
    const skills = await SkillModel.findAll();
    res.json(skills);
  } catch (error) {
    console.error('Error getting all skills:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignToUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const sanitizedBody = sanitizeInput(req.body);

    if (!Array.isArray(sanitizedBody.skills)) {
      return res.status(400).json({ error: "Field 'skills' must be an array" });
    }

    const skills = sanitizedBody.skills;

    for (const s of skills) {
      if (typeof s !== 'number' || isNaN(s)) {
        return res.status(400).json({ error: "All skill IDs must be valid numbers" });
      }
    }

    // קבלת כל הכישורים הקיימים של המשתמש
    const existingSkillsQuery = `
      SELECT skill_id FROM user_skills WHERE user_id = $1
    `;
    const existingSkillsResult = await BaseModel.runRawQuery(existingSkillsQuery, [userId]);
    const existingSkillIds = existingSkillsResult.map(row => row.skill_id);

    // סינון הכישורים שלא קיימים עדיין
    const newSkillsToAdd = skills.filter(s => !existingSkillIds.includes(s));

    for (const skillId of newSkillsToAdd) {
      await UserSkillModel.create({ user_id: userId, skill_id: skillId });
    }

    res.status(200).json({ 
      message: `Added ${newSkillsToAdd.length} new skills`, 
      addedSkills: newSkillsToAdd 
    });
  } catch (error) {
    console.error('Error assigning skills to user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const query = `
      SELECT s.*
      FROM skills s
      JOIN user_skills us ON s.id = us.skill_id
      WHERE us.user_id = $1;
    `;
    const skills = await BaseModel.runRawQuery(query, [userId]);
    res.json(skills);
  } catch (error) {
    console.error('Error getting skills by user ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeFromUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillId = parseInt(req.params.skillId);

    const query = `
      DELETE FROM user_skills
      WHERE user_id = $1 AND skill_id = $2
      RETURNING *;
    `;
    const result = await BaseModel.runRawQuery(query, [userId, skillId]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Skill not found for this user' });
    }

    res.json({ message: 'Skill removed from user', data: result[0] });
  } catch (error) {
    console.error('Error removing skill from user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
