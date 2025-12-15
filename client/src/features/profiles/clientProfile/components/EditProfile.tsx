import { useState } from 'react';
import Input from '../../../../ui/Input';
import Button from '../../../../ui/Button';
import { updateMyClientProfile } from '../../../../api/clientApi'
import { FaUser, FaEnvelope, FaEdit } from 'react-icons/fa';
import type { EditProfilePropsProject } from '../../type';
import { toast } from "react-toastify";
import { validateClientProfile } from '../../../../utils/validateClientProfile'; 

const EditProfile = ({ profile, onProfileUpdated, onCancel }: EditProfilePropsProject) => {
  const [formData, setFormData] = useState({
    id: profile.id, 
    firstname: profile.firstname,
    lastname: profile.lastname,
    email: profile.email,
    phone: profile.phone,
    profile_image: profile.profile_image,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const isValid = validateClientProfile(formData, setError);
    if (!isValid) {
      return; 
    }

    setLoading(true);
    try {
      const updatedData = await updateMyClientProfile(formData);
      onProfileUpdated(updatedData);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error updating profile';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-8">
        <FaEdit className="text-blue-600 text-2xl" />
        <h2 className="text-3xl font-bold text-gray-900">Edit Profile</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            placeholder="Enter your first name"
            icon={<FaUser />}
          />
          <Input
            label="Last Name"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            placeholder="Enter your last name"
            icon={<FaUser />}
          />
        </div>

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email address"
          icon={<FaEnvelope />}
        />


               <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            type="tel"
            
          />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-4 justify-end pt-6">
          <Button text="Cancel" variant="blue" onClick={onCancel} type="button" />
          <Button
            text={loading ? 'Updating...' : 'Update Profile'}
            variant="blue"
            type="submit"
            disabled={loading}
            icon={<FaEdit />}
          />
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
