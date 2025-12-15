import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mutate } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // שמור את הtoken
      localStorage.setItem('token', token);
      
      // רענן את המשתמש
      mutate().then(() => {
        toast.success('Successfully logged in with Google!');
        navigate('/profile');
      });
    } else {
      toast.error('Authentication failed');
      navigate('/login');
    }
  }, [searchParams, navigate, mutate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Completing Google login...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;