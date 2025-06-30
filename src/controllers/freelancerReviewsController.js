import BaseModel from "../models/BaseModel.js";
import FreelancerRatingModel from "../models/FreelancerRatingModel.js";
import { sanitizeInput } from "../sanitize/sanitize.js";
import { freelancerRatingSchema } from "../validitions/freelancerRatingSchema.js";

export const getFreelancerReviews = async (req, res) => {
  try {
    const freelancerId = parseInt(req.params.id);
    if (isNaN(freelancerId)) {
      return res.status(400).json({ error: "Invalid freelancer ID" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // ספירת סך כל הביקורות
    const countQuery = `
      SELECT COUNT(*) AS count
      FROM freelancer_ratings
      WHERE freelancer_id = $1
    `;
    const countResult = await BaseModel.runRawQuery(countQuery, [freelancerId]);
    const totalCount = parseInt(countResult[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    // שליפת ביקורות עם פרטי לקוחות
    const reviewsQuery = `
      SELECT 
        r.rating,
        r.comment,
        r.created_at,
        u.firstname,
        u.lastname
      FROM freelancer_ratings r
      JOIN users u ON r.client_id = u.id
      WHERE r.freelancer_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const reviews = await BaseModel.runRawQuery(reviewsQuery, [freelancerId, limit, offset]);

    res.json({
      page,
      pageSize: limit,
      totalPages,
      totalCount,
      data: reviews,
    });
  } catch (err) {
    console.error("❌ Error fetching freelancer reviews:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const addFreelancerReview = async (req, res) => {
  try {
    const clientId = req.user.id; 
    const freelancerId = parseInt(req.params.id);
    if (isNaN(freelancerId)) {
      return res.status(400).json({ error: "Invalid freelancer ID" });
    }

    const sanitizedData = sanitizeInput(req.body);
    sanitizedData.freelancer_id = freelancerId;
    sanitizedData.client_id = clientId;

    // ולידציה
    const { error } = freelancerRatingSchema.validate(sanitizedData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // יצירת דירוג חדש
    const newReview = await FreelancerRatingModel.create({
      freelancer_id: freelancerId,
      client_id: clientId,
      rating: sanitizedData.rating,
      comment: sanitizedData.comment || null,
    });

    // עדכון ממוצע דירוג ו- count בטבלה freelancers
    const updateAvgQuery = `
      UPDATE freelancers
      SET rating = sub.avg_rating,
          ratings_count = sub.count
      FROM (
        SELECT freelancer_id, AVG(rating)::numeric(3,2) AS avg_rating, COUNT(*) AS count
        FROM freelancer_ratings
        WHERE freelancer_id = $1
        GROUP BY freelancer_id
      ) AS sub
      WHERE freelancers.id = sub.freelancer_id
      RETURNING freelancers.rating, freelancers.ratings_count;
    `;

    const updatedRating = await BaseModel.runRawQuery(updateAvgQuery, [freelancerId]);

    res.status(201).json({
      message: "Review added",
      review: newReview,
      updatedFreelancerRating: updatedRating[0] || null,
    });
  } catch (err) {
    console.error("❌ Error adding freelancer review:", err);
    res.status(500).json({ error: "Server error" });
  }
};
