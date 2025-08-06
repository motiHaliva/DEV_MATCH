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

    const result = await BaseModel.paginateRaw({
      select: `
        r.rating,
        r.comment,
        r.created_at,
        u.firstname,
        u.lastname
      `,
      from: `
        freelancer_ratings r
        JOIN users u ON r.client_id = u.id
      `,
      where: 'r.freelancer_id = $1',
      values: [freelancerId],
      page,
      limit,
      orderBy: 'r.created_at DESC'
    });

    res.json(result);
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

    // ולידציה רק על rating ו-comment
    const { error } = freelancerRatingSchema.validate(sanitizedData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // בדוק אם כבר קיים דירוג כזה
    const existing = await BaseModel.runRawQuery(
      `SELECT 1 FROM freelancer_ratings WHERE freelancer_id = $1 AND client_id = $2`,
      [freelancerId, clientId]
    );
    if (existing.length) {
      return res.status(409).json({ error: "You have already rated this freelancer." });
    }

    // יצירת דירוג חדש
    const newReview = await FreelancerRatingModel.create({
      freelancer_id: freelancerId,
      client_id: clientId,
      rating: sanitizedData.rating,
      comment: sanitizedData.comment || null,
    });

    // עדכון ממוצע דירוג וספירה
const updateAvgQuery = `
  UPDATE freelancers
  SET rating = sub.avg_rating,
      rating_count = sub.count
  FROM (
    SELECT freelancer_id, AVG(rating)::numeric(3,2) AS avg_rating, COUNT(*) AS count
    FROM freelancer_ratings
    WHERE freelancer_id = $1
    GROUP BY freelancer_id
  ) AS sub
  WHERE freelancers.id = sub.freelancer_id
  RETURNING freelancers.rating, freelancers.rating_count;
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
