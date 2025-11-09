import FreelancerModel from "../models/FreelancerModel.js";
import freelancerSchema from "../validitions/freelancerSchema.js";
import { updateUserSchema } from "../validitions/userSchema.js"
import { sanitizeInput } from "../sanitize/sanitize.js";
import BaseModel from "../models/BaseModel.js";


export const getAllFreelancers = async (req, res) => {
  try {
    console.log("🔍 getAllFreelancers called with query:", req.query);

    const {
      search,
      is_available,
      min_experience,
      max_experience,
      page = 1,
      limit = 10,
      sort,
    } = req.query;

    const values = [];
    let where = `users.deleted_at IS NULL AND freelancers.deleted_at IS NULL`;


    if (search && search.trim() !== '') {
      where += ` AND (
        users.firstname ILIKE $${values.length + 1}
        OR users.lastname ILIKE $${values.length + 1}
        OR users.email ILIKE $${values.length + 1}
        OR freelancers.headline ILIKE $${values.length + 1}
      )`;
      values.push(`%${search}%`);
    }

    // סינונים
    if (is_available && is_available.trim() !== '') {
      where += ` AND freelancers.is_available = $${values.length + 1}`;
      values.push(is_available === "true");
    }

    if (min_experience && min_experience.trim() !== '' && !isNaN(parseInt(min_experience))) {
      where += ` AND freelancers.experience_years >= $${values.length + 1}`;
      values.push(parseInt(min_experience));
    }

    if (max_experience && max_experience.trim() !== '' && !isNaN(parseInt(max_experience))) {
      where += ` AND freelancers.experience_years <= $${values.length + 1}`;
      values.push(parseInt(max_experience));
    }

    // מיון
    let orderBy = `freelancers.created_at DESC`; // ברירת מחדל
    if (sort && sort.trim() !== '') {
      switch (sort) {
        case "rating_desc":
          orderBy = `freelancers.rating DESC NULLS LAST`;
          break;
        case "rating_asc":
          orderBy = `freelancers.rating ASC NULLS LAST`;
          break;
        case "experience_desc":
          orderBy = `freelancers.experience_years DESC`;
          break;
        case "experience_asc":
          orderBy = `freelancers.experience_years ASC`;
          break;
        default:
          orderBy = `freelancers.created_at DESC`;
      }
    }

    const result = await BaseModel.paginateRaw({
      select: `
        freelancers.id, freelancers.headline, freelancers.bio, freelancers.experience_years,
        freelancers.location, freelancers.is_available, freelancers.rating, freelancers.rating_count,
        freelancers.created_at,
        users.id as user_id, users.firstname, users.lastname, users.email, users.profile_image
      `,
      from: `freelancers JOIN users ON freelancers.user_id = users.id`,
      where,
      values,
      page: parseInt(page),
      limit: parseInt(limit),
      orderBy
    });

    console.log("🔍 Query result:", {
      totalItems: result.pagination?.total,
      currentPage: result.pagination?.page,
      itemsReturned: result.data?.length
    });

    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching freelancers:", err);
    console.error("❌ Stack trace:", err.stack);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

export const createFreelancer = async (req, res) => {
  try {
    const userId = req.user.id;
    const sanitizedData = sanitizeInput(req.body);

    const {
      firstname, lastname, email, profile_image,
      is_available, headline, bio, experience_years, location
    } = sanitizedData;

    if (!firstname || !lastname || !email) {
      return res.status(400).json({ error: "Missing required user fields" });
    }

    // עדכון נתוני משתמש
    const updatedUser = await BaseModel.runRawQuery(
      `UPDATE users 
       SET firstname = $2, lastname = $3, email = $4, profile_image = $5, updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL 
       RETURNING id, firstname, lastname, email, profile_image`,
      [userId, firstname, lastname, email, profile_image]
    );

    if (!updatedUser.length) {
      return res.status(404).json({ error: "User not found" });
    }

    // יצירת פרופיל פרילנסר חדש
    const newFreelancer = await BaseModel.runRawQuery(
      `INSERT INTO freelancers 
       (user_id, is_available, headline, bio, experience_years, location, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [userId, is_available || false, headline || '', bio || '', experience_years || 0, location || '']
    );

    res.status(201).json({
      user: updatedUser[0],
      freelancer: newFreelancer[0],
      titles: [],
      skills: []
    });

  } catch (err) {
    console.error("❌ Error creating freelancer:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateFreelancer = async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = freelancerSchema.validate(sanitizedData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const freelancer = await FreelancerModel.findById(req.params.id);
    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    sanitizedData.updated_at = new Date();
    const updated = await FreelancerModel.update(req.params.id, sanitizedData);
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating freelancer:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteFreelancer = async (req, res) => {
  try {
    const deleted = await FreelancerModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Freelancer not found or already deleted" });
    }
    res.json({ message: "Freelancer deleted successfully", deleted });
  } catch (err) {
    console.error("❌ Error deleting freelancer:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// === FREELANCER PROFILE ENDPOINTS ===

export const getMyFreelancerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // שליפת פרופיל מלא עם skills ו-titles
    const profileQuery = `
      SELECT 
        u.id, u.firstname, u.lastname, u.email, u.phone, u.profile_image, u.created_at as user_created_at,
        f.id AS freelancer_id, f.headline, f.bio, f.experience_years, f.location, 
        f.is_available, f.rating, f.rating_count, f.created_at, f.updated_at, f.user_id,
        COALESCE(string_agg(DISTINCT t.name, '|'), '') as titles_string,
        COALESCE(string_agg(DISTINCT t.id::text, '|'), '') as title_ids_string,
        COALESCE(string_agg(DISTINCT s.name, '|'), '') as skills_string,
        COALESCE(string_agg(DISTINCT s.id::text, '|'), '') as skill_ids_string
      FROM users u
      LEFT JOIN freelancers f ON f.user_id = u.id AND f.deleted_at IS NULL
      LEFT JOIN user_titles ut ON ut.user_id = u.id
      LEFT JOIN titles t ON t.id = ut.title_id
      LEFT JOIN user_skills us ON us.user_id = u.id
      LEFT JOIN skills s ON s.id = us.skill_id
      WHERE u.id = $1 AND u.deleted_at IS NULL
      GROUP BY u.id, u.firstname, u.lastname, u.email, u.profile_image, u.created_at,
               f.id, f.headline, f.bio, f.experience_years, f.location, 
               f.is_available, f.rating, f.rating_count, f.created_at, f.updated_at, f.user_id
    `;

    const profileResult = await BaseModel.runRawQuery(profileQuery, [userId]);

    if (!profileResult.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const profile = profileResult[0];

    // אם אין פרופיל פרילנסר
    if (!profile.freelancer_id) {
      return res.json({
        user: {
          id: profile.id,
          firstname: profile.firstname,
          lastname: profile.lastname,
          email: profile.email,
           phone: profile.phone,
          profile_image: profile.profile_image,
          created_at: profile.user_created_at
        },
        freelancer: null,
        titles: [],
        skills: []
      });
    }

    // עיבוד titles ו-skills
    const titles = profile.titles_string ?
      profile.titles_string.split('|').map((name, index) => ({
        id: parseInt(profile.title_ids_string.split('|')[index]),
        name: name
      })).filter(item => item.name && !isNaN(item.id)) : [];

    const skills = profile.skills_string ?
      profile.skills_string.split('|').map((name, index) => ({
        id: parseInt(profile.skill_ids_string.split('|')[index]),
        name: name
      })).filter(item => item.name && !isNaN(item.id)) : [];

    res.json({
      user: {
        id: profile.id,
        firstname: profile.firstname,
        lastname: profile.lastname,
        email: profile.email,
            phone: profile.phone,
        profile_image: profile.profile_image,
        created_at: profile.user_created_at
      },
      freelancer: {
        id: profile.freelancer_id,
        headline: profile.headline,
        bio: profile.bio,
        experience_years: profile.experience_years,
        location: profile.location,
        is_available: profile.is_available,
        rating: profile.rating,
        rating_count: profile.rating_count,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        user_id: profile.user_id
      },
      titles,
      skills
    });

  } catch (err) {
    console.error("❌ Error fetching my freelancer profile:", err);
    res.status(500).json({ error: "Server error" });
  }
};



export const updateMyFreelancerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const sanitizedData = sanitizeInput(req.body);




    // const { error: userError } = updateUserSchema.validate(sanitizedData);
    // if (userError) return res.status(400).json({ error: userError.details[0].message });

    // const { error: freelancerError } = freelancerSchema.validate(sanitizedData);
    // if (freelancerError) return res.status(400).json({ error: freelancerError.details[0].message });




    const {
      firstname, lastname, email,phone, profile_image,
      is_available, headline, bio, experience_years, location
    } = sanitizedData;

    // עדכון נתוני משתמש
    const updatedUser = await BaseModel.runRawQuery(
      `UPDATE users 
      SET firstname = $2, lastname = $3, email = $4, phone = $5, profile_image = $6, updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL 
       RETURNING id, firstname, lastname, email, phone, profile_image`,
      [userId, firstname, lastname, email, phone, profile_image]
    );

    if (!updatedUser.length) {
      return res.status(404).json({ error: "User not found" });
    }

    // בדיקה אם יש פרופיל פרילנסר
    const freelancerResult = await BaseModel.runRawQuery(
      `SELECT id FROM freelancers WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId]
    );

    let updatedFreelancer;

    if (freelancerResult.length === 0) {
      // יצירת פרופיל חדש
      updatedFreelancer = await BaseModel.runRawQuery(
        `INSERT INTO freelancers 
         (user_id, is_available, headline, bio, experience_years, location, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING *`,
        [userId, is_available || false, headline || '', bio || '', experience_years || 0, location || '']
      );
    } else {
      // עדכון פרופיל קיים
      updatedFreelancer = await BaseModel.runRawQuery(
        `UPDATE freelancers 
         SET is_available = $2, headline = $3, bio = $4, experience_years = $5, location = $6, updated_at = NOW()
         WHERE user_id = $1 AND deleted_at IS NULL
         RETURNING *`,
        [userId, is_available, headline, bio, experience_years, location]
      );
    }

    res.json({
      user: updatedUser[0],
      freelancer: updatedFreelancer[0]
    });

  } catch (err) {
    console.error("❌ Error updating my freelancer profile:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const getFreelancerByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const query = `
      SELECT 
        f.id as freelancer_id, f.headline, f.bio, f.experience_years, f.location,
        f.is_available, f.rating, f.rating_count, f.created_at, f.updated_at,
        u.id, u.firstname, u.lastname, u.email, u.profile_image
      FROM freelancers f
      JOIN users u ON f.user_id = u.id
      WHERE u.id = $1 AND u.deleted_at IS NULL AND f.deleted_at IS NULL
    `;

    const result = await BaseModel.runRawQuery(query, [userId]);
    const freelancer = result[0];

    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    res.json(freelancer);

  } catch (err) {
    console.error("❌ Error fetching freelancer by user ID:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getFullFreelancerProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    // שליפת פרופיל מלא עם skills ו-titles
    const profileQuery = `
      SELECT 
        u.id, u.firstname, u.lastname, u.email, u.profile_image, u.created_at as user_created_at,
        f.id AS freelancer_id, f.headline, f.bio, f.experience_years, f.location, 
        f.is_available, f.rating, f.rating_count, f.created_at, f.updated_at, f.user_id,
        COALESCE(string_agg(DISTINCT t.name, '|'), '') as titles_string,
        COALESCE(string_agg(DISTINCT t.id::text, '|'), '') as title_ids_string,
        COALESCE(string_agg(DISTINCT s.name, '|'), '') as skills_string,
        COALESCE(string_agg(DISTINCT s.id::text, '|'), '') as skill_ids_string
      FROM users u
      LEFT JOIN freelancers f ON f.user_id = u.id AND f.deleted_at IS NULL
      LEFT JOIN user_titles ut ON ut.user_id = u.id
      LEFT JOIN titles t ON t.id = ut.title_id
      LEFT JOIN user_skills us ON us.user_id = u.id
      LEFT JOIN skills s ON s.id = us.skill_id
      WHERE u.id = $1 AND u.deleted_at IS NULL
      GROUP BY u.id, u.firstname, u.lastname, u.email, u.profile_image, u.created_at,
               f.id, f.headline, f.bio, f.experience_years, f.location, 
               f.is_available, f.rating, f.rating_count, f.created_at, f.updated_at, f.user_id
    `;

    const profileResult = await BaseModel.runRawQuery(profileQuery, [userId]);

    if (!profileResult.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const profile = profileResult[0];

    // אם אין פרופיל פרילנסר
    if (!profile.freelancer_id) {
      return res.json({
        user: {
          id: profile.id,
          firstname: profile.firstname,
          lastname: profile.lastname,
          email: profile.email,
          profile_image: profile.profile_image,
          created_at: profile.user_created_at
        },
        freelancer: null,
        titles: [],
        skills: [],
        reviews: { data: [], totalCount: 0, averageRating: 0 }
      });
    }

    // עיבוד titles ו-skills
    const titles = profile.titles_string ?
      profile.titles_string.split('|').map((name, index) => ({
        id: parseInt(profile.title_ids_string.split('|')[index]),
        name: name
      })).filter(item => item.name && !isNaN(item.id)) : [];

    const skills = profile.skills_string ?
      profile.skills_string.split('|').map((name, index) => ({
        id: parseInt(profile.skill_ids_string.split('|')[index]),
        name: name
      })).filter(item => item.name && !isNaN(item.id)) : [];

    // שליפת ביקורות
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.reviewsLimit) || 5;

    const reviewsResult = await BaseModel.paginateRaw({
      select: `r.rating, r.comment, r.created_at, u.firstname, u.lastname, u.profile_image as user_avatar`,
      from: `freelancer_ratings r JOIN users u ON r.client_id = u.id`,
      where: 'r.freelancer_id = $1',
      values: [profile.freelancer_id],
      page,
      limit,
      orderBy: 'r.created_at DESC'
    });

    res.json({
      user: {
        id: profile.id,
        firstname: profile.firstname,
        lastname: profile.lastname,
        email: profile.email,
        profile_image: profile.profile_image,
        created_at: profile.user_created_at
      },
      freelancer: {
        id: profile.freelancer_id,
        headline: profile.headline,
        bio: profile.bio,
        experience_years: profile.experience_years,
        location: profile.location,
        is_available: profile.is_available,
        rating: profile.rating,
        rating_count: profile.rating_count,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        user_id: profile.user_id
      },
      titles,
      skills,
      reviews: reviewsResult
    });

  } catch (err) {
    console.error("❌ Error fetching full freelancer profile:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// פונקציה נוספת לשליפת ביקורות בלבד
export const getFreelancerReviews = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // מצא את freelancer_id לפי user_id
    const freelancerResult = await BaseModel.runRawQuery(
      `SELECT id FROM freelancers WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId]
    );

    if (!freelancerResult.length) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    const freelancerId = freelancerResult[0].id;

    // שליפת ביקורות עם pagination
    const reviewsResult = await BaseModel.paginateRaw({
      select: `r.rating, r.comment, r.created_at, u.firstname, u.lastname, u.profile_image as user_avatar`,
      from: `freelancer_ratings r JOIN users u ON r.client_id = u.id`,
      where: 'r.freelancer_id = $1',
      values: [freelancerId],
      page,
      limit,
      orderBy: 'r.created_at DESC'
    });

    res.json(reviewsResult);

  } catch (err) {
    console.error("❌ Error fetching freelancer reviews:", err);
    res.status(500).json({ error: "Server error" });
  }
};