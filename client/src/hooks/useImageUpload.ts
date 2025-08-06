import { useState } from 'react';

interface UseImageUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  onSuccess?: (imageData: string) => void;
  onError?: (error: string) => void;
}

interface UseImageUploadReturn {
  imageLoading: boolean;
  imageError: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearError: () => void;
}

export const useImageUpload = (options: UseImageUploadOptions = {}): UseImageUploadReturn => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    onSuccess,
    onError
  } = options;

  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // בדיקת גודל הקובץ
    if (file.size > maxSize) {
      const errorMsg = `File size must be less than ${maxSize / (1024 * 1024)}MB`;
      setImageError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // בדיקת סוג הקובץ
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Please select a valid image file (JPEG, PNG, GIF, or WebP)';
      setImageError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setImageError(null);
    setImageLoading(true);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        setImageLoading(false);
        onSuccess?.(result);
      } catch (error) {
        const errorMsg = 'Failed to process image';
        setImageError(errorMsg);
        setImageLoading(false);
        onError?.(errorMsg);
      }
    };

    reader.onerror = () => {
      const errorMsg = 'Failed to read image file';
      setImageError(errorMsg);
      setImageLoading(false);
      onError?.(errorMsg);
    };

    reader.readAsDataURL(file);
  };

  const clearError = () => {
    setImageError(null);
  };

  return {
    imageLoading,
    imageError,
    handleImageUpload,
    clearError
  };
};