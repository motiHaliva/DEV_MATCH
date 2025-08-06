import { useAuth } from '../auth/AuthContext';
import FreelancerProfile from './freelancerProfile/components/FreelancerProfile';
import ClientProfile from './clientProfile/components/ClientProfile';

const ProfileRouter = () => {
  const { currentUser, loading } = useAuth();
  console.log(currentUser.role);
  

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">Please log in to view your profile</div>
      </div>
    );
  }

  if (currentUser.role === 'client') {
    return <ClientProfile />;
  } else if (currentUser.role === 'freelancer') {
    return <FreelancerProfile />;
  } else {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">Unknown user role</div>
      </div>
    );
  }
};

export default ProfileRouter;