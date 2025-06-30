import TitleModel from '../models/TitleModel.js';
import UserTitleModel from '../models/UserTitleModel.js';
import userTitleSchema from '../validitions/userTitleSchema.js';
import {sanitizeInput} from '../sanitize/sanitize.js';

export const getAll = async (req, res) => {
  try {
    const titles = await TitleModel.findAll();
    res.json(titles);
  } catch (error) {
    console.error('Error getting all titles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignToUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const sanitizedBody = sanitizeInput(req.body);

    const { error } = userTitleSchema.validate(sanitizedBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { title_id } = sanitizedBody;
    const result = await UserTitleModel.create({ user_id: userId, title_id });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error assigning title to user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const query = `
      SELECT t.*
      FROM titles t
      JOIN user_titles ut ON t.id = ut.title_id
      WHERE ut.user_id = $1;
    `;
    const titles = await TitleModel.runRawQuery(query, [userId]);
    res.json(titles);
  } catch (error) {
    console.error('Error getting titles by user ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeFromUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const titleId = parseInt(req.params.titleId);

    const query = `
      DELETE FROM user_titles
      WHERE user_id = $1 AND title_id = $2
      RETURNING *;
    `;
    const result = await TitleModel.constructor.runRawQuery(query, [userId, titleId]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Title not found for this user' });
    }

    res.json({ message: 'Title removed from user', data: result[0] });
  } catch (error) {
    console.error('Error removing title from user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
