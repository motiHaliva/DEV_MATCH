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

    const { error } = userSkillSchema.validate(sanitizedBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { skill_id } = sanitizedBody;

    const result = await UserSkillModel.create({ user_id: userId, skill_id });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error assigning skill to user:', error);
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
    const skills = await SkillModel.runRawQuery(query, [userId]);
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
    const result = await SkillModel.runRawQuery(query, [userId, skillId]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Skill not found for this user' });
    }

    res.json({ message: 'Skill removed from user', data: result[0] });
  } catch (error) {
    console.error('Error removing skill from user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
