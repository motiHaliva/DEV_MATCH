import pool from "../db.js";

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }
  

  // יצירת רשומה חדשה
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const columns = keys.join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO ${this.tableName} (${columns})
      VALUES (${placeholders})
      RETURNING *;
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // עדכון לפי ID
  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(", ");

    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *;
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }

  // שליפה לפי ID (רק אם לא נמחק)
  async findById(id) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE id = $1 AND deleted_at IS NULL;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // שליפה לפי עמודה (למשל אימייל), רק אם לא נמחק
  async findOneBy(field, value) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE ${field} = $1 AND deleted_at IS NULL
      LIMIT 1;
    `;
    const result = await pool.query(query, [value]);
    return result.rows[0];
  }

  // שליפת כל הרשומות הפעילות (לא נמחקו)
  async findAll() {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE deleted_at IS NULL
      ORDER BY id;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // מחיקה רכה – Soft Delete
  async delete(id) {
    const query = `
      UPDATE ${this.tableName}
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

async findManyBy(field, value) {
  const query = `
    SELECT * FROM ${this.tableName}
    WHERE ${field} = $1 AND deleted_at IS NULL;
  `;
  const result = await pool.query(query, [value]);
  return result.rows;
}


static async  runRawQuery(query, params = []) {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

}

export default BaseModel;
