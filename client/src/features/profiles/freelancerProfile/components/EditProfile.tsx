import Input from '../../../../ui/Input';
import Button from '../../../../ui/Button';
import Select from 'react-select';
import type { EditProfilePropsFreelance  } from '../../type';
import { FaUser, FaBriefcase, FaTags } from 'react-icons/fa';
import { validateFreelancerProfile } from '../../../../utils/validateFreelancerProfile';
import { useState } from 'react';

const EditProfile = ({
  profile,
  allTitles,
  allSkills,
  selectedTitles,
  selectedSkills,
  isNewProfile,
  handleChange,
  setSelectedTitles,
  setSelectedSkills,
  handleSave
}: EditProfilePropsFreelance) => {
  const [formError, setFormError] = useState('');

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '48px',
      borderRadius: '12px',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#3b82f6',
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      borderRadius: '8px',
      backgroundColor: '#f3f4f6',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      fontWeight: '500',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#9ca3af',
    }),
  };

  const onSave = () => {
    setFormError('');
    const isValid = validateFreelancerProfile(profile, setFormError);
    if (isValid) {
      handleSave();
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-8">
          <FaUser className="text-blue-600 text-xl" />
          <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Input 
              label="First Name" 
              name="firstname" 
              value={profile.firstname} 
              onChange={handleChange} 
            />
            <Input 
              label="Last Name" 
              name="lastname" 
              value={profile.lastname} 
              onChange={handleChange} 
            />
          </div>
          <div className="space-y-6">
            <Input 
              label="Email" 
              name="email" 
              type="email" 
              value={profile.email} 
              onChange={handleChange} 
            />
            <Input 
              label="Location" 
              name="location" 
              value={profile.location || ""} 
              onChange={handleChange} 
            />
          </div>
        </div>
      </div>

      {/* Professional Information Section */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-8">
          <FaBriefcase className="text-blue-600 text-xl" />
          <h2 className="text-2xl font-bold text-gray-900">Professional Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Input 
            label="Professional Title" 
            name="headline" 
            value={profile.headline || ""} 
            onChange={handleChange} 
          />
          <Input 
            label="Years of Experience" 
            name="experience_years" 
            type="number" 
             value={profile.experience_years !== undefined ? profile.experience_years.toString() : ''}
            onChange={handleChange} 
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Professional Bio
          </label>
          <textarea
            name="bio"
            value={profile.bio || ""} 
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Tell about yourself, your experience and the services you offer..."
          required
          />
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            name="is_available"
            checked={!!profile.is_available}
            onChange={handleChange}
            id="available"
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="available" className="text-base font-medium text-gray-800 select-none flex items-center gap-2">
            <span>Available for work</span>
            <span className="text-sm text-gray-500">(will be displayed on your profile)</span>
          </label>
        </div>
      </div>

      {/* Skills and Titles Section */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-8">
          <FaTags className="text-blue-600 text-xl" />
          <h2 className="text-2xl font-bold text-gray-900">Skills & Specializations</h2>
        </div>
        
        <div className="space-y-8">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-4">
              Select Specializations:
            </label>
            <Select
              isMulti
              options={allTitles.map((title) => ({ label: title.name, value: title.id }))}
              value={selectedTitles}
              onChange={(selected) => setSelectedTitles(selected as { label: string; value: number }[])}
              styles={customSelectStyles}
              classNamePrefix="react-select"
              placeholder="Select specializations..."
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary25: '#dbeafe',
                  primary: '#3b82f6',
                },
              })}
            />
            <p className="mt-2 text-sm text-gray-500">
              Select the professional areas you specialize in
            </p>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-4">
              Select Skills:
            </label>
            <Select
              isMulti
              options={allSkills.map((skill) => ({ label: skill.name, value: skill.id }))}
              value={selectedSkills}
              onChange={(selected) => setSelectedSkills(selected as { label: string; value: number }[])}
              styles={customSelectStyles}
              classNamePrefix="react-select"
              placeholder="Select skills..."
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary25: '#fef3c7',
                  primary: '#f59e0b',
                },
              })}
            />
            <p className="mt-2 text-sm text-gray-500">
              Select your technical and professional skills
            </p>
          </div>
        </div>
      </div>

      {/* Save Button and Error Display */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        {formError && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md text-center font-semibold">
            {formError}
          </div>
        )}
        <div className="flex justify-center">
          <Button 
            text={isNewProfile ? "Create Profile ✨" : "Save Changes 💾"} 
            variant="blue" 
            onClick={onSave} 
          />
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
