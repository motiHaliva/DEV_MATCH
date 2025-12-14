import { useState, useEffect } from 'react';
import Button from '../../ui/Button';
import type { Post } from './type';
import { MdOutlinePostAdd, MdPostAdd } from "react-icons/md";
import { AiTwotoneHome } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../../api/postsApi';
import { useImageUpload } from '../../hooks/useImageUpload'; 
import { useAuth } from "../../features/auth/AuthContext";
import { toast } from "react-toastify"; 

type CreatePostProps = {
  onPostCreated?: () => void;
}

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [formData, setFormData] = useState<Partial<Post>>({
    content: "",
    post_type: "",
    image_url: ""
  });

  const { currentUser } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { imageLoading, imageError, handleImageUpload } = useImageUpload({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    onSuccess: (imageData) => {
      setFormData(prev => ({
        ...prev,
        image_url: imageData
      }));
    },
    onError: (errorMsg) => {
      setError(errorMsg);
    }
  });

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        post_type: currentUser?.role ?? "",
      }));
    }
  }, [currentUser]);

  const displayError = error || imageError;
  const isLoading = imageLoading || isSubmitting; // ✅ לודינג משולב

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ מונע שליחה כפולה / שליחה בזמן העלאת תמונה
    if (isLoading) return;

    setError('');
    setIsSubmitting(true);

    try {
      const payload = { ...formData };
      if (!payload.image_url) delete payload.image_url;

      await createPost(payload);

      setFormData({ content: "", post_type: currentUser?.role || "", image_url: "" });
      onPostCreated?.();
      toast.success('Post created successfully!');
      navigate("/freelancers");
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error creating post. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 h-100 relative">
      <Button
        onClick={() => navigate('/projects')}
        icon={<AiTwotoneHome className="text-xl" />}
        variant="icon"
        className="absolute right-14 top-5 bg-gradient-to-r from-brand-blueLight to-brand-blue text-white p-2 rounded-md shadow-md transition duration-200 hover:scale-105"
        disabled={isLoading}
      />

      <div className="flex items-center gap-3 mb-8">
        <MdOutlinePostAdd className="text-blue-600 text-2xl" />
        <h2 className="text-3xl font-bold text-gray-900">Add Post</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Project Description</label>
          <textarea
            name="content"
            value={formData.content || ''}
            onChange={handleChange}
            className="h-72 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Describe your project in detail..."
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          />

          {imageLoading ? (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p>Uploading image...</p>
            </div>
          ) : formData.image_url ? (
            <img
              src={formData.image_url}
              alt="Preview"
              className="max-h-48 rounded-lg shadow-md"
            />
          ) : (
            <p className="text-gray-400">No image selected</p>
          )}
        </div>

        {displayError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm font-medium">{displayError}</p>
          </div>
        )}

        <Button
          text={isSubmitting ? "Creating post..." : "Add Post"}
          variant="blue"
          type="submit"
          icon={isSubmitting ? undefined : <MdPostAdd />}
          disabled={isLoading}
          className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        />
      </form>
    </div>
  );
};

export default CreatePost;
