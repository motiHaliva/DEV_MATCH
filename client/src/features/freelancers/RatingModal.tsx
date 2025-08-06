import React, { useEffect, useState } from 'react';
import type { RatingModalProps } from './type';
import Button from '../../ui/Button';
import { toast } from "react-toastify"; // <-- add this import

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, onSubmit, freelancerName, isLoading = false, }) => {

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setComment('');
      setHoveredRating(0);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await onSubmit(rating, comment);
    } catch (error) {
      console.error('Error in modal submit:', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Rate {freelancerName}
          </h3>
          <Button
            onClick={handleClose}
            icon="×"
            variant="icon"
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            disabled={isLoading}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-2xl transition-colors ${star <= (hoveredRating || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                    } hover:text-yellow-400`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={isLoading}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Share your experience working with this freelancer..."
              maxLength={500}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              text="Cancel"
              onClick={handleClose}
              variant="google"
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              text={isLoading ? "Submitting..." : "Submit Rating"}
              type="submit"
              variant="blue"
              className="flex-1"
              disabled={isLoading || rating === 0}
            />
          </div>

        </form>
      </div>
    </div>
  );
};

export default RatingModal;