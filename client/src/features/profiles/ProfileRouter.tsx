
import { useAuth } from '../auth/AuthContext';
import FreelancerProfile from './freelancerProfile/components/FreelancerProfile';
import ClientProfile from './clientProfile/components/ClientProfile';

const ProfileRouter = () => {
  const { currentUser, loading } = useAuth();
  
  console.log("ProfileRouter - CurrentUser:", currentUser);
  console.log("ProfileRouter - User role:", currentUser?.role);
 
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

  // בדיקה מפורטת יותר של הרול
  if (currentUser.role === 'client') {
    console.log("Routing to ClientProfile");
    return <ClientProfile />;
  } else if (currentUser.role === 'freelancer') {
    console.log("Routing to FreelancerProfile");
    return <FreelancerProfile />;
  } else {
    console.error("Unknown role:", currentUser.role);
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">Unknown user role: {currentUser.role}</div>
      </div>
    );
  }
};

export default ProfileRouter;