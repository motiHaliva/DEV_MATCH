import TitleModel from '../models/TitleModel.js';
import UserTitleModel from '../models/UserTitleModel.js';
import userTitleSchema from '../validitions/userTitleSchema.js';
import {sanitizeInput} from '../sanitize/sanitize.js';
import BaseModel from '../models/BaseModel.js';

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

    if (!Array.isArray(sanitizedBody.titles)) {
      return res.status(400).json({ error: "Field 'titles' must be an array" });
    }

    const titles = sanitizedBody.titles;

    for (const t of titles) {
      if (typeof t !== 'number' || isNaN(t)) {
        return res.status(400).json({ error: "All title IDs must be valid numbers" });
      }
    }

    // קבלת כל הטייטלים הקיימים של המשתמש
    const existingTitlesQuery = `
      SELECT title_id FROM user_titles WHERE user_id = $1
    `;
    const existingTitlesResult = await BaseModel.runRawQuery(existingTitlesQuery, [userId]);
    const existingTitleIds = existingTitlesResult.map(row => row.title_id);

    const newTitlesToAdd = titles.filter(t => !existingTitleIds.includes(t));


    for (const titleId of newTitlesToAdd) {
      await UserTitleModel.create({ user_id: userId, title_id: titleId });
    }

    res.status(200).json({ 
      message: `Added ${newTitlesToAdd.length} new titles`, 
      addedTitles: newTitlesToAdd 
    });
  } catch (error) {
    console.error('Error assigning titles to user:', error);
    console.log("err"+error);

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
    const titles = await BaseModel.runRawQuery(query, [userId]);
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
    const result = await BaseModel.runRawQuery(query, [userId, titleId]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Title not found for this user' });
    }

    res.json({ message: 'Title removed from user', data: result[0] });
  } catch (error) {
    console.error('Error removing title from user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
